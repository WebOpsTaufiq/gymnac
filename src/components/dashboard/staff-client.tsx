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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
         <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Directory</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage your trainers, coaches, and receptionists.</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 justify-center shrink-0">
           <PlusIcon /> Add Staff
         </button>
      </div>

      {staff.length === 0 ? (
         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-medium text-sm">
            No staff members added yet. Add your first trainer!
         </div>
      ) : (
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map(s => (
               <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group hover:border-indigo-300 transition-colors">
                  <button onClick={() => handleDelete(s.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                     <TrashIcon />
                  </button>
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xl mb-4 shadow-inner border border-slate-200">
                     {s.full_name?.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{s.full_name}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">{s.role}</p>
                  
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                     <p className="text-sm font-medium text-slate-600 flex items-center gap-2"><span className="text-slate-400">Expertise:</span> {s.specialization || 'General'}</p>
                     <p className="text-sm font-medium text-slate-600 flex items-center gap-2"><span className="text-slate-400">Phone:</span> {s.phone || 'N/A'}</p>
                     {s.email && <p className="text-sm font-medium text-slate-600 flex items-center gap-2"><span className="text-slate-400">Email:</span> {s.email}</p>}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Add Staff Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <input required value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50" />
             <select required value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50">
                <option value="Trainer">Trainer</option>
                <option value="Coach">Coach</option>
                <option value="Manager">Manager</option>
                <option value="Receptionist">Receptionist</option>
             </select>
             <input value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} placeholder="Specialization (e.g. Yoga, Crossfit)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50" />
             <input required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50" />
             <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="Email (Optional)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50" />
             
             <div className="flex gap-3 pt-2">
               <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
               <button disabled={saving} type="submit" className="flex-1 bg-slate-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Staff'}
               </button>
             </div>
          </form>
       </div>
    </div>
  )
}
