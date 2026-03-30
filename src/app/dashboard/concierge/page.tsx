import { createClient } from '@/lib/supabase/server';
import ConciergeChat from '@/components/dashboard/concierge-chat';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'AI Concierge | GymNav',
  description: 'Your 24/7 AI Operations Manager',
};

export default async function ConciergePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('gym_id, full_name, gyms(name)')
    .eq('id', session.user.id)
    .single();

  const gymId = profile?.gym_id;
  const gymName = (profile?.gyms as any)?.name || 'Your Gym';
  const userName = profile?.full_name || 'Owner';

  if (!gymId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 font-medium">Complete gym setup first.</p>
      </div>
    );
  }

  return <ConciergeChat gymId={gymId} gymName={gymName} userName={userName} />;
}
