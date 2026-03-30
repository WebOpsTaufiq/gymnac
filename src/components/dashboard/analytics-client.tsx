"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsClient({ data }: { data: any }) {
  const { kpis, chartData, plans } = data;
  const hasData = kpis.activeCount > 0 || chartData.some((d: any) => d.revenue > 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">12-month trailing metrics and revenue velocity</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Monthly Recurring Revenue" value={`₹${kpis.mrr.toLocaleString('en-IN')}`} empty={!hasData} />
        <KPICard title="Avg. Revenue Per Member" value={`₹${kpis.avgPerMember.toLocaleString('en-IN')}`} empty={!hasData} />
        <KPICard title="Current Churn Rate" value={`${kpis.churnRate}%`} isAlert={Number(kpis.churnRate) > 5} empty={!hasData} />
        <KPICard title="Active Members" value={kpis.activeCount} empty={!hasData} />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* REVENUE CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Growth (12 Months)</h2>
          {!hasData ? (
             <EmptyChart label="revenue data" />
          ) : (
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dx={-10} tickFormatter={(val) => `₹${val>=1000 ? (val/1000)+'k' : val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    itemStyle={{ color: '#4f46e5' }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* MEMBER GROWTH CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-slate-900 mb-6">New Memberships (12 Months)</h2>
          {!hasData ? (
             <EmptyChart label="member growth" />
          ) : (
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dx={-10} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                    formatter={(val: any) => [val, 'New Joins']}
                  />
                  <Bar dataKey="joins" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* PLANS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div>
             <h2 className="text-lg font-bold text-slate-900">Plan Distribution</h2>
             <p className="text-xs font-semibold text-slate-500 mt-0.5">Where your revenue is coming from</p>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Plan Name</th>
                <th className="px-6 py-4 text-right">Active Members</th>
                <th className="px-6 py-4 text-right">Yield (MRR)</th>
                <th className="px-6 py-4">Portfolio %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.length === 0 ? (
                 <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium text-sm">No active plans detected.</td>
                 </tr>
              ) : (
                plans.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-2 font-bold text-sm text-slate-900">
                         {i === 0 && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                         {p.name}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                       {p.count}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">
                       ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 w-1/3">
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500 w-8">{p.percentage}%</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.percentage}%` }}></div>
                          </div>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function KPICard({ title, value, isAlert = false, empty = false }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center min-h-[120px]">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</h3>
      {empty ? (
         <p className="text-3xl font-black text-slate-200">-</p>
      ) : (
         <p className={`text-3xl sm:text-4xl font-black tracking-tight ${isAlert ? 'text-red-500' : 'text-slate-900'}`}>{value}</p>
      )}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
   return (
      <div className="flex-1 flex flex-col border-2 border-dashed border-slate-100 rounded-xl items-center justify-center text-center p-6">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-3"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
         <p className="text-sm font-bold text-slate-400">No {label} recorded yet.</p>
         <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Metrics will appear here automatically once data begins logging.</p>
      </div>
   );
}
