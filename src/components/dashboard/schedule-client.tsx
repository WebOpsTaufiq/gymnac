"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default function ScheduleClient({ gymId, initialClasses, trainers }: { gymId: string, initialClasses: any[], trainers: string[] }) {
  const supabase = createClient();
  const [classes, setClasses] = useState<any[]>(initialClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simple 7 day view starting from today
  const days = Array.from({length: 7}, (_, i) => {
     const d = new Date();
     d.setDate(d.getDate() + i);
     return d;
  });

  const getClassesForDate = (date: Date) => {
     const dateString = date.toDateString();
     return classes.filter(c => new Date(c.scheduled_at).toDateString() === dateString);
  };

  const handleSave = (newClass: any) => {
     setClasses(prev => [...prev, newClass].sort((a,b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Class Schedule</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Next 7 days rolling calendar</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
           <PlusIcon /> Add Class
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
         {days.map((day, idx) => {
            const dayClasses = getClassesForDate(day);
            const isToday = idx === 0;

            return (
               <div key={idx} className={`bg-white rounded-2xl border shadow-sm flex flex-col min-h-[400px] ${isToday ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200'}`}>
                  <div className={`p-4 border-b text-center rounded-t-2xl ${isToday ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                     <p className={`text-xs font-black uppercase tracking-widest ${isToday?'text-indigo-100':'text-slate-400'}`}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                     </p>
                     <p className="text-xl font-bold mt-1.5">{day.getDate()}</p>
                  </div>
                  
                  <div className="p-3 flex-1 bg-slate-50/30 space-y-3 overflow-y-auto">
                     {dayClasses.length === 0 ? (
                        <p className="text-[11px] text-center font-bold text-slate-300 mt-4">No classes</p>
                     ) : (
                        dayClasses.map(c => (
                           <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors group cursor-default">
                              <p className="text-[10px] font-black text-indigo-500 mb-1">
                                 {new Date(c.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                 <span className="text-slate-300 mx-1">•</span> 
                                 {c.duration}m
                              </p>
                              <h4 className="text-sm font-bold text-slate-900 leading-tight mb-2">{c.name}</h4>
                              <div className="flex justify-between items-end border-t border-slate-50 pt-2 mt-2">
                                 <span className="text-[10px] font-semibold text-slate-500">by {c.trainer_name || 'Staff'}</span>
                                 <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{c.capacity} limit</span>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            )
         })}
      </div>

      <ClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} gymId={gymId} supabase={supabase} onSave={handleSave} trainers={trainers} />
    </div>
  )
}

function ClassModal({ isOpen, onClose, gymId, supabase, onSave, trainers }: any) {
  const [formData, setFormData] = useState({ name: '', trainer_name: '', scheduled_date: '', scheduled_time: '', duration: '60', capacity: '20' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     setSaving(true);
     
     // Combine date and time
     const scheduled_at = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString();

     const payload = { 
        gym_id: gymId, 
        name: formData.name,
        trainer_name: formData.trainer_name,
        scheduled_at,
        duration: Number(formData.duration),
        capacity: Number(formData.capacity)
     };

     const { data } = await supabase.from('classes').insert(payload).select().single();
     if (data) onSave(data);
     setSaving(false);
     onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Schedule Class</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Class Name (e.g. HIIT Power)" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium bg-slate-50" />
             
             <select required value={formData.trainer_name} onChange={e=>setFormData({...formData, trainer_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium bg-slate-50">
                <option value="" disabled>Select Trainer...</option>
                {trainers.map((t: string, i: number) => <option key={i} value={t}>{t}</option>)}
                <option value="TBD">TBD</option>
             </select>

             <div className="grid grid-cols-2 gap-3">
                <input required type="date" value={formData.scheduled_date} onChange={e=>setFormData({...formData, scheduled_date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium bg-slate-50" />
                <input required type="time" value={formData.scheduled_time} onChange={e=>setFormData({...formData, scheduled_time: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium bg-slate-50" />
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">Duration (m)</label>
                   <input required type="number" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium bg-slate-50" />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">Capacity</label>
                   <input required type="number" value={formData.capacity} onChange={e=>setFormData({...formData, capacity: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium bg-slate-50" />
                </div>
             </div>
             
             <div className="flex gap-3 pt-4">
               <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
               <button disabled={saving} type="submit" className="flex-1 bg-slate-900 text-white text-sm font-bold py-3 rounded-xl disabled:opacity-50">
                  {saving ? 'Saving...' : 'Publish'}
               </button>
             </div>
          </form>
       </div>
    </div>
  )
}
