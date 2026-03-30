import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScheduleClient from '@/components/dashboard/schedule-client';

export const metadata = { title: 'Class Schedule | GymNav' };

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', session.user.id).single();
  const gymId = profile?.gym_id;

  if (!gymId) return <div>Setup incomplete</div>;

  // Fetch classes for current week (simplification: fetch next 14 days and filter in client)
  const today = new Date();
  today.setHours(0,0,0,0);
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('gym_id', gymId)
    .gte('scheduled_at', today.toISOString())
    .lte('scheduled_at', twoWeeks.toISOString())
    .order('scheduled_at', { ascending: true });

  const { data: staff } = await supabase.from('staff').select('full_name').eq('gym_id', gymId);

  return <ScheduleClient gymId={gymId} initialClasses={classes || []} trainers={(staff||[]).map((s:any)=>s.full_name)} />;
}
