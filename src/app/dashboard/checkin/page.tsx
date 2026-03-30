import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CheckinClient from '@/components/dashboard/checkin-client';

export const metadata = {
  title: 'Check-in Desk | GymNav',
};

export default async function CheckinPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', session.user.id).single();
  const gymId = profile?.gym_id;

  if (!gymId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Incomplete</h2>
         <p className="text-slate-500">Please complete gym setup.</p>
      </div>
    );
  }

  // Fetch initial today's checkins
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: initialCheckins } = await supabase
    .from('checkins')
    .select('*, members(full_name, plan_name)')
    .eq('gym_id', gymId)
    .gte('checked_in_at', today.toISOString())
    .order('checked_in_at', { ascending: false });

  return <CheckinClient gymId={gymId} initialCheckins={initialCheckins || []} />;
}
