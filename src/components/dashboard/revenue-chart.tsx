"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function RevenueChart({ data, hasData }: { data: any[], hasData: boolean }) {
  if (!hasData) {
    return (
      <div className="h-full w-full flex items-center justify-center flex-col gap-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
         <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
         </div>
         <p className="text-sm text-slate-500 font-semibold tracking-wide">Collect payments to see trends.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip 
           contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 700, fontSize: '13px' }}
           formatter={(value) => [`₹${value}`, 'Revenue']}
           labelStyle={{ color: '#64748b', marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#6366f1" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
