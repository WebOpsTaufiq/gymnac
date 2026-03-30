import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardNav from './DashboardNav';
import { Toaster } from '@/components/ui/toast';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // 1. Get session using server client
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // 2. If no session immediately redirect to login
  if (sessionError || !session) {
    redirect('/login');
  }

  // 3. Fetch current user's profile and heavily join their related gym details natively
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, gyms(*)')
    .eq('id', session.user.id)
    .single();

  // Extract the gym object securely depending on how PostgREST resolves the 1:1 vs M:1 join
  const gym = profile?.gyms ? (Array.isArray(profile.gyms) ? profile.gyms[0] : profile.gyms) : null;

  return (
    // 4. Pass the data fully down to a client components wrapper enabling reactive states
    <DashboardNav user={session.user} profile={profile} gym={gym}>
      {children}
      <Toaster />
    </DashboardNav>
  );
}
