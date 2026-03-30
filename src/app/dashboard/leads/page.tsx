import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LeadsClient from '@/components/dashboard/leads-client';

export const metadata = {
  title: 'Leads Pipeline | GymNav',
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', session.user.id).single();
  const gymId = profile?.gym_id;

  if (!gymId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Incomplete</h2><p className="text-slate-500">Please complete gym setup.</p>
      </div>
    );
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });

  return <LeadsClient gymId={gymId} initialLeads={leads || []} />;
}
