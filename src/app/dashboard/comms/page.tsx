"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const CopyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const WhatsAppIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;

const templates = [
  {
     id: 'renewal',
     name: 'Renewal Reminder',
     content: 'Hi [Name], just a quick reminder that your GymNav membership expires on [Date]. Please renew at the front desk or via our portal to avoid service interruption!'
  },
  {
     id: 'payment',
     name: 'Payment Reminder',
     content: 'Hi [Name], we noticed your recent payment of ₹[Amount] is pending. Please clear the balance at your earliest convenience. Thank you!'
  },
  {
     id: 'welcome',
     name: 'Welcome Message',
     content: 'Welcome to the GymNav family, [Name]! We are thrilled to have you here. Drop by the front desk if you need an orientation or a complimentary fitness assessment.'
  },
  {
     id: 'at_risk',
     name: 'At-Risk Member Check-in',
     content: 'Hi [Name], we missed you at the gym recently! Consistency is key to reaching your goals. Let us know if we can help you get back on track.'
  }
];

export default function CommsPage() {
  const supabase = createClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCopy = (id: string, text: string) => {
     navigator.clipboard.writeText(text);
     setCopiedId(id);
     setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
     const fetchExpiring = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', session.user.id).single();
        if (!profile?.gym_id) return;

        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const { data } = await supabase
          .from('members')
          .select('id, full_name, phone, renewal_date')
          .eq('gym_id', profile.gym_id)
          .gte('renewal_date', today.toISOString().split('T')[0])
          .lte('renewal_date', nextWeek.toISOString().split('T')[0]);

        setExpiringMembers(data || []);
        setLoading(false);
     };
     fetchExpiring();
  }, [supabase]);

  const sendReminder = (member: any) => {
     const phone = member.phone?.replace(/\D/g, '');
     if (!phone) {
        alert("This member does not have a valid phone number.");
        return;
     }

     const text = encodeURIComponent(
        `Hi ${member.full_name}, your membership is expiring on ${new Date(member.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. Let us know if you'd like to renew!`
     );
     
     const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
     window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      
      <div>
         <h1 className="text-2xl font-black text-slate-900 tracking-tight">Communications Hub</h1>
         <p className="text-slate-500 font-medium mt-1">Manage client outreach and WhatsApp templates</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         {/* LEFT COL: Templates */}
         <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Pre-built WhatsApp Templates</h2>
            <div className="grid gap-4">
               {templates.map(t => (
                  <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
                     <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-800">{t.name}</h3>
                        <button 
                           onClick={() => handleCopy(t.id, t.content)}
                           className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${copiedId === t.id ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'}`}
                        >
                           {copiedId === t.id ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                        </button>
                     </div>
                     <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {t.content}
                     </p>
                  </div>
               ))}
            </div>
         </div>

         {/* RIGHT COL: Bulk Actions */}
         <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Automated Actions</h2>
            
            <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md shadow-indigo-100/50">
               <h3 className="font-bold text-slate-900 mb-1">Expiring Members (Next 7 Days)</h3>
               <p className="text-sm font-medium text-slate-500 mb-6">Members whose accounts require immediate renewal intervention.</p>
               
               {loading ? (
                  <div className="animate-pulse space-y-3">
                     <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                     <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                  </div>
               ) : expiringMembers.length === 0 ? (
                  <div className="text-center py-6 bg-green-50 rounded-xl border border-green-100 text-green-700 font-bold text-sm">
                     All caught up! No members expiring within 7 days.
                  </div>
               ) : (
                  <div className="space-y-3">
                     {expiringMembers.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                           <div>
                              <p className="font-bold text-sm text-slate-900">{m.full_name}</p>
                              <p className="text-xs font-semibold text-slate-500">Exp. {new Date(m.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                           </div>
                           <button 
                              onClick={() => sendReminder(m)}
                              className="px-4 py-2 bg-[#25D366] hover:bg-[#20b858] text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
                           >
                              <WhatsAppIcon /> Send
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
      
    </div>
  )
}
