"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const SearchIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CheckCircle = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

export default function CheckinClient({ gymId, initialCheckins }: { gymId: string, initialCheckins: any[] }) {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [todaysCheckins, setTodaysCheckins] = useState<any[]>(initialCheckins);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set(initialCheckins.map(c => c.member_id)));

  // --- Auto Refresh Today's Checkins Every 30s ---
  useEffect(() => {
     const interval = setInterval(async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data } = await supabase
          .from('checkins')
          .select('*, members(full_name, plan_name)')
          .eq('gym_id', gymId)
          .gte('checked_in_at', today.toISOString())
          .order('checked_in_at', { ascending: false });
          
        if (data) {
           setTodaysCheckins(data);
           setCheckedInIds(new Set(data.map(c => c.member_id)));
        }
     }, 30000);
     return () => clearInterval(interval);
  }, [gymId, supabase]);

  // --- Search Debounce ---
  useEffect(() => {
     if (!query.trim()) {
        setResults([]);
        return;
     }

     setSearching(true);
     const timer = setTimeout(async () => {
        const { data } = await supabase
          .from('members')
          .select('id, full_name, phone, plan_name, status, created_at')
          .eq('gym_id', gymId)
          .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
          .limit(10);
          
        setResults(data || []);
        setSearching(false);
     }, 300);

     return () => clearTimeout(timer);
  }, [query, gymId, supabase]);

  // --- Handle Check In ---
  const handleCheckIn = async (member: any) => {
     if (checkedInIds.has(member.id)) return;

     const newCheckin = {
        gym_id: gymId,
        member_id: member.id,
        checked_in_at: new Date().toISOString()
     };

     // Optimistic
     setCheckedInIds(prev => new Set(prev).add(member.id));
     setTodaysCheckins(prev => [{ ...newCheckin, members: { full_name: member.full_name, plan_name: member.plan_name } }, ...prev]);

     await supabase.from('checkins').insert(newCheckin);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* 1. SEARCH SECTION */}
      <div className="bg-white p-8 sm:p-12 rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         
         <div className="relative z-10 text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tighter">Scanner Desk</h1>
            <p className="text-gray-400 font-bold mt-2">Search by name or phone number to check members in.</p>
         </div>

         <div className="relative z-10 max-w-2xl mx-auto">
            <div className="relative flex items-center">
               <span className="absolute left-6 text-[#111111]"><SearchIcon /></span>
               <input 
                  type="text" 
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                  placeholder="e.g. Rahul Sharma or 98765..." 
                  className="w-full pl-16 pr-6 py-5 text-lg font-black bg-[#FAFAFA] border-2 border-transparent focus:border-[#ccff00] focus:bg-white rounded-[24px] outline-none transition-all shadow-inner focus:shadow-[0_0_20px_rgba(204,255,0,0.15)] placeholder:text-gray-300 placeholder:font-bold text-[#111111]"
                  autoFocus
               />
               {searching && <span className="absolute right-6 flex w-5 h-5 rounded-full border-2 border-gray-200 border-t-[#111111] animate-spin"></span>}
            </div>

            {/* RESULTS FLYOUT */}
            {query.trim().length > 0 && (
               <div className="mt-4 space-y-3">
                  {results.length === 0 && !searching ? (
                     <p className="text-center py-8 text-gray-400 font-black tracking-widest uppercase text-[11px] bg-[#FAFAFA] rounded-[24px] border-2 border-dashed border-gray-100">No members found matching "{query}"</p>
                  ) : (
                     results.map(m => {
                        const isCheckedIn = checkedInIds.has(m.id);
                        return (
                           <div key={m.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 shadow-sm rounded-[24px] hover:border-[#ccff00] transition-colors group">
                              <div className="flex items-center gap-5">
                                 <div className="w-14 h-14 rounded-full bg-[#111111] flex items-center justify-center text-[#ccff00] font-black text-xl shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
                                    {m.full_name?.charAt(0)}
                                 </div>
                                 <div>
                                    <h3 className="text-[17px] font-black tracking-tighter text-[#111111] group-hover:text-black transition-colors">{m.full_name}</h3>
                                    <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{m.phone || 'No phone'} • <span className={`${m.status==='active'?'text-[#ccff00] font-black bg-[#111111] px-2 py-0.5 rounded-lg':'text-red-500'}`}>{m.status}</span></p>
                                 </div>
                              </div>
                              <div>
                                 {isCheckedIn ? (
                                    <span className="flex items-center gap-1.5 px-5 py-3.5 bg-[#FAFAFA] text-gray-400 font-black text-[11px] uppercase tracking-widest rounded-full border border-gray-100"><CheckCircle /> Checked In</span>
                                 ) : (
                                    <button 
                                       onClick={() => handleCheckIn(m)} 
                                       className="px-6 py-3.5 bg-[#111111] hover:bg-[#ccff00] hover:text-[#111111] text-[#ccff00] font-black text-[13px] uppercase tracking-widest rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all active:scale-95"
                                    >
                                       Check In
                                    </button>
                                 )}
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>
            )}
         </div>
      </div>

      {/* 2. TODAY'S CHECKINS LIST */}
      <div>
         <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-black text-[#111111] tracking-tighter">Today's Check-ins <span className="ml-3 text-[11px] font-black bg-[#111111] text-[#ccff00] px-3 py-1 rounded-full">{todaysCheckins.length}</span></h2>
            <p className="text-[10px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest"><span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse shadow-[0_0_8px_#ccff00]"></span> Live</p>
         </div>

         <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="divide-y divide-gray-50">
               {todaysCheckins.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 font-black tracking-widest uppercase text-[11px] bg-[#FAFAFA]">Waiting for the first check-in of the day...</div>
               ) : (
                  todaysCheckins.map(c => (
                     <div key={c.id || c.checked_in_at} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#FAFAFA] transition-colors animate-in fade-in duration-500 border-l-4 border-transparent hover:border-[#ccff00]">
                        <div className="flex items-center gap-5">
                           <div className="w-2.5 h-2.5 rounded-full bg-[#ccff00] shadow-[0_0_10px_#ccff00]"></div>
                           <div>
                              <p className="text-sm font-black text-[#111111] tracking-wide">{c.members?.full_name || 'Member'}</p>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">{c.members?.plan_name || 'Standard'}</p>
                           </div>
                        </div>
                        <div className="mt-3 sm:mt-0 ml-8 sm:ml-0 text-right">
                           <span className="inline-flex px-4 py-2 bg-white border border-gray-100 shadow-sm text-[#111111] rounded-2xl text-[11px] font-black tracking-widest uppercase">
                              {new Date(c.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>

    </div>
  )
}
