"use client";

import { useState, useEffect } from 'react';

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
);

export default function AiBriefing({ gymId }: { gymId?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ai-briefing${gymId ? `?gymId=${gymId}` : ''}`)
      .then(res => res.json())
      .then(json => {
         setData(json);
         setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
       {/* Background gradient flare overlay */}
       <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
       
       {/* Card Header */}
       <div className="flex items-center gap-4 mb-5 relative z-10">
         <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
           <div className="text-white">
             <SparklesIcon />
           </div>
         </div>
         <div>
           <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">Morning Briefing</h3>
           <p className="text-xs font-semibold text-slate-400">Generated at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
         </div>
       </div>

       {/* Briefing Feed */}
       <div className="relative z-10">
         {loading ? (
            <div className="space-y-3.5 animate-pulse mt-2 px-2">
              <div className="h-2.5 bg-slate-100 rounded-full w-full"></div>
              <div className="h-2.5 bg-slate-100 rounded-full w-11/12"></div>
              <div className="h-2.5 bg-slate-100 rounded-full w-2/3"></div>
            </div>
         ) : (
            <ul className="space-y-3.5 text-[15px] text-slate-700 font-medium leading-snug">
               {data?.briefing?.length ? (
                 data.briefing.map((pt: string, i: number) => (
                   <li key={i} className="flex items-start gap-3">
                     <span className="text-indigo-500 mt-1 font-bold text-lg leading-none">•</span>
                     <span>{pt}</span>
                   </li>
                 ))
               ) : (
                 <li className="flex items-start gap-3">
                   <span className="text-indigo-500 mt-1 font-bold text-lg leading-none">•</span>
                   <span>{"Today is looking completely clear! Take a coffee break or follow up with pending Walk-in leads."}</span>
                 </li>
               )}
            </ul>
         )}
       </div>
    </div>
  )
}
