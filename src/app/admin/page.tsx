import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { AdminActions } from './AdminActions';

export default async function AdminPanel() {
  const supabase = await createClient();
  const supabaseAdmin = getAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_OWNER_EMAIL) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono">
         <p className="text-zinc-600">404 - Page Not Found</p>
      </div>
    );
  }

  const { data: gyms, error: gymFetchError } = await supabaseAdmin
    .from('gyms')
    .select('*, owner:profiles(id, full_name)')
    .order('created_at', { ascending: false });

  if (gymFetchError) {
    console.error('Gym Fetch Error:', gymFetchError.message);
    console.error('Details:', gymFetchError.details);
    console.error('Hint:', gymFetchError.hint);
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 p-8 overflow-hidden font-sans text-zinc-200">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-indigo-500/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-1">Command Center</h1>
            <p className="text-zinc-500 font-medium">Platform Operations & Gym Authorizations</p>
          </div>
          <div className="px-5 py-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex items-center gap-4">
             <div>
               <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Access Level</p>
               <p className="text-sm font-bold text-zinc-100">{user.email}</p>
             </div>
             <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
               <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-pulse" />
             </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-900/80 border-b border-white/5">
                  <th className="px-6 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-widest">Gym Info</th>
                  <th className="px-6 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-widest">Operator</th>
                  <th className="px-6 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-widest">Tier</th>
                  <th className="px-6 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-widest">Expiration</th>
                  <th className="px-6 py-5 text-[11px] font-black text-zinc-500 uppercase tracking-widest">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {gyms?.map((gym: any) => (
                  <AdminRow key={gym.id} gym={gym} />
                ))}
                {(!gyms || gyms.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-zinc-600 font-medium h-[300px]">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-12 w-12 rounded-xl bg-zinc-900/50 border border-white/5 mb-4 flex items-center justify-center">
                          <span className="text-zinc-700 font-bold text-xl">/</span>
                        </div>
                        <p>No operational entities detected.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRow({ gym }: { gym: any }) {
  return (
    <tr className="hover:bg-zinc-800/30 transition-all group">
      <td className="px-6 py-5 align-middle">
        <p className="text-sm font-black text-zinc-100 group-hover:text-indigo-400 transition-colors">{gym.name}</p>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">{gym.city || 'Global'}</p>
      </td>
      <td className="px-6 py-5 align-middle">
        <p className="text-sm font-medium text-zinc-400">
          {(Array.isArray(gym.owner) ? gym.owner[0] : gym.owner)?.full_name || 'System Auto'}
        </p>
      </td>
      <td className="px-6 py-5 align-middle">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          gym.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          gym.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
          gym.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            gym.status === 'active' ? 'bg-emerald-400' :
            gym.status === 'pending' ? 'bg-amber-400' :
            gym.status === 'suspended' ? 'bg-red-400' :
            'bg-zinc-400'
          }`} />
          {gym.status}
        </span>
      </td>
      <td className="px-6 py-5 align-middle">
        <span className="text-xs font-black text-zinc-300 uppercase tracking-widest bg-zinc-800/50 px-2 py-1 rounded-md border border-white/5">
          {gym.plan}
        </span>
      </td>
      <td className="px-6 py-5 align-middle">
        <p className="text-sm font-medium text-zinc-500">
          {gym.expires_at ? new Date(gym.expires_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '∞'}
        </p>
      </td>
      <td className="px-6 py-5 align-middle">
         {/* Using a client component for the actions to handle the dropdown/fetch */}
         <AdminActions gymId={gym.id} currentStatus={gym.status} />
      </td>
    </tr>
  );
}

