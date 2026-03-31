"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

export default function StaffClient({ gymId, initialStaff }: { gymId: string, initialStaff: any[] }) {
  const supabase = createClient();
  const [staff, setStaff] = useState<any[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
     if (!confirm("Remove this staff member?")) return;
     setStaff(prev => prev.filter(s => s.id !== id));
     await supabase.from('staff').delete().eq('id', id);
  };

  const handleSave = (newStaff: any) => {
     setStaff(prev => [newStaff, ...prev]);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 bg-white p-8 sm:p-10 rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tighter">Staff Directory</h1>
            <p className="text-sm font-bold text-gray-400 mt-2">Manage your trainers, coaches, and receptionists.</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="relative z-10 px-6 py-3.5 bg-[#111111] text-[#ccff00] text-[13px] font-black tracking-widest uppercase rounded-full hover:bg-[#ccff00] hover:text-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all flex items-center gap-2 justify-center shrink-0">
           <PlusIcon /> Add Staff
         </button>
      </div>

      {staff.length === 0 ? (
         <div className="bg-[#FAFAFA] rounded-[40px] border-2 border-dashed border-gray-100 p-16 text-center text-gray-400 font-black tracking-widest uppercase text-[11px]">
            No staff members added yet. Add your first trainer!
         </div>
      ) : (
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map(s => (
               <div key={s.id} className="bg-white rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-8 relative group hover:border-[#ccff00] transition-colors">
                  <button onClick={() => handleDelete(s.id)} className="absolute top-6 right-6 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                     <TrashIcon />
                  </button>
                  <div className="w-20 h-20 rounded-full bg-[#111111] text-[#ccff00] flex items-center justify-center font-black text-3xl mb-6 shadow-lg shadow-black/5">
                     {s.full_name?.charAt(0)}
                  </div>
                  <h3 className="text-xl font-black text-[#111111] tracking-tighter">{s.full_name}</h3>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 mt-1">{s.role}</p>
                  
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                     <p className="text-[13px] font-bold text-[#111111] flex flex-col gap-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expertise</span> {s.specialization || 'General'}</p>
                     <p className="text-[13px] font-bold text-[#111111] flex flex-col gap-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</span> {s.phone || 'N/A'}</p>
                     {s.email && <p className="text-[13px] font-bold text-[#111111] flex flex-col gap-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span> {s.email}</p>}
                  </div>
               </div>
            ))}
         </div>
      )}

      <StaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} gymId={gymId} supabase={supabase} onSave={handleSave} />
    </div>
  )
}

function StaffModal({ isOpen, onClose, gymId, supabase, onSave }: any) {
  const [formData, setFormData] = useState({ full_name: '', role: 'Trainer', specialization: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     setSaving(true);
     const payload = { gym_id: gymId, ...formData };
     const { data } = await supabase.from('staff').insert(payload).select().single();
     if (data) onSave(data);
     setSaving(false);
     onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm">
       <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-sm overflow-hidden p-8 animate-in zoom-in-95 duration-200">
          <h2 className="text-2xl font-black text-[#111111] tracking-tighter mb-6">Add Staff Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <input required value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} placeholder="Full Name" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white transition-colors text-[#111111]" />
             <select required value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white transition-colors text-[#111111] appearance-none cursor-pointer">
                <option value="Trainer">Trainer</option>
                <option value="Coach">Coach</option>
                <option value="Manager">Manager</option>
                <option value="Receptionist">Receptionist</option>
             </select>
             <input value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} placeholder="Specialization (e.g. Yoga, Crossfit)" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white transition-colors text-[#111111]" />
             <input required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="Phone Number" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white transition-colors text-[#111111]" />
             <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="Email (Optional)" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white transition-colors text-[#111111]" />
             
             <div className="flex gap-4 pt-4">
               <button type="button" onClick={onClose} className="flex-1 px-5 py-3.5 text-[13px] font-black uppercase tracking-widest text-gray-400 hover:text-[#111111] hover:bg-[#FAFAFA] rounded-full transition-colors">Cancel</button>
               <button disabled={saving} type="submit" className="flex-1 bg-[#111111] text-[#ccff00] text-[13px] font-black uppercase tracking-widest py-3.5 rounded-full hover:bg-[#ccff00] hover:text-[#111111] transition-colors shadow-xl shadow-black/10 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Staff'}
               </button>
             </div>
          </form>
       </div>
    </div>
  )
}
