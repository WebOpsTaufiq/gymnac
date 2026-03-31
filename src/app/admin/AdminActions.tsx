'use client';

import { useState } from 'react';

export function AdminActions({ gymId, currentStatus }: { gymId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [plan, setPlan] = useState('starter');
  const [months, setMonths] = useState('1');

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gym', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId, action, plan, months })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Action failed');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'pending') {
    return (
      <div className="flex flex-col gap-2 relative">
        {!showOptions ? (
          <button 
            onClick={() => setShowOptions(true)}
            className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-xl text-[11px] font-black hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 uppercase tracking-wider"
          >
            Authorize
          </button>
        ) : (
          <div className="absolute right-0 top-10 w-64 bg-zinc-900 p-4 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Select Tier</label>
                 <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all">
                   <option value="starter">Starter (50 Members)</option>
                   <option value="growth">Growth (200 Members)</option>
                   <option value="pro">Pro (1000 Members)</option>
                 </select>
               </div>
               <div>
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Duration</label>
                 <select value={months} onChange={(e) => setMonths(e.target.value)} className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all">
                   <option value="1">1 Month</option>
                   <option value="3">3 Months</option>
                   <option value="6">6 Months</option>
                   <option value="12">1 Year</option>
                 </select>
               </div>
               <div className="flex gap-2 pt-2">
                 <button 
                   disabled={loading}
                   onClick={() => handleAction('approve')}
                   className="flex-1 px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-black hover:bg-emerald-500 hover:text-zinc-950 transition-colors uppercase tracking-wider"
                 >
                   Confirm
                 </button>
                 <button 
                    onClick={() => setShowOptions(false)}
                    className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[11px] font-black border border-white/5 hover:bg-zinc-700 transition-colors uppercase tracking-wider"
                 >
                   Cancel
                 </button>
               </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  if (currentStatus === 'active') {
    return (
      <div className="flex gap-2">
         <button 
           disabled={loading}
           onClick={() => handleAction('suspend')}
           className="px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black hover:bg-red-500/20 transition-colors uppercase tracking-wider"
         >
           Suspend
         </button>
         <button 
            onClick={() => setShowOptions(true)}
            className="px-3 py-2 bg-zinc-800 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black hover:bg-indigo-500/10 transition-colors uppercase tracking-wider"
         >
           Extend
         </button>
         {showOptions && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
               <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Extend License</h3>
                  <p className="text-sm font-medium text-zinc-500 mb-6">Allocate additional time to this operation.</p>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Additional Horizon</label>
                      <select value={months} onChange={(e) => setMonths(e.target.value)} className="w-full text-sm font-bold p-3.5 rounded-xl border border-white/10 bg-zinc-950 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all">
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">1 Year</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      disabled={loading}
                      onClick={() => handleAction('reactivate')}
                      className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-95"
                    >
                      Process Extension
                    </button>
                    <button 
                      onClick={() => setShowOptions(false)}
                      className="flex-1 px-4 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/5 transition-all"
                    >
                      Abort
                    </button>
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  }

  if (currentStatus === 'suspended') {
    return (
      <button 
        disabled={loading}
        onClick={() => { setMonths('1'); handleAction('reactivate'); }}
        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[11px] font-black hover:bg-emerald-500/20 transition-colors uppercase tracking-wider"
      >
        Reactivate
      </button>
    );
  }

  return null;
}
