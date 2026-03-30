import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StaffClient from '@/components/dashboard/staff-client';

export const metadata = { title: 'Staff Directory | GymNav' };

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', session.user.id).single();
  const gymId = profile?.gym_id;

  if (!gymId) return <div>Setup incomplete</div>;

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });

  return <StaffClient gymId={gymId} initialStaff={staff || []} />;
}
