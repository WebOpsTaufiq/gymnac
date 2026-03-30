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
      <div className="flex flex-col gap-2">
        {!showOptions ? (
          <button 
            onClick={() => setShowOptions(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          >
            Approve Gym
          </button>
        ) : (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="space-y-3">
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Select Plan</label>
                 <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full text-xs font-bold p-2 rounded-lg border border-slate-200 bg-white">
                   <option value="starter">Starter (50 Members)</option>
                   <option value="growth">Growth (200 Members)</option>
                   <option value="pro">Pro (1000 Members)</option>
                 </select>
               </div>
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Duration</label>
                 <select value={months} onChange={(e) => setMonths(e.target.value)} className="w-full text-xs font-bold p-2 rounded-lg border border-slate-200 bg-white">
                   <option value="1">1 Month</option>
                   <option value="3">3 Months</option>
                   <option value="6">6 Months</option>
                   <option value="12">1 Year</option>
                 </select>
               </div>
               <div className="flex gap-2 pt-1">
                 <button 
                   disabled={loading}
                   onClick={() => handleAction('approve')}
                   className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-[10px] font-black hover:bg-green-700"
                 >
                   Confirm
                 </button>
                 <button 
                    onClick={() => setShowOptions(false)}
                    className="px-3 py-2 bg-white text-slate-500 rounded-lg text-[10px] font-black border border-slate-200"
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
           className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100"
         >
           Suspend
         </button>
         <button 
            onClick={() => setShowOptions(true)}
            className="px-3 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-xs font-black hover:bg-indigo-50"
         >
           Extend
         </button>
         {showOptions && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="text-xl font-black text-slate-900 mb-4">Extend Subscription</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Additional Months</label>
                      <select value={months} onChange={(e) => setMonths(e.target.value)} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200">
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
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm"
                    >
                      Process Extension
                    </button>
                    <button 
                      onClick={() => setShowOptions(false)}
                      className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm"
                    >
                      Close
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
        className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black"
      >
        Reactivate
      </button>
    );
  }

  return null;
}
