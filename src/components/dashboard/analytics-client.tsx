"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsClient({ data }: { data: any }) {
  const { kpis, chartData, plans } = data;
  const hasData = kpis.activeCount > 0 || chartData.some((d: any) => d.revenue > 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-black text-[#111111] tracking-tighter">Performance Analytics</h1>
            <p className="text-sm font-bold text-gray-400 mt-1">12-month trailing metrics and revenue velocity</p>
         </div>
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
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col h-[400px]">
          <h2 className="text-xl font-black text-[#111111] tracking-tighter mb-8">Revenue Growth (12 Months)</h2>
          {!hasData ? (
             <EmptyChart label="revenue data" />
          ) : (
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111111" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 900 }} dx={-10} tickFormatter={(val) => `₹${val>=1000 ? (val/1000)+'k' : val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)', fontWeight: 'black', color: '#111111' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    itemStyle={{ color: '#111111' }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* MEMBER GROWTH CHART */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col h-[400px]">
          <h2 className="text-xl font-black text-[#111111] tracking-tighter mb-8">New Memberships (12 Months)</h2>
          {!hasData ? (
             <EmptyChart label="member growth" />
          ) : (
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 900 }} dx={-10} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#FAFAFA' }}
                    contentStyle={{ borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)', fontWeight: 'black', color: '#111111' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    itemStyle={{ color: '#ccff00' }}
                    formatter={(val: any) => [val, 'New Joins']}
                  />
                  <Bar dataKey="joins" fill="#ccff00" radius={[8, 8, 4, 4]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* PLANS TABLE */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden mt-6">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
           <div>
             <h2 className="text-xl font-black text-[#111111] tracking-tighter">Plan Distribution</h2>
             <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-2">Where your revenue is coming from</p>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Plan Name</th>
                <th className="px-8 py-5 text-right">Active Members</th>
                <th className="px-8 py-5 text-right">Yield (MRR)</th>
                <th className="px-8 py-5">Portfolio %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plans.length === 0 ? (
                 <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-gray-400 font-bold text-sm bg-[#FAFAFA]">No active plans detected.</td>
                 </tr>
              ) : (
                plans.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-8 py-6">
                       <span className="inline-flex items-center gap-3 font-black text-sm text-[#111111]">
                         {i === 0 && <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] shadow-[0_0_10px_#ccff00]"></span>}
                         {p.name}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-[15px] font-black text-gray-400 text-right">
                       {p.count}
                    </td>
                    <td className="px-8 py-6 text-lg font-black tracking-tighter text-[#111111] text-right">
                       ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-8 py-6 w-1/3">
                       <div className="flex items-center gap-4">
                          <span className="text-[11px] font-black text-gray-400 w-8">{p.percentage}%</span>
                          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${i === 0 ? 'bg-[#ccff00]' : 'bg-[#111111]'}`} style={{ width: `${p.percentage}%` }}></div>
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
    <div className={`bg-white p-6 sm:p-8 rounded-[32px] border flex flex-col justify-between min-h-[160px] transition-transform duration-300 hover:-translate-y-1 ${isAlert ? 'border-red-500 shadow-[0_10px_40px_rgba(239,68,68,0.1)]' : 'border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]'}`}>
      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed mb-4">{title}</h3>
      {empty ? (
         <p className="text-4xl font-black text-gray-200 tracking-tighter">-</p>
      ) : (
         <p className={`text-4xl sm:text-5xl font-black tracking-tighter ${isAlert ? 'text-red-500' : 'text-[#111111]'}`}>{value}</p>
      )}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
   return (
      <div className="flex-1 flex flex-col border-2 border-dashed border-gray-100 rounded-[24px] items-center justify-center text-center p-8 bg-[#FAFAFA]">
         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
         <p className="text-[13px] font-black uppercase tracking-widest text-[#111111] mb-1">No {label} recorded yet.</p>
         <p className="text-sm font-bold text-gray-400 mt-2 max-w-[250px] leading-relaxed">Metrics will appear here automatically once data begins logging.</p>
      </div>
   );
}
