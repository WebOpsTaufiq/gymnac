"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const XIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function LeadsClient({ gymId, initialLeads }: { gymId: string, initialLeads: any[] }) {
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLeads = useMemo(() => {
     if (filter === "All") return leads;
     return leads.filter(l => (l.status || 'new').toLowerCase() === filter.toLowerCase());
  }, [leads, filter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
     setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
     await supabase.from('leads').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
     if (!confirm("Delete this lead?")) return;
     setLeads(prev => prev.filter(l => l.id !== id));
     await supabase.from('leads').delete().eq('id', id);
  };

  const handleSaveLead = (newLead: any) => {
     setLeads(prev => [newLead, ...prev]);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex overflow-x-auto no-scrollbar space-x-1 sm:pr-6 sm:border-r border-gray-100 pb-2 sm:pb-0">
             {['All', 'New', 'Contacted', 'Trial', 'Converted', 'Lost'].map(f => (
               <button 
                  key={f} onClick={() => setFilter(f)} 
                  className={`px-4 py-2.5 text-[13px] font-black tracking-widest uppercase rounded-2xl transition-colors whitespace-nowrap ${filter === f ? 'bg-[#111111] text-[#ccff00] shadow-sm' : 'text-gray-400 hover:bg-[#FAFAFA] hover:text-[#111111]'}`}
               >
                  {f}
               </button>
             ))}
          </div>
          <span className="text-[13px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">{filteredLeads.length} leads</span>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-[#111111] text-[#ccff00] text-[13px] font-black tracking-widest uppercase rounded-full hover:bg-[#ccff00] hover:text-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all flex items-center gap-2 justify-center sm:w-auto shrink-0">
          <PlusIcon /> Add Lead
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Lead Name & Contact</th>
                <th className="px-8 py-5">Source</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date Added</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeads.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-bold text-[13px] tracking-widest uppercase bg-[#FAFAFA]">No leads match this criteria.</td></tr>
              ) : (
                filteredLeads.map(l => (
                  <tr key={l.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-8 py-5">
                       <p className="text-[15px] font-black text-[#111111]">{l.name}</p>
                       <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">{l.phone || 'No phone'} {l.email ? `• ${l.email}` : ''}</p>
                       {l.notes && <p className="text-[11px] text-gray-500 truncate max-w-xs mt-2 italic border-l-2 border-[#ccff00] pl-2 py-0.5">"{l.notes}"</p>}
                    </td>
                    <td className="px-8 py-5">
                       <span className="px-3 py-1.5 bg-white text-[#111111] border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {l.source || 'Unknown'}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <select 
                          value={l.status || 'new'} 
                          onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer border shadow-sm appearance-none ${
                             l.status === 'converted' ? 'bg-[#111111] text-[#ccff00] border-[#111111]' :
                             l.status === 'lost' ? 'bg-red-500 text-white border-red-500' :
                             l.status === 'contacted' ? 'bg-[#FAFAFA] text-[#111111] border-gray-200' :
                             l.status === 'trial' ? 'bg-blue-500 text-white border-blue-500' :
                             'bg-white text-gray-400 border-gray-200'
                          }`}
                       >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="trial">Trial/Visit</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                       </select>
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-gray-400">
                       {new Date(l.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button onClick={() => handleDelete(l.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><TrashIcon /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} gymId={gymId} supabase={supabase} onSave={handleSaveLead} />
    </div>
  );
}

function LeadModal({ isOpen, onClose, gymId, supabase, onSave }: any) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', source: 'Walk-in', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     setSaving(true);
     const payload = { gym_id: gymId, ...formData, status: 'new' };
     const { data } = await supabase.from('leads').insert(payload).select().single();
     if (data) onSave(data);
     setSaving(false);
     onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm sm:p-0">
       <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
             <h2 className="text-2xl font-black text-[#111111] tracking-tighter">New Lead</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-[#111111] transition-colors"><XIcon /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
             <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Full Name *" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white text-[#111111] transition-colors placeholder:text-gray-300" />
             <input required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="Phone Number *" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white text-[#111111] transition-colors placeholder:text-gray-300" />
             <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="Email (Optional)" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white text-[#111111] transition-colors placeholder:text-gray-300" />
             <select required value={formData.source} onChange={e=>setFormData({...formData, source: e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white text-[#111111] transition-colors cursor-pointer appearance-none">
                <option value="Walk-in">Walk-in Traffic</option>
                <option value="Instagram">Instagram/Social</option>
                <option value="Referral">Member Referral</option>
                <option value="Google">Google Search</option>
                <option value="Website">Gym Website</option>
             </select>
             <textarea value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} placeholder="Notes (goals, timeline, etc.)" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white text-[#111111] transition-colors resize-none h-24 placeholder:text-gray-300"></textarea>
             
             <button disabled={saving} type="submit" className="w-full bg-[#111111] text-[#ccff00] font-black uppercase tracking-widest text-[13px] py-4 rounded-full hover:bg-[#ccff00] hover:text-[#111111] transition-colors shadow-xl shadow-black/10 mt-4 disabled:opacity-50">
                {saving ? 'Saving...' : 'Capture Lead'}
             </button>
          </form>
       </div>
    </div>
  )
}
