import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export default async function AdminPanel() {
  const supabase = await createClient();
  const supabaseAdmin = getAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_OWNER_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono">
         <p className="text-slate-500">404 - Page Not Found</p>
      </div>
    );
  }

  const { data: gyms } = await supabaseAdmin
    .from('gyms')
    .select('*, profiles(id, email)')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">GymNav Admin Panel</h1>
            <p className="text-slate-500 font-medium">Manage gym authorizations and subscriptions</p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
             <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Logged in as Owner</p>
             <p className="text-sm font-black text-indigo-900">{user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Gym Name</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Owner Email</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gyms?.map((gym: any) => (
                <AdminRow key={gym.id} gym={gym} />
              ))}
              {(!gyms || gyms.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No gyms found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminRow({ gym }: { gym: any }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-5">
        <p className="text-sm font-black text-slate-900">{gym.name}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase">{gym.city}</p>
      </td>
      <td className="px-6 py-5 align-middle">
        <p className="text-sm font-medium text-slate-600">{(gym.profiles as any)?.email || 'N/A'}</p>
      </td>
      <td className="px-6 py-5 align-middle">
        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          gym.status === 'active' ? 'bg-green-100 text-green-700' :
          gym.status === 'pending' ? 'bg-amber-100 text-amber-700' :
          gym.status === 'suspended' ? 'bg-red-100 text-red-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {gym.status}
        </span>
      </td>
      <td className="px-6 py-5 align-middle">
        <span className="text-xs font-black text-slate-900 uppercase">{gym.plan}</span>
      </td>
      <td className="px-6 py-5 align-middle">
        <p className="text-sm font-medium text-slate-600">
          {gym.expires_at ? new Date(gym.expires_at).toLocaleDateString() : '-'}
        </p>
      </td>
      <td className="px-6 py-5 align-middle">
         {/* Using a client component for the actions to handle the dropdown/fetch */}
         <AdminActions gymId={gym.id} currentStatus={gym.status} />
      </td>
    </tr>
  );
}

// Separate client component for actions as we need state
'use client';
import { useState } from 'react';

function AdminActions({ gymId, currentStatus }: { gymId: string, currentStatus: string }) {
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
