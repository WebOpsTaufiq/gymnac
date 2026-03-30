import { createClient } from '@/lib/supabase/server';
import RevenueChart from '@/components/dashboard/revenue-chart';
import AiBriefing from '@/components/dashboard/ai-briefing';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <div>Unauthorized. Please log in.</div>;
  }

  const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', session.user.id).single();
  const gymId = profile?.gym_id;

  if (!gymId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Almost there!</h2>
         <p className="text-slate-500">Your gym setup isn't complete. Please finish onboarding to access your dashboard.</p>
      </div>
    );
  }

  // --- Date Scoping ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  // --- Mass Server DB Fetch (Parallel Execution) ---
  const [
    { data: activeMembers },
    { count: newMembersCount },
    { count: checkinsTodayCount },
    { count: failedPaymentsCount },
    { data: paymentsLast6Months },
    { data: recentCheckins },
    { data: recentMembers },
    { data: recentPayments },
    { data: todayClasses }
  ] = await Promise.all([
    supabase.from('members').select('id, plan_price').eq('gym_id', gymId).eq('status', 'active'),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).gte('created_at', firstDayOfMonth.toISOString()),
    supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).gte('checked_in_at', today.toISOString()),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'failed'),
    supabase.from('payments').select('amount, paid_at').eq('gym_id', gymId).eq('status', 'paid').gte('paid_at', sixMonthsAgo.toISOString()),
    supabase.from('checkins').select('id, checked_in_at, members(full_name)').eq('gym_id', gymId).order('checked_in_at', { ascending: false }).limit(8),
    supabase.from('members').select('id, created_at, full_name').eq('gym_id', gymId).order('created_at', { ascending: false }).limit(8),
    supabase.from('payments').select('id, paid_at, amount, members(full_name)').eq('gym_id', gymId).eq('status', 'paid').order('paid_at', { ascending: false }).limit(8),
    supabase.from('classes').select('*').eq('gym_id', gymId).gte('scheduled_at', today.toISOString()).lt('scheduled_at', tomorrow.toISOString()).order('scheduled_at', { ascending: true })
  ]);

  const totalMembersCount = activeMembers?.length || 0;
  const mrr = activeMembers?.reduce((acc, m) => acc + (Number(m.plan_price) || 0), 0) || 0;
  const hasData = totalMembersCount > 0;

  // --- Process Revenue Grouping (Last 6 Months) ---
  const revenueByMonth = new Map();
  for (let i = 5; i >= 0; i--) {
     const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
     const key = d.toLocaleString('en-US', { month: 'short' });
     revenueByMonth.set(key, 0);
  }
  paymentsLast6Months?.forEach(p => {
     const d = new Date(p.paid_at);
     const key = d.toLocaleString('en-US', { month: 'short' });
     if (revenueByMonth.has(key)) {
        revenueByMonth.set(key, revenueByMonth.get(key) + Number(p.amount));
     }
  });
  const chartData = Array.from(revenueByMonth.entries()).map(([name, revenue]) => ({ name, revenue }));

  // --- Merge Activity Timeline ---
  const activities: any[] = [];
  recentCheckins?.forEach(c => activities.push({ type: 'checkin', text: `${(c.members as any)?.full_name || 'Member'} checked in`, date: new Date(c.checked_in_at) }));
  recentMembers?.forEach(m => activities.push({ type: 'new_member', text: `${m.full_name} joined the gym`, date: new Date(m.created_at) }));
  recentPayments?.forEach(p => activities.push({ type: 'payment', text: `${(p.members as any)?.full_name || 'Member'} paid ₹${p.amount}`, date: new Date(p.paid_at) }));
  
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const finalActivities = activities.slice(0, 8);

  return (
    <div className="space-y-6">
       
       {/* 1. KPI CARDS ROW */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <KPICard 
            title="Total Members" 
            value={totalMembersCount} 
            subtext={`↑ ${newMembersCount || 0} joined this month`} 
            subtextIsPositive={true}
            isEmpty={!hasData}
         />
         <KPICard 
            title="MRR" 
            value={`₹${mrr.toLocaleString('en-IN')}`} 
            subtext={`+0% vs last month`} 
            subtextIsPositive={true}
            isEmpty={!hasData}
         />
         <KPICard 
            title="Today's Check-ins" 
            value={checkinsTodayCount || 0} 
            subtext="Currently marked active"
            isEmpty={!hasData}
         />
         <KPICard 
            title="Pending / Failed Payments" 
            value={failedPaymentsCount || 0} 
            subtext={(failedPaymentsCount || 0) > 0 ? 'Requires immediate action' : 'All accounts clear'}
            isAlert={(failedPaymentsCount || 0) > 0}
            isEmpty={!hasData}
         />
       </div>

       {/* 2. AI MORNING BRIEFING CARD */}
       <AiBriefing gymId={gymId} />

       {/* 3. TWO COLUMN LAYOUT */}
       <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
             <h2 className="text-lg font-bold text-slate-900 tracking-tight">Revenue Trend</h2>
             <p className="text-sm font-medium text-slate-500">Last 6 months trailing volume</p>
             <div className="flex-1 mt-4">
                <RevenueChart data={chartData} hasData={hasData} />
             </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
             {/* ACTIVITY FEED */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
                {!hasData ? (
                   <div className="text-center py-8">
                      <p className="text-sm font-medium text-slate-500 mb-3">Your timeline is quiet right now.</p>
                      <Link href="/dashboard/members" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 pointer">
                         Add your first member &rarr;
                      </Link>
                   </div>
                ) : finalActivities.length > 0 ? (
                   <div className="space-y-4">
                      {finalActivities.map((act, i) => (
                         <div key={i} className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                               {act.type === 'checkin' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                               {act.type === 'new_member' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>}
                               {act.type === 'payment' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-slate-800 font-semibold truncate leading-tight">{act.text}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                   <p className="text-sm font-medium text-slate-500 text-center py-6">No recent activity on record.</p>
                )}
             </div>

             {/* UPCOMING CLASSES */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Classes Today</h2>
                {!hasData || todayClasses?.length === 0 ? (
                   <div className="text-center py-6">
                      <p className="text-sm font-medium text-slate-500 mb-3">No classes scheduled for today.</p>
                      <Link href="/dashboard/schedule" className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                         Create a class &rarr;
                      </Link>
                   </div>
                ) : (
                   <div className="space-y-3">
                      {todayClasses?.map((cls, i) => (
                         <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                            <div>
                               <p className="font-bold text-sm text-slate-900 mb-0.5">{cls.name}</p>
                               <p className="text-xs font-semibold text-slate-500">{new Date(cls.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {cls.trainer_name}</p>
                            </div>
                            <div className="text-right">
                               <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-black tracking-wide rounded-full">
                                  {cls.capacity} spots
                               </span>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}

function KPICard({ title, value, subtext, subtextIsPositive, isAlert = false, isEmpty = false }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full justify-between hover:shadow-md transition-shadow">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
      
      <div className="mt-4 mb-3">
        {isEmpty ? (
          <p className="text-3xl font-black text-slate-200">-</p>
        ) : (
          <p className={`text-4xl font-black tracking-tight ${isAlert ? 'text-red-500' : 'text-slate-900'}`}>{value}</p>
        )}
      </div>
      
      {!isEmpty && subtext && (
        <p className={`text-xs font-bold ${subtextIsPositive ? 'text-green-500' : isAlert ? 'text-red-500' : 'text-slate-400'}`}>
          {subtext}
        </p>
      )}
      
      {isEmpty && (
        <Link href="/dashboard/members" className="text-[11px] font-bold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-indigo-500 inline-block mt-1">
          Configure Data &rarr;
        </Link>
      )}
    </div>
  );
}
