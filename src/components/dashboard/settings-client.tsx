"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsClient({ gym, email }: { gym: any, email: string }) {
  const supabase = createClient();
  const router = useRouter();
  
  const [gymData, setGymData] = useState({ name: gym?.name || '', city: gym?.city || '' });
  const [password, setPassword] = useState("");
  
  const [savingGym, setSavingGym] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdateGym = async (e: any) => {
     e.preventDefault();
     setSavingGym(true);
     await supabase.from('gyms').update({ name: gymData.name, city: gymData.city }).eq('id', gym.id);
     alert("Gym profile updated.");
     setSavingGym(false);
  };

  const handleUpdatePassword = async (e: any) => {
     e.preventDefault();
     if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
     }
     setSavingPwd(true);
     const { error } = await supabase.auth.updateUser({ password });
     if (error) alert(error.message);
     else {
        alert("Password updated successfully.");
        setPassword("");
     }
     setSavingPwd(false);
  };

  const handleDeleteAccount = async () => {
     const conf = window.prompt("Type DELETE to confirm account deletion. This cannot be undone.");
     if (conf === "DELETE") {
        setDeleting(true);
        // Supabase requires edge functions to delete full users safely, but we can sign them out and mark inactive
        await supabase.auth.signOut();
        router.push('/login');
     }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-20">
      <div>
         <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
         <p className="text-sm font-medium text-slate-500 mt-1">Manage your workspace and security preferences.</p>
      </div>

      {/* GYM PROFILE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Gym Profile</h2>
         </div>
         <form onSubmit={handleUpdateGym} className="p-6 space-y-5">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Workspace Name</label>
               <input required value={gymData.name} onChange={e=>setGymData({...gymData, name: e.target.value})} className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900 bg-slate-50" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">City / Location</label>
               <input value={gymData.city} onChange={e=>setGymData({...gymData, city: e.target.value})} className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900 bg-slate-50" />
            </div>
            <button disabled={savingGym} type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50">
               {savingGym ? 'Saving...' : 'Save Profile Changes'}
            </button>
         </form>
      </div>

      {/* ACCOUNT SECURITY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Account Security</h2>
         </div>
         <div className="p-6 border-b border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Email</label>
            <div className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600 italic cursor-not-allowed">
               {email}
            </div>
         </div>
         <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Update Password</label>
               <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter new password" className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50" />
            </div>
            <button disabled={savingPwd || !password} type="submit" className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50">
               {savingPwd ? 'Updating...' : 'Change Password'}
            </button>
         </form>
      </div>

      {/* DANGER ZONE */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden mt-10">
         <div className="p-5 border-b border-red-100 bg-red-50/50">
            <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
         </div>
         <div className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-4">Permanently delete your workspace, members, check-ins, and financial data. This cannot be undone.</p>
            <button onClick={handleDeleteAccount} disabled={deleting} className="px-6 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-sm rounded-xl transition-colors mr-auto">
               Delete Workspace
            </button>
         </div>
      </div>

    </div>
  )
}
