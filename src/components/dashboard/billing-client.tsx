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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] mt-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex overflow-x-auto no-scrollbar space-x-1 sm:pr-6 sm:border-r border-gray-100 pb-2 sm:pb-0">
             {['All', 'Paid', 'Pending', 'Failed'].map(f => (
               <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`px-4 py-2.5 text-[13px] font-black tracking-widest uppercase rounded-2xl transition-colors whitespace-nowrap ${filter === f ? 'bg-[#111111] text-[#ccff00] shadow-sm' : 'text-gray-400 hover:bg-[#FAFAFA] hover:text-[#111111]'}`}
               >
                  {f}
               </button>
             ))}
          </div>
          <span className="text-sm font-bold text-gray-400 whitespace-nowrap">{filteredPayments.length} records</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-64">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
             <input type="text" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 text-[13px] font-bold border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#FAFAFA] focus:bg-white transition-all shadow-sm text-[#111111]" />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-[#111111] text-[#ccff00] text-[13px] font-black tracking-widest uppercase rounded-full hover:bg-[#ccff00] hover:text-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all flex items-center gap-2 shrink-0">
            <PlusIcon /> Add Payment
          </button>
        </div>
      </div>

      {/* 3. TABLE */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Member</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Due Date</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions / Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-bold text-sm bg-[#FAFAFA]">No payment records found matching your filters.</td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-8 py-5">
                       <p className="text-sm font-black text-[#111111]">{p.members?.full_name || 'Unknown Member'}</p>
                       <p className="text-[11px] font-bold text-gray-400">{p.members?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-8 py-5 text-xl font-black text-[#111111] tracking-tighter">
                       ₹{p.amount}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500">
                       {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                       <StatusBadge status={p.status} />
                       {p.status === 'paid' && p.paid_at && (
                          <div className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">{new Date(p.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                       )}
                    </td>
                    <td className="px-8 py-5 text-right">
                       {p.status === 'failed' && (
                          <div className="flex justify-end gap-3">
                             <button onClick={() => handleSendReminder(p)} className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-full text-[11px] font-black tracking-widest uppercase transition-colors flex items-center gap-2"><WhatsAppIcon /> Remind</button>
                             <button onClick={() => handleMarkPaid(p.id)} disabled={savingId === p.id} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-full text-[11px] font-black tracking-widest uppercase transition-colors shadow-sm disabled:opacity-50"><CheckIcon /> Mark Paid</button>
                          </div>
                       )}
                       {p.status === 'pending' && (
                          <div className="flex justify-end gap-3">
                             <button onClick={() => handleSendReminder(p)} className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-full text-[11px] font-black tracking-widest uppercase transition-colors flex items-center gap-2"><WhatsAppIcon /> Remind</button>
                             <button onClick={() => handleMarkPaid(p.id)} disabled={savingId === p.id} className="px-4 py-2 bg-[#FAFAFA] border border-gray-200 text-[#111111] hover:border-[#111111] hover:bg-white rounded-full text-[11px] font-black tracking-widest uppercase transition-colors"><CheckIcon /> Mark Paid</button>
                          </div>
                       )}
                       {p.status === 'paid' && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAFAFA] text-gray-400 rounded-full text-[11px] font-black tracking-widest uppercase cursor-not-allowed">
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
    paid: 'bg-[#111111] text-[#ccff00]',
    pending: 'bg-white text-[#111111] border border-gray-200',
    failed: 'bg-red-500 text-white'
  };
  const c = map[status.toLowerCase()] || 'bg-gray-100 text-[#111111]';
  return <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${c}`}>{status}</span>;
}

function KPICard({ title, value, isAlert = false, isPositive = false }: any) {
  return (
    <div className={`bg-white p-6 sm:p-8 rounded-[32px] border shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[140px] transition-transform duration-300 hover:-translate-y-1 ${isAlert ? 'border-red-500' : 'border-gray-100'}`}>
      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{title}</h3>
      <p className={`text-4xl sm:text-5xl font-black tracking-tighter ${isAlert ? 'text-red-500' : isPositive ? 'text-[#ccff00] bg-[#111111] w-max px-3 py-1 rounded-xl' : 'text-[#111111]'}`}>{value}</p>
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm sm:p-0">
       <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
             <h2 className="text-2xl font-black text-[#111111] tracking-tighter">Record New Payment</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-[#111111] transition-colors"><XIcon /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
             <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Member</label>
                <select required value={formData.member_id} onChange={e=>setFormData({...formData, member_id: e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-[13px] font-bold bg-[#FAFAFA] focus:bg-white text-[#111111] transition-colors cursor-pointer appearance-none">
                   <option value="" disabled>Select a member...</option>
                   {members.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                   ))}
                </select>
             </div>
             <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Amount (₹)</label>
                <div className="relative">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</span>
                   <input required type="number" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} placeholder="e.g. 5000" className="w-full pl-10 pr-5 py-3.5 rounded-[20px] border border-gray-100 focus:ring-2 focus:ring-[#ccff00] outline-none text-xl font-black bg-[#FAFAFA] focus:bg-white text-[#111111] transition-colors placeholder:text-gray-300" />
                </div>
             </div>
             <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Status</label>
                <div className="flex gap-2 p-1.5 bg-[#FAFAFA] rounded-[20px] border border-gray-100">
                   {['paid', 'pending', 'failed'].map(s => (
                      <button 
                         key={s} type="button" 
                         onClick={() => setFormData({...formData, status: s})} 
                         className={`flex-1 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${formData.status === s ? 'bg-[#111111] text-[#ccff00] shadow-[0_10px_20px_rgba(0,0,0,0.1)]' : 'text-gray-400 hover:text-[#111111] hover:bg-gray-100'}`}
                      >
                         {s}
                      </button>
                   ))}
                </div>
             </div>
             <button disabled={saving || !formData.member_id} type="submit" className="w-full bg-[#111111] text-[#ccff00] text-[13px] font-black tracking-widest uppercase py-4 rounded-full hover:bg-[#ccff00] hover:text-[#111111] transition-colors shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center mt-8">
                {saving ? 'Processing...' : 'Record Payment'}
             </button>
          </form>
       </div>
    </div>
  )
}
