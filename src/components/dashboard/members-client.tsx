"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// --- Inline SVGs ---
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MoreVertical = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
const XIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const WhatsAppIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;

export default function MembersClient({ initialMembers, gymId }: { initialMembers: any[], gymId: string }) {
  const supabase = createClient();
  const [members, setMembers] = useState<any[]>(initialMembers);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  
  // Modals & Menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Click outside to close dropdown
  useEffect(() => {
     const clickHandler = () => setActiveMenuId(null);
     document.addEventListener('click', clickHandler);
     return () => document.removeEventListener('click', clickHandler);
  }, []);

  // Filter Logic
  const filteredMembers = useMemo(() => {
     let res = members;
     if (filter !== "All") {
        res = res.filter(m => (m.status || 'active').toLowerCase() === filter.toLowerCase());
     }
     if (search) {
        const lower = search.toLowerCase();
        res = res.filter(m => m.full_name?.toLowerCase().includes(lower) || m.email?.toLowerCase().includes(lower) || m.phone?.includes(lower));
     }
     return res;
  }, [members, filter, search]);

  // Handlers
  const handleDelete = async (id: string, e: any) => {
     e.stopPropagation();
     setActiveMenuId(null);
     if (confirm("Are you super sure you want to delete this member? All their data will be lost.")) {
        setMembers(prev => prev.filter(m => m.id !== id));
        await supabase.from('members').delete().eq('id', id);
     }
  };

  const toggleAtRisk = async (id: string, currentStatus: string, e: any) => {
     e.stopPropagation();
     setActiveMenuId(null);
     const newStatus = currentStatus === 'at-risk' ? 'active' : 'at-risk';
     setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
     await supabase.from('members').update({ status: newStatus }).eq('id', id);
  };

  const handleEdit = (member: any, e: any) => {
     e.stopPropagation();
     setActiveMenuId(null);
     setEditingMember(member);
     setIsModalOpen(true);
  };

  const handleSaveModal = (savedMember: any, isEdit: boolean) => {
     if (isEdit) {
        setMembers(prev => prev.map(m => m.id === savedMember.id ? savedMember : m));
        if (selectedMember?.id === savedMember.id) setSelectedMember(savedMember);
     } else {
        setMembers(prev => [savedMember, ...prev]);
     }
  };

  const handleDrawerUpdate = (memberId: string, updates: any) => {
     setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updates } : m));
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative z-20">
        
        {/* Left: Filters & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex overflow-x-auto no-scrollbar space-x-1 sm:pr-6 sm:border-r border-gray-100 pb-2 sm:pb-0">
             {['All', 'Active', 'At-Risk', 'Frozen', 'Trial', 'Expired'].map(f => (
               <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition-colors whitespace-nowrap ${filter === f ? 'bg-[#111111] text-[#ccff00] shadow-sm' : 'text-gray-400 hover:bg-[#FAFAFA] hover:text-[#111111]'}`}
               >
                  {f}
               </button>
             ))}
          </div>
          <span className="text-sm font-bold text-gray-400 whitespace-nowrap">{filteredMembers.length} members</span>
        </div>
        
        {/* Right: Search & Add */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-64">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
             <input 
               type="text" 
               placeholder="Search names, emails..." 
               value={search} 
               onChange={e => setSearch(e.target.value)} 
               className="w-full pl-12 pr-4 py-3 text-sm font-bold border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#FAFAFA] focus:bg-white transition-all shadow-sm text-[#111111]" 
             />
          </div>
          <button 
            onClick={() => { setEditingMember(null); setIsModalOpen(true); }} 
            className="px-6 py-3 bg-[#111111] text-[#ccff00] text-sm font-black tracking-widest uppercase rounded-full hover:bg-[#ccff00] hover:text-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all flex items-center gap-2 shrink-0"
          >
            <PlusIcon /> Add Member
          </button>
        </div>
      </div>

      {/* 2. MEMBERS TABLE */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Member Name</th>
                <th className="px-8 py-5">Plan Name</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Renewal Date</th>
                <th className="px-8 py-5">Monthly Value</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold text-sm bg-[#FAFAFA]">
                      {search || filter !== 'All' ? "No members match your filters." : "You have no members yet. Add your first member!"}
                   </td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr 
                    key={m.id} 
                    className="hover:bg-[#FAFAFA] transition-colors group cursor-pointer" 
                    onClick={() => { setSelectedMember(m); setIsDrawerOpen(true); }}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-[#ccff00] text-[#111111] flex items-center justify-center font-black text-lg shrink-0 border border-[#ccff00]/50 shadow-sm">
                          {m.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#111111] group-hover:text-[#ccff00] transition-colors">{m.full_name}</p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">{m.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-5">
                       <span className="inline-flex px-3 py-1 bg-white text-[#111111] border border-gray-200 rounded-lg text-xs font-black tracking-wide">
                          {m.plan_name || 'Standard'}
                       </span>
                    </td>
                    
                    <td className="px-8 py-5">
                       <StatusBadge status={m.status || 'active'} />
                    </td>

                    <td className="px-8 py-5">
                       <RenewalText dateStr={m.renewal_date} />
                    </td>

                    <td className="px-8 py-5 text-[15px] font-black text-[#111111]">
                       ₹{m.plan_price || 0}
                    </td>

                    <td className="px-8 py-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === m.id ? null : m.id); }} 
                         className="p-2 text-gray-400 hover:text-[#111111] rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-gray-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                       >
                         <MoreVertical />
                       </button>
                       
                       {/* Dropdown Menu */}
                       {activeMenuId === m.id && (
                         <div className="absolute right-14 top-12 w-48 bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[20px] z-50 py-2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                           <button onClick={(e) => handleEdit(m, e)} className="w-full text-left px-5 py-3 text-[13px] text-[#111111] hover:bg-[#FAFAFA] font-black transition-colors">Edit Member</button>
                           <button onClick={(e) => toggleAtRisk(m.id, m.status || 'active', e)} className="w-full text-left px-5 py-3 text-[13px] text-[#111111] hover:bg-[#FAFAFA] font-black transition-colors border-y border-gray-50">Mark {m.status === 'at-risk' ? 'Active' : 'At-Risk'}</button>
                           <button onClick={(e) => handleDelete(m.id, e)} className="w-full text-left px-5 py-3 text-[13px] text-red-500 hover:bg-red-50 font-black transition-colors">Delete Permanently</button>
                         </div>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MEMBER MODAL */}
      <MemberModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         member={editingMember} 
         gymId={gymId} 
         supabase={supabase}
         onSave={handleSaveModal}
      />

      {/* 4. MEMBER DRAWER */}
      <MemberDrawer 
         isOpen={isDrawerOpen} 
         onClose={() => setIsDrawerOpen(false)} 
         member={selectedMember} 
         supabase={supabase}
         onUpdate={handleDrawerUpdate}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-[#ccff00] text-[#111111] border-[#ccff00]',
    'at-risk': 'bg-red-500 text-white border-red-500',
    frozen: 'bg-blue-500 text-white border-blue-500',
    trial: 'bg-purple-500 text-white border-purple-500',
    expired: 'bg-[#111111] text-gray-400 border-[#111111]'
  };
  const c = map[status.toLowerCase()] || 'bg-gray-100 text-[#111111] border-gray-200';
  return <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border rounded-[10px] ${c}`}>{status}</span>;
}

function RenewalText({ dateStr }: { dateStr: string }) {
  if (!dateStr) return <span className="text-gray-400 text-xs font-bold">Not set</span>;
  const d = new Date(dateStr);
  const diffDays = Math.ceil((d.getTime() - new Date().getTime()) / 86400000);
  
  if (diffDays < 0) return <span className="text-white text-[11px] font-black uppercase tracking-widest bg-red-500 px-3 py-1.5 rounded-[10px]">Expired</span>;
  if (diffDays <= 7) return <span className="text-[#111111] text-[11px] font-black uppercase tracking-widest bg-[#ccff00] px-3 py-1.5 rounded-[10px] animate-pulse">In {diffDays} days</span>;
  return <span className="text-[#111111] text-sm font-black">{d.toLocaleDateString([], {month:'short', day:'numeric'})}</span>;
}

function MemberModal({ isOpen, onClose, member, gymId, onSave, supabase }: any) {
  const [formData, setFormData] = useState({
     full_name: member?.full_name || '',
     email: member?.email || '',
     phone: member?.phone || '',
     plan_name: member?.plan_name || '',
     plan_price: member?.plan_price || '',
     renewal_date: member?.renewal_date ? member.renewal_date.split('T')[0] : '', 
     status: member?.status || 'active'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
     if (isOpen) {
        setFormData({
           full_name: member?.full_name || '',
           email: member?.email || '',
           phone: member?.phone || '',
           plan_name: member?.plan_name || '',
           plan_price: member?.plan_price || '',
           renewal_date: member?.renewal_date ? member.renewal_date.split('T')[0] : '',
           status: member?.status || 'active'
        });
     }
  }, [isOpen, member]);

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     setSaving(true);
     
     const payload = {
        gym_id: gymId,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        plan_name: formData.plan_name,
        plan_price: Number(formData.plan_price) || 0,
        renewal_date: formData.renewal_date || null,
        status: formData.status
     };

     if (member?.id) {
        const { data } = await supabase.from('members').update(payload).eq('id', member.id).select().single();
        if (data) onSave(data, true);
     } else {
        const { data } = await supabase.from('members').insert(payload).select().single();
        if (data) onSave(data, false);
     }
     
     setSaving(false);
     onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm sm:p-0">
       <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
             <h2 className="text-2xl font-black text-[#111111] tracking-tighter">{member ? 'Edit Member' : 'Add New Member'}</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-[#111111] transition-colors"><XIcon /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
             <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Member Details</label>
                <div className="space-y-4">
                   <input required value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} placeholder="Full Name *" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-sm font-bold transition-all shadow-sm bg-[#FAFAFA] focus:bg-white text-[#111111] placeholder:text-gray-300" />
                   <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="Email Address" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-sm font-bold transition-all shadow-sm bg-[#FAFAFA] focus:bg-white text-[#111111] placeholder:text-gray-300" />
                   <input value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="Phone Number (e.g. 919876543210)" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-sm font-bold transition-all shadow-sm bg-[#FAFAFA] focus:bg-white text-[#111111] placeholder:text-gray-300" />
                </div>
             </div>
             <div className="pt-4 border-t border-gray-50">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 mt-2">Subscription Details</label>
                <div className="space-y-4">
                   <input required value={formData.plan_name} onChange={e=>setFormData({...formData, plan_name: e.target.value})} placeholder="Plan Name (e.g. Standard Yearly) *" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-sm font-bold transition-all shadow-sm bg-[#FAFAFA] focus:bg-white text-[#111111] placeholder:text-gray-300" />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</span>
                        <input required type="number" value={formData.plan_price} onChange={e=>setFormData({...formData, plan_price: e.target.value})} placeholder="Price *" className="w-full pl-10 pr-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-sm font-bold transition-all shadow-sm bg-[#FAFAFA] focus:bg-white text-[#111111] placeholder:text-gray-300" />
                      </div>
                      <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-sm font-bold shadow-sm bg-white cursor-pointer text-[#111111] appearance-none">
                         <option value="active">Active</option>
                         <option value="at-risk">At-Risk</option>
                         <option value="frozen">Frozen</option>
                         <option value="trial">Trial</option>
                         <option value="expired">Expired</option>
                      </select>
                   </div>
                   <input required type="date" value={formData.renewal_date} onChange={e=>setFormData({...formData, renewal_date: e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-sm font-bold shadow-sm bg-white text-[#111111]" />
                </div>
             </div>
             
             <button disabled={saving} type="submit" className="w-full bg-[#111111] text-[#ccff00] font-black py-4 rounded-full hover:bg-[#ccff00] hover:text-[#111111] transition-colors shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center mt-8">
                {saving ? 'Saving...' : 'Save Member Data'}
             </button>
          </form>
       </div>
    </div>
  )
}

function MemberDrawer({ isOpen, onClose, member, supabase, onUpdate }: any) {
  const [tab, setTab] = useState('Overview');
  const [checkins, setCheckins] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     if (isOpen && member) {
        setNotes(member.notes || '');
        setTab('Overview');
        setLoading(true);
        Promise.all([
           supabase.from('checkins').select('*').eq('member_id', member.id).order('checked_in_at', { ascending: false }).limit(20),
           supabase.from('payments').select('*').eq('member_id', member.id).order('paid_at', { ascending: false })
        ]).then(([cRes, pRes]) => {
           setCheckins(cRes.data || []);
           setPayments(pRes.data || []);
           setLoading(false);
        });
     }
  }, [isOpen, member]);

  const handleNotesBlur = async () => {
     if (notes !== member?.notes) {
        onUpdate(member.id, { notes }); 
        await supabase.from('members').update({ notes }).eq('id', member.id);
     }
  };

  const getPhoneForWhatsApp = (phone: string) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    return clean.startsWith('91') ? clean : `91${clean}`;
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#111111]/20 backdrop-blur-[1px] transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 rounded-l-[40px]">
         
         {/* Drawer Header */}
         <div className="p-8 border-b border-gray-100 flex items-start justify-between bg-[#FAFAFA] rounded-tl-[40px]">
            <div className="flex gap-5">
               <div className="w-16 h-16 rounded-full bg-[#ccff00] text-[#111111] flex items-center justify-center font-black text-2xl shrink-0 shadow-lg border border-[#ccff00]/50">
                  {member?.full_name?.charAt(0).toUpperCase()}
               </div>
               <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                     <h2 className="text-2xl font-black text-[#111111] tracking-tighter">{member?.full_name}</h2>
                     <StatusBadge status={member?.status} />
                  </div>
                  <p className="text-sm font-bold text-gray-400 mt-1">{member?.phone || 'No phone'} • {member?.email || 'No email'}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 -mr-2 text-gray-400 hover:text-[#111111] bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"><XIcon /></button>
         </div>

         {/* Drawer Tabs */}
         <div className="flex border-b border-gray-100 px-8 space-x-8 mt-4 bg-white">
            {['Overview', 'Check-ins', 'Payments', 'Notes'].map(t => (
               <button 
                 key={t} onClick={() => setTab(t)} 
                 className={`pb-4 text-[13px] font-black tracking-widest uppercase transition-colors relative ${tab === t ? 'text-[#111111]' : 'text-gray-400 hover:text-[#111111]'}`}
               >
                 {t}
                 {tab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ccff00] rounded-t-full"></div>}
               </button>
            ))}
         </div>

         {/* Drawer Body */}
         <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
            {tab === 'Overview' && (
               <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                     <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Subscription Plan</h3>
                     <div className="flex justify-between items-end mb-2">
                        <p className="text-xl font-black text-[#111111]">{member?.plan_name || 'Standard'}</p>
                        <p className="text-2xl font-black text-[#ccff00] bg-[#111111] px-3 py-1 rounded-xl">₹{member?.plan_price}</p>
                     </div>
                     <p className="text-sm font-bold text-gray-400">Renews systematically</p>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] grid grid-cols-2 gap-6">
                     <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Joined Date</p>
                        <p className="font-black text-[#111111]">{new Date(member?.joined_at || member?.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                     </div>
                     <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Renewal Date</p>
                        <RenewalText dateStr={member?.renewal_date} />
                     </div>
                  </div>
               </div>
            )}

            {tab === 'Check-ins' && (
               <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-6">
                 {loading ? <p className="text-sm font-bold text-gray-400 animate-pulse">Loading...</p> : checkins.length === 0 ? <p className="text-sm text-gray-500 font-bold p-2 text-center">No check-ins recorded yet.</p> : (
                    <div className="space-y-4">
                       {checkins.map(c => (
                          <div key={c.id} className="flex items-center gap-4 p-4 bg-[#FAFAFA] rounded-2xl border border-gray-100">
                             <div className="w-3 h-3 rounded-full bg-[#ccff00] shadow-[0_0_10px_#ccff00]"></div>
                             <p className="text-sm font-black text-[#111111] flex-1">{new Date(c.checked_in_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                             <p className="text-xs font-bold text-gray-400">{new Date(c.checked_in_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                       ))}
                    </div>
                 )}
               </div>
            )}

            {tab === 'Payments' && (
               <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
                 {loading ? <p className="text-sm font-bold text-gray-400 animate-pulse p-6">Loading...</p> : payments.length === 0 ? <p className="text-sm text-gray-500 font-bold p-8 text-center">No payments recorded.</p> : (
                    <div className="divide-y divide-gray-50">
                       {payments.map(p => (
                          <div key={p.id} className="p-6 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                             <div>
                                <p className="text-lg font-black text-[#111111] tracking-tighter">₹{p.amount}</p>
                                <p className="text-xs font-bold text-gray-400 mt-1">{new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                             </div>
                             <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm ${p.status === 'paid' ? 'bg-[#111111] text-[#ccff00]' : p.status === 'failed' ? 'bg-red-500 text-white' : 'bg-gray-200 text-[#111111]'}`}>
                                {p.status}
                             </span>
                          </div>
                       ))}
                    </div>
                 )}
               </div>
            )}

            {tab === 'Notes' && (
               <div className="h-full flex flex-col">
                  <textarea 
                     value={notes} 
                     onChange={e => setNotes(e.target.value)}
                     onBlur={handleNotesBlur}
                     placeholder="Add private notes about this member (injuries, goals, warnings)... (Auto-saves on click away)"
                     className="flex-1 w-full bg-white border border-gray-100 rounded-[32px] p-8 text-sm font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#ccff00] shadow-[0_10px_40px_rgba(0,0,0,0.02)] resize-none min-h-[350px] placeholder:text-gray-300"
                  ></textarea>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 text-center">Cloud Sync active on blur</p>
               </div>
            )}
         </div>

         {/* Drawer Footer */}
         <div className="p-6 border-t border-gray-100 bg-white shrink-0 rounded-bl-[40px]">
            <a 
               href={`https://wa.me/${getPhoneForWhatsApp(member?.phone || '')}`} 
               target="_blank" 
               rel="noreferrer" 
               className={`w-full flex items-center justify-center gap-3 py-4 rounded-full font-black text-[15px] transition-all duration-300 active:scale-95 ${member?.phone ? 'bg-[#25D366] hover:bg-[#1DA851] text-[#111111] shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:shadow-[#1DA851]/40' : 'bg-[#FAFAFA] text-gray-300 pointer-events-none border border-gray-100'}`}
            >
               <WhatsAppIcon /> {member?.phone ? 'Message on WhatsApp' : 'No Phone Number Added'}
            </a>
         </div>
      </div>
    </>
  )
}
