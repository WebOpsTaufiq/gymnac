"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

// --- Inline SVGs ---
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const WhatsAppIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const XIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function BillingClient({ data, gymId }: { data: any, gymId: string }) {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>(data.payments);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filter Logic
  const filteredPayments = useMemo(() => {
     let res = payments;
     if (filter !== "All") {
        res = res.filter(p => p.status.toLowerCase() === filter.toLowerCase());
     }
     if (search) {
        const lower = search.toLowerCase();
        res = res.filter(p => p.members?.full_name?.toLowerCase().includes(lower) || p.amount?.toString().includes(lower));
     }
     return res;
  }, [payments, filter, search]);

  // Handlers
  const handleMarkPaid = async (id: string) => {
     setSavingId(id);
     
     // Optimistic
     setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid', paid_at: new Date().toISOString() } : p));
     
     await supabase
       .from('payments')
       .update({ status: 'paid', paid_at: new Date().toISOString() })
       .eq('id', id);
       
     setSavingId(null);
  };

  const handleSendReminder = (payment: any) => {
     const phone = payment.members?.phone?.replace(/\D/g, '');
     if (!phone) {
        alert("This member does not have a phone number on file.");
        return;
     }

     const dateStr = new Date(payment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
     // WhatsApp Web uses wa.me template
     const text = encodeURIComponent(
        `Hi ${payment.members.full_name}, this is a gentle reminder that your payment of ₹${payment.amount} at ${data.gymName} was due on ${dateStr}. Please complete your payment to continue your membership. Thank you!`
     );
     
     const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
     window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  const handleAddPayment = (newPayment: any) => {
     setPayments(prev => [newPayment, ...prev]);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Collected This Month" value={`₹${data.kpis.collected.toLocaleString('en-IN')}`} isPositive={true} />
        <KPICard title="Pending Value" value={`₹${data.kpis.pending.toLocaleString('en-IN')}`} isAlert={data.kpis.pending > 5000} />
        <KPICard title="Failed Transactions" value={data.kpis.failed} isAlert={data.kpis.failed > 0} />
        <KPICard title="Recovery Rate" value={`${data.kpis.recoveryRate}%`} />
      </div>

      {/* 2. TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex overflow-x-auto no-scrollbar space-x-1 sm:pr-6 sm:border-r border-slate-200 pb-2 sm:pb-0">
             {['All', 'Paid', 'Pending', 'Failed'].map(f => (
               <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
               >
                  {f}
               </button>
             ))}
          </div>
          <span className="text-sm font-bold text-slate-400 whitespace-nowrap">{filteredPayments.length} records</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></div>
             <input type="text" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all shadow-sm" />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 shrink-0">
            <PlusIcon /> Add Payment
          </button>
        </div>
      </div>

      {/* 3. TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions / Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">No payment records found matching your filters.</td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-900">{p.members?.full_name || 'Unknown Member'}</p>
                       <p className="text-xs font-semibold text-slate-400">{p.members?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-700">
                       ₹{p.amount}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                       {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                       <StatusBadge status={p.status} />
                       {p.status === 'paid' && p.paid_at && (
                          <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(p.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {p.status === 'failed' && (
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleSendReminder(p)} className="px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"><WhatsAppIcon /> Remind</button>
                             <button onClick={() => handleMarkPaid(p.id)} disabled={savingId === p.id} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"><CheckIcon /> Mark Paid</button>
                          </div>
                       )}
                       {p.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleSendReminder(p)} className="px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"><WhatsAppIcon /> Remind</button>
                             <button onClick={() => handleMarkPaid(p.id)} disabled={savingId === p.id} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"><CheckIcon /> Mark Paid</button>
                          </div>
                       )}
                       {p.status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-xs font-bold border border-slate-100 cursor-not-allowed">
                             <CheckIcon /> Settled
                          </span>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         gymId={gymId} 
         members={data.members} 
         supabase={supabase}
         onSave={handleAddPayment}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    failed: 'bg-red-100 text-red-700 border-red-200'
  };
  const c = map[status.toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-widest border rounded-full ${c}`}>{status}</span>;
}

function KPICard({ title, value, isAlert = false, isPositive = false }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center min-h-[120px]">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</h3>
      <p className={`text-4xl font-black tracking-tight ${isAlert ? 'text-red-500' : isPositive ? 'text-green-500' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function PaymentModal({ isOpen, onClose, gymId, members, supabase, onSave }: any) {
  const [formData, setFormData] = useState({
     member_id: '',
     amount: '',
     status: 'paid'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     setSaving(true);
     
     const payload = {
        gym_id: gymId,
        member_id: formData.member_id,
        amount: Number(formData.amount) || 0,
        status: formData.status,
        paid_at: formData.status === 'paid' ? new Date().toISOString() : null
     };

     const { data } = await supabase.from('payments').insert(payload).select('*, members(full_name, phone)').single();
     if (data) onSave(data);
     
     setSaving(false);
     onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm sm:p-0">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h2 className="text-lg font-bold text-slate-900">Record New Payment</h2>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors"><XIcon /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Member</label>
                <select required value={formData.member_id} onChange={e=>setFormData({...formData, member_id: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors cursor-pointer">
                   <option value="" disabled>Select a member...</option>
                   {members.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                   ))}
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                   <input required type="number" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} placeholder="e.g. 5000" className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-black bg-slate-50 focus:bg-white transition-colors" />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Payment Status</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                   {['paid', 'pending', 'failed'].map(s => (
                      <button 
                         key={s} type="button" 
                         onClick={() => setFormData({...formData, status: s})} 
                         className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.status === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                      >
                         {s}
                      </button>
                   ))}
                </div>
             </div>
             <button disabled={saving || !formData.member_id} type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center mt-6">
                {saving ? 'Processing...' : 'Record Payment'}
             </button>
          </form>
       </div>
    </div>
  )
}
