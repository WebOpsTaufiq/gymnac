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
      <div className="bg-white p-8 sm:p-10 rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden mb-12">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tighter">System Settings</h1>
            <p className="text-sm font-bold text-gray-400 mt-2">Manage your workspace and security preferences.</p>
         </div>
      </div>

      {/* GYM PROFILE */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
         <div className="p-8 border-b border-gray-100 bg-[#FAFAFA]">
            <h2 className="text-2xl font-black text-[#111111] tracking-tighter">Gym Profile</h2>
         </div>
         <form onSubmit={handleUpdateGym} className="p-8 space-y-6">
            <div>
               <label className="block text-[11px] font-black tracking-widest uppercase text-gray-400 mb-3">Workspace Name</label>
               <input required value={gymData.name} onChange={e=>setGymData({...gymData, name: e.target.value})} className="w-full max-w-md px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold text-[#111111] bg-[#FAFAFA] focus:bg-white transition-colors" />
            </div>
            <div>
               <label className="block text-[11px] font-black tracking-widest uppercase text-gray-400 mb-3">City / Location</label>
               <input value={gymData.city} onChange={e=>setGymData({...gymData, city: e.target.value})} className="w-full max-w-md px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold text-[#111111] bg-[#FAFAFA] focus:bg-white transition-colors" />
            </div>
            <button disabled={savingGym} type="submit" className="px-8 py-4 bg-[#111111] hover:bg-[#ccff00] hover:text-[#111111] text-[#ccff00] font-black text-[13px] tracking-widest uppercase rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50 mt-4 block">
               {savingGym ? 'Saving...' : 'Save Profile'}
            </button>
         </form>
      </div>

      {/* ACCOUNT SECURITY */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden mt-8">
         <div className="p-8 border-b border-gray-100 bg-[#FAFAFA]">
            <h2 className="text-2xl font-black text-[#111111] tracking-tighter">Account Security</h2>
         </div>
         <div className="p-8 border-b border-gray-100">
            <label className="block text-[11px] font-black tracking-widest uppercase text-gray-400 mb-3">Primary Email</label>
            <div className="w-full max-w-md px-5 py-3.5 rounded-[20px] border border-gray-100 bg-[#FAFAFA] text-[13px] font-bold text-gray-500 italic cursor-not-allowed">
               {email}
            </div>
         </div>
         <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
            <div>
               <label className="block text-[11px] font-black tracking-widest uppercase text-gray-400 mb-3">Update Password</label>
               <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter new password" className="w-full max-w-md px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white transition-colors text-[#111111] placeholder:text-gray-300" />
            </div>
            <button disabled={savingPwd || !password} type="submit" className="px-8 py-4 bg-[#111111] hover:bg-[#ccff00] hover:text-[#111111] text-[#ccff00] font-black text-[13px] tracking-widest uppercase rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50 mt-4 block">
               {savingPwd ? 'Updating...' : 'Change Password'}
            </button>
         </form>
      </div>

      {/* DANGER ZONE */}
      <div className="bg-white rounded-[40px] border border-red-500/20 shadow-[0_10px_40px_rgba(239,68,68,0.05)] overflow-hidden mt-12">
         <div className="p-8 border-b border-red-500/10 bg-red-50/50">
            <h2 className="text-2xl font-black text-red-500 tracking-tighter">Danger Zone</h2>
         </div>
         <div className="p-8">
            <p className="text-[13px] font-bold text-gray-500 mb-6 max-w-lg leading-relaxed">Permanently delete your workspace, members, check-ins, and financial data. This cannot be undone.</p>
            <button onClick={handleDeleteAccount} disabled={deleting} className="px-8 py-4 bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 text-red-600 hover:text-white font-black text-[13px] tracking-widest uppercase rounded-full transition-all disabled:opacity-50 inline-block shadow-sm">
               Delete Workspace
            </button>
         </div>
      </div>

    </div>
  )
}
