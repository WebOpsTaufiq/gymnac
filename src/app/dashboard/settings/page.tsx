import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsClient from '@/components/dashboard/settings-client';

export const metadata = { title: 'Settings | GymNav' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', session.user.id).single();
  const gymId = profile?.gym_id;

  if (!gymId) return <div className="p-10 text-center">Setup incomplete</div>;

  const { data: gym } = await supabase.from('gyms').select('*').eq('id', gymId).single();

  return <SettingsClient gym={gym} email={session.user.email || ''} />;
}
