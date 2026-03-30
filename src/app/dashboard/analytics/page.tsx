import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AnalyticsClient from '@/components/dashboard/analytics-client';

export const metadata = {
  title: 'Analytics | GymNav',
  description: 'Gym performance and revenue analytics',
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('gym_id')
    .eq('id', session.user.id)
    .single();

  const gymId = profile?.gym_id;

  if (!gymId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Incomplete</h2>
         <p className="text-slate-500">Please complete your gym setup to view analytics.</p>
      </div>
    );
  }

  // --- Dates for Analytics ---
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);

  // --- Fetch Data ---
  const [
    { data: activeMembers },
    { data: allMembers },
    { count: expiredThisMonth },
    { data: paymentsLast12Months }
  ] = await Promise.all([
    supabase.from('members').select('plan_price, plan_name').eq('gym_id', gymId).eq('status', 'active'),
    supabase.from('members').select('created_at').eq('gym_id', gymId).gte('created_at', twelveMonthsAgo.toISOString()),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'expired').gte('updated_at', firstDayOfMonth.toISOString()), // Approximate churn
    supabase.from('payments').select('amount, paid_at').eq('gym_id', gymId).eq('status', 'paid').gte('paid_at', twelveMonthsAgo.toISOString())
  ]);

  // --- Process KPIs ---
  const activeCount = activeMembers?.length || 0;
  let mrr = 0;
  
  // Plan Breakdown
  const planStats: Record<string, { count: number, revenue: number }> = {};
  activeMembers?.forEach(m => {
     const price = Number(m.plan_price) || 0;
     mrr += price;
     
     const plan = m.plan_name || 'Standard';
     if (!planStats[plan]) planStats[plan] = { count: 0, revenue: 0 };
     planStats[plan].count += 1;
     planStats[plan].revenue += price;
  });

  const avgPerMember = activeCount > 0 ? Math.round(mrr / activeCount) : 0;
  
  // Basic churn: (expired recently) / (total active + expired recently)
  const churnDenominator = activeCount + (expiredThisMonth || 0);
  const churnRate = churnDenominator > 0 ? ((expiredThisMonth || 0) / churnDenominator) * 100 : 0;

  // --- Process 12 Month Arrays ---
  const monthsData: { label: string, key: string, revenue: number, joins: number }[] = [];
  for (let i = 11; i >= 0; i--) {
     const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
     monthsData.push({
        label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        revenue: 0,
        joins: 0
     });
  }

  paymentsLast12Months?.forEach(p => {
     const d = new Date(p.paid_at);
     const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
     const monthObj = monthsData.find(m => m.key === key);
     if (monthObj) monthObj.revenue += Number(p.amount);
  });

  allMembers?.forEach(m => {
     const d = new Date(m.created_at);
     const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
     const monthObj = monthsData.find(m => m.key === key);
     if (monthObj) monthObj.joins += 1;
  });

  // Calculate percentages for plan table
  const plansArray = Object.keys(planStats).map(name => ({
     name,
     count: planStats[name].count,
     revenue: planStats[name].revenue,
     percentage: mrr > 0 ? Math.round((planStats[name].revenue / mrr) * 100) : 0
  })).sort((a, b) => b.revenue - a.revenue);

  const viewData = {
     kpis: {
        mrr,
        avgPerMember,
        churnRate: churnRate.toFixed(1),
        activeCount
     },
     chartData: monthsData.map(m => ({ name: m.label, revenue: m.revenue, joins: m.joins })),
     plans: plansArray
  };

  return <AnalyticsClient data={viewData} />;
}
