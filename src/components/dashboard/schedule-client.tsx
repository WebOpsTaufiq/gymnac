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
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
         <div>
            <h1 className="text-3xl font-black text-[#111111] tracking-tighter">Class Schedule</h1>
            <p className="text-sm font-bold text-gray-400 mt-1">Next 7 days rolling calendar</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-[#111111] text-[#ccff00] text-sm font-black tracking-widest uppercase rounded-full hover:bg-[#ccff00] hover:text-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all flex items-center gap-2">
           <PlusIcon /> Add Class
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
         {days.map((day, idx) => {
            const dayClasses = getClassesForDate(day);
            const isToday = idx === 0;

            return (
               <div key={idx} className={`bg-white rounded-[32px] border flex flex-col min-h-[450px] overflow-hidden ${isToday ? 'border-[#ccff00] shadow-[0_0_30px_rgba(204,255,0,0.15)] ring-2 ring-[#ccff00]/20' : 'border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]'}`}>
                  <div className={`p-5 border-b text-center ${isToday ? 'bg-[#ccff00] text-[#111111] border-[#ccff00]' : 'bg-[#FAFAFA] border-gray-100 text-gray-500'}`}>
                     <p className={`text-[11px] font-black uppercase tracking-widest ${isToday?'text-black/60':'text-gray-400'}`}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                     </p>
                     <p className="text-3xl font-black tracking-tighter mt-1">{day.getDate()}</p>
                  </div>
                  
                  <div className="p-4 flex-1 bg-white space-y-4 overflow-y-auto">
                     {dayClasses.length === 0 ? (
                        <p className="text-[11px] text-center font-black uppercase tracking-widest text-gray-300 mt-6">No classes</p>
                     ) : (
                        dayClasses.map(c => (
                           <div key={c.id} className="bg-[#FAFAFA] p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-[#ccff00] hover:shadow-[0_4px_15px_rgba(204,255,0,0.1)] transition-all group cursor-default">
                              <p className="text-[11px] font-black text-[#111111] mb-2 flex items-center tracking-wide">
                                 {new Date(c.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                 <span className="text-gray-300 mx-2">•</span> 
                                 {c.duration}m
                              </p>
                              <h4 className="text-[15px] font-black text-[#111111] leading-tight mb-3">{c.name}</h4>
                              <div className="flex justify-between items-end border-t border-gray-200 pt-3 mt-3">
                                 <span className="text-[11px] font-bold text-gray-400">by {c.trainer_name || 'Staff'}</span>
                                 <span className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 text-[#111111] px-2.5 py-1 rounded-lg">{c.capacity} limit</span>
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm">
       <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-sm overflow-hidden p-8">
          <h2 className="text-2xl font-black text-[#111111] tracking-tighter mb-6">Schedule Class</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Class Name (e.g. HIIT Power)" className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 outline-none text-sm font-bold bg-[#FAFAFA] focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all text-[#111111] placeholder:text-gray-300" />
             
             <select required value={formData.trainer_name} onChange={e=>setFormData({...formData, trainer_name: e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 outline-none text-sm font-bold bg-[#FAFAFA] focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all text-[#111111] appearance-none">
                <option value="" disabled>Select Trainer...</option>
                {trainers.map((t: string, i: number) => <option key={i} value={t}>{t}</option>)}
                <option value="TBD">TBD</option>
             </select>

             <div className="grid grid-cols-2 gap-4">
                <input required type="date" value={formData.scheduled_date} onChange={e=>setFormData({...formData, scheduled_date: e.target.value})} className="w-full px-4 py-3.5 rounded-[20px] border border-gray-100 outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all text-[#111111]" />
                <input required type="time" value={formData.scheduled_time} onChange={e=>setFormData({...formData, scheduled_time: e.target.value})} className="w-full px-4 py-3.5 rounded-[20px] border border-gray-100 outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all text-[#111111]" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Duration (m)</label>
                   <input required type="number" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 outline-none text-sm font-bold bg-[#FAFAFA] focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all text-[#111111]" />
                </div>
                <div>
                   <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Capacity</label>
                   <input required type="number" value={formData.capacity} onChange={e=>setFormData({...formData, capacity: e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 outline-none text-sm font-bold bg-[#FAFAFA] focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all text-[#111111]" />
                </div>
             </div>
             
             <div className="flex gap-4 pt-6">
               <button type="button" onClick={onClose} className="flex-1 px-5 py-3.5 text-[13px] font-black tracking-widest uppercase text-gray-400 hover:text-[#111111] hover:bg-[#FAFAFA] rounded-full transition-colors">Cancel</button>
               <button disabled={saving} type="submit" className="flex-1 bg-[#111111] text-[#ccff00] text-[13px] font-black tracking-widest uppercase py-3.5 rounded-full hover:bg-[#ccff00] hover:text-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Publish'}
               </button>
             </div>
          </form>
       </div>
    </div>
  )
}
