'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Building, MapPin, Users, Loader2, ArrowRight, Target } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gymName, setGymName] = useState("");
  const [city, setCity] = useState("");
  const [memberCount, setMemberCount] = useState("Under 50");
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found.");

      // 1. Create the gym (status: pending by default)
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name: gymName,
          city: city,
          member_count_estimate: memberCount,
          owner_id: user.id,
          status: 'pending' // Enforce pending status for manual approval
        })
        .select()
        .single();

      if (gymError) throw gymError;

      // 2. Update/Upsert the profile with gym_id
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          gym_id: gymData.id,
          role: 'owner'
        });

      if (profileError) throw profileError;

      // 3. Success! Go to dashboard (middleware will handle the /pending redirect)
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#ccff00] selection:text-[#111111]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <span className="font-bold text-2xl tracking-tight text-[#111111]">GymNav</span>
        </div>
        
        <h2 className="text-center text-4xl font-black tracking-tighter text-[#111111] mb-2">Initialize Workspace</h2>
        <p className="text-center text-gray-400 font-bold mb-10">Tell us about your facility to get started.</p>
        
        <div className="bg-white py-12 px-8 md:px-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 rounded-[40px] relative overflow-hidden">
           <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Organization Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-300" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={gymName} 
                    onChange={(e) => setGymName(e.target.value)}
                    className="block w-full bg-[#FAFAFA] border border-gray-100 rounded-[20px] py-4 pl-14 pr-4 text-[#111111] font-bold focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all placeholder:text-gray-300 outline-none" 
                    placeholder="e.g. Iron Paradise" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-300" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full bg-[#FAFAFA] border border-gray-100 rounded-[20px] py-4 pl-14 pr-4 text-[#111111] font-bold focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all placeholder:text-gray-300 outline-none" 
                    placeholder="e.g. Mumbai" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Operation Scale</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-300" />
                  </div>
                  <select 
                    value={memberCount} 
                    onChange={(e) => setMemberCount(e.target.value)}
                    className="block w-full bg-[#FAFAFA] border border-gray-100 rounded-[20px] py-4 pl-14 pr-4 text-[#111111] font-bold focus:bg-white focus:ring-2 focus:ring-[#ccff00] transition-all outline-none appearance-none"
                  >
                    <option value="Under 50">Under 50</option>
                    <option value="50-100">50-100</option>
                    <option value="100-300">100-300</option>
                    <option value="300+">300+</option>
                  </select>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full flex justify-center items-center gap-3 py-4 bg-[#111111] text-[#ccff00] rounded-full font-black text-[15px] hover:bg-[#ccff00] hover:text-[#111111] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_rgba(204,255,0,0.3)] active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finish Setup <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
           </form>

           {error && (
             <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-[20px] flex gap-3 items-center text-red-600 font-bold text-xs animate-in fade-in duration-300">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                {error}
             </div>
           )}
        </div>
        
        <p className="mt-8 text-center text-gray-400 text-xs font-bold">
           Logged in as <span className="text-[#111111] underline underline-offset-2">Owner</span>. 
           Need help? WhatsApp +91-987-6543-210
        </p>
      </div>
    </div>
  );
}
