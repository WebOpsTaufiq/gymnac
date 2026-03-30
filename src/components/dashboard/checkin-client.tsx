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
      <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/50 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
         
         <div className="relative z-10 text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Scanner Desk</h1>
            <p className="text-slate-500 font-medium mt-1">Search by name or phone number to check members in.</p>
         </div>

         <div className="relative z-10 max-w-2xl mx-auto">
            <div className="relative flex items-center">
               <span className="absolute left-5 text-indigo-500"><SearchIcon /></span>
               <input 
                  type="text" 
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                  placeholder="e.g. Rahul Sharma or 98765..." 
                  className="w-full pl-14 pr-6 py-5 text-lg font-bold bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all shadow-inner focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] placeholder:text-slate-300 placeholder:font-semibold"
                  autoFocus
               />
               {searching && <span className="absolute right-5 flex w-4 h-4 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin"></span>}
            </div>

            {/* RESULTS FLYOUT */}
            {query.trim().length > 0 && (
               <div className="mt-4 space-y-3">
                  {results.length === 0 && !searching ? (
                     <p className="text-center py-6 text-slate-400 font-bold bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">No members found matching "{query}"</p>
                  ) : (
                     results.map(m => {
                        const isCheckedIn = checkedInIds.has(m.id);
                        return (
                           <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 shadow-sm rounded-2xl hover:border-indigo-300 transition-colors group">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg shadow-sm border border-indigo-200/50">
                                    {m.full_name?.charAt(0)}
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{m.full_name}</h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{m.phone || 'No phone'} • <span className={`uppercase tracking-wider ${m.status==='active'?'text-green-500':'text-red-500'}`}>{m.status}</span></p>
                                 </div>
                              </div>
                              <div>
                                 {isCheckedIn ? (
                                    <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 font-bold text-sm rounded-xl border border-green-200"><CheckCircle /> Checked In</span>
                                 ) : (
                                    <button 
                                       onClick={() => handleCheckIn(m)} 
                                       className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.25)] transition-all active:scale-95"
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
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900">Today's Check-ins <span className="ml-2 text-sm font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{todaysCheckins.length}</span></h2>
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live Auto-Refresh</p>
         </div>

         <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
               {todaysCheckins.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 font-medium text-sm">Waiting for the first check-in of the day...</div>
               ) : (
                  todaysCheckins.map(c => (
                     <div key={c.id || c.checked_in_at} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors animate-in fade-in duration-500">
                        <div className="flex items-center gap-4">
                           <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                           <div>
                              <p className="font-bold text-slate-900">{c.members?.full_name || 'Member'}</p>
                              <p className="text-xs font-semibold text-slate-500">{c.members?.plan_name || 'Standard'}</p>
                           </div>
                        </div>
                        <div className="mt-2 sm:mt-0 ml-6 sm:ml-0 text-right">
                           <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black tracking-widest uppercase">
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
