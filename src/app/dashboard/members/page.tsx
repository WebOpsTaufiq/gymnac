import { createClient } from '@/lib/supabase/server';
import MembersClient from '@/components/dashboard/members-client';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Members | GymNav',
  description: 'Manage your gym members',
};

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('gym_id')
    .eq('id', session.user.id)
    .single();

  const gymId = profile?.gym_id;

  if (!gymId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Incomplete</h2>
         <p className="text-slate-500">Please complete your gym setup to access members.</p>
      </div>
    );
  }

  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('*')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });

  if (membersError) {
    console.error("Failed to load members:", membersError);
    return <div>Failed to load members. Please try again later.</div>;
  }

  return <MembersClient initialMembers={members || []} gymId={gymId} />;
}
