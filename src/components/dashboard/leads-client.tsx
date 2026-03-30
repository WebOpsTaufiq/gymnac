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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex overflow-x-auto no-scrollbar space-x-1 sm:pr-6 sm:border-r border-slate-200 pb-2 sm:pb-0">
             {['All', 'New', 'Contacted', 'Trial', 'Converted', 'Lost'].map(f => (
               <button 
                  key={f} onClick={() => setFilter(f)} 
                  className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
               >
                  {f}
               </button>
             ))}
          </div>
          <span className="text-sm font-bold text-slate-400 whitespace-nowrap">{filteredLeads.length} leads</span>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 justify-center sm:w-auto">
          <PlusIcon /> Add Lead
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Lead Name & Contact</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No leads match this criteria.</td></tr>
              ) : (
                filteredLeads.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-900">{l.name}</p>
                       <p className="text-xs font-semibold text-slate-500">{l.phone || 'No phone'} {l.email ? `• ${l.email}` : ''}</p>
                       {l.notes && <p className="text-[11px] text-slate-400 truncate max-w-xs mt-1 italic">"{l.notes}"</p>}
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {l.source || 'Unknown'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <select 
                          value={l.status || 'new'} 
                          onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest outline-none cursor-pointer border shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] appearance-none ${
                             l.status === 'converted' ? 'bg-green-100 text-green-700 border-green-200 focus:ring-green-500' :
                             l.status === 'lost' ? 'bg-slate-100 text-slate-600 border-slate-200 focus:ring-slate-500' :
                             l.status === 'contacted' ? 'bg-amber-100 text-amber-700 border-amber-200 focus:ring-amber-500' :
                             l.status === 'trial' ? 'bg-purple-100 text-purple-700 border-purple-200 focus:ring-purple-500' :
                             'bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-500'
                          }`}
                       >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="trial">Trial/Visit</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                       </select>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                       {new Date(l.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDelete(l.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><TrashIcon /></button>
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm sm:p-0">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h2 className="text-lg font-bold text-slate-900">New Lead</h2>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><XIcon /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
             <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Full Name *" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50 focus:bg-white" />
             <input required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="Phone Number *" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50 focus:bg-white" />
             <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="Email (Optional)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50 focus:bg-white" />
             <select required value={formData.source} onChange={e=>setFormData({...formData, source: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50 focus:bg-white cursor-pointer appearance-none">
                <option value="Walk-in">Walk-in Traffic</option>
                <option value="Instagram">Instagram/Social</option>
                <option value="Referral">Member Referral</option>
                <option value="Google">Google Search</option>
                <option value="Website">Gym Website</option>
             </select>
             <textarea value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} placeholder="Notes (goals, timeline, etc.)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50 focus:bg-white resize-none h-24"></textarea>
             
             <button disabled={saving} type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm mt-4">
                {saving ? 'Saving...' : 'Capture Lead'}
             </button>
          </form>
       </div>
    </div>
  )
}
