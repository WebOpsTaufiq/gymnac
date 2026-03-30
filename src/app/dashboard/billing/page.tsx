import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BillingClient from '@/components/dashboard/billing-client';

export const metadata = {
  title: 'Billing & Payments | GymNav',
  description: 'Manage gym subscriptions and payment recovery',
};

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('gym_id, gyms(name)')
    .eq('id', session.user.id)
    .single();

  const gymId = profile?.gym_id;
  const gymName = (profile?.gyms as any)?.name || 'the gym';

  if (!gymId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Incomplete</h2>
         <p className="text-slate-500">Please complete your gym setup to access billing.</p>
      </div>
    );
  }

  // --- Date Scoping for KPIs ---
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // --- Fetch Data ---
  const [
    { data: payments },
    { data: activeMembers }
  ] = await Promise.all([
    supabase
      .from('payments')
      .select('*, members(full_name, phone)')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })
      .limit(200), // Get last 200 payments for the table
      
    supabase
      .from('members')
      .select('id, full_name, plan_price')
      .eq('gym_id', gymId)
      .in('status', ['active', 'at-risk'])
  ]);

  // --- Process KPIs (This Month Only) ---
  let collectedThisMonth = 0;
  let pendingThisMonth = 0;
  let failedCount = 0;
  let totalBilledThisMonth = 0;

  payments?.forEach(p => {
     const pDate = new Date(p.created_at);
     if (pDate >= firstDayOfMonth) {
        totalBilledThisMonth += Number(p.amount);
        if (p.status === 'paid') collectedThisMonth += Number(p.amount);
        if (p.status === 'pending') pendingThisMonth += Number(p.amount);
        if (p.status === 'failed') failedCount += 1;
     }
  });

  const recoveryRate = totalBilledThisMonth > 0 ? Math.round((collectedThisMonth / totalBilledThisMonth) * 100) : 0;

  const viewData = {
     kpis: {
        collected: collectedThisMonth,
        pending: pendingThisMonth,
        failed: failedCount,
        recoveryRate
     },
     payments: payments || [],
     members: activeMembers || [],
     gymName
  };

  return <BillingClient data={viewData} gymId={gymId} />;
}
