"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CheckCircle2, ChevronDown, Check, Target, Zap, Clock, Users, AlertCircle, RefreshCw, BarChart3, MessageSquare, Smartphone } from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqData = [
    { q: "Is the setup fee refundable?", a: "The setup fee covers our team's time integrating your existing sheets and systems to GymNav. While it is non-refundable, it ensures a seamless zero-downtime transition." },
    { q: "Can my members pay directly through GymNav?", a: "Yes! We integrate with popular payment gateways allowing your users to pay seamlessly via UPI, Cards, or Netbanking." },
    { q: "Do I need technical knowledge to use this?", a: "Not at all. GymNav is designed to be as simple as Notion or standard CRMs. If you can use WhatsApp or Excel, you can use our system." },
    { q: "What happens if I cross my plan's member limit?", a: "We will automatically notify you before you hit the limit. You can seamlessly upgrade to the next tier from your billing dashboard without any disruption." },
    { q: "Is there a mobile app?", a: "GymNav is a meticulously responsive web app, functioning flawlessly on mobile browsers. We also provide a PWA you can save to your homescreen." }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-200 bg-white ${isScrolled ? "border-b border-slate-200 shadow-sm py-3" : "py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                 <Target className="w-5 h-5 text-white stroke-[2.5]" />
               </div>
               <span className="font-semibold text-xl tracking-tight">GymNav</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
              <Link href="#faq" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">FAQ</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-900 hover:text-indigo-500 transition-colors">Login</Link>
              <Link href="/signup" className="text-sm font-medium bg-indigo-500 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-600 transition-colors shadow-sm">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">Your Gym Runs Itself.</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            GymNav automates member renewals, payment collection, and daily operations so you can focus on growing your gym.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm text-base">
              Start Free Trial
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-900 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-base">
              See How It Works
            </Link>
          </div>
          <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
            <div className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-full text-sm font-medium flex items-center shadow-sm">
               <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2.5"></span>
               ₹2.4L recovered monthly
            </div>
            <div className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-full text-sm font-medium flex items-center shadow-sm">
               <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2.5"></span>
               40% less churn
            </div>
            <div className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-full text-sm font-medium flex items-center shadow-sm">
               <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2.5"></span>
               3 hrs saved daily
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Gym owners spend more time chasing payments than running their gym.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-start">
                 <div className="absolute top-0 left-0 w-full h-1 bg-red-400"></div>
                 <AlertCircle className="w-8 h-8 text-red-500 mb-6" />
                 <h3 className="text-xl font-semibold mb-2">Manual renewal follow-ups</h3>
                 <p className="text-red-500 text-sm font-semibold mb-4 bg-red-50 inline-block px-3 py-1 rounded">60% expire due to missed calls</p>
                 <p className="text-slate-500 text-sm leading-relaxed">Stop calling numbers that don't pick up. Manual WhatsApp messages are tedious and rarely scale.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-start">
                 <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                 <RefreshCw className="w-8 h-8 text-amber-500 mb-6" />
                 <h3 className="text-xl font-semibold mb-2">Failed payment chaos</h3>
                 <p className="text-amber-600 text-sm font-semibold mb-4 bg-amber-50 inline-block px-3 py-1 rounded">₹45k outstanding per 100 users</p>
                 <p className="text-slate-500 text-sm leading-relaxed">Tracking who paid on UPI, cash, or credit card in notebooks leads to massive revenue leakage.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-start">
                 <div className="absolute top-0 left-0 w-full h-1 bg-slate-400"></div>
                 <Users className="w-8 h-8 text-slate-400 mb-6" />
                 <h3 className="text-xl font-semibold mb-2">Empty class slots</h3>
                 <p className="text-slate-600 text-sm font-semibold mb-4 bg-slate-100 inline-block px-3 py-1 rounded">30% daily capacity unused</p>
                 <p className="text-slate-500 text-sm leading-relaxed">Without automated booking flows, trainers sit idle and the community feels fractured.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight">How it works</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
               <div className="hidden md:block absolute top-[2rem] left-[20%] right-[20%] h-[2px] bg-slate-100"></div>
               <div className="relative text-center z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border-2 border-slate-200 shadow-sm rounded-full flex items-center justify-center text-2xl font-bold text-indigo-500 mb-6">1</div>
                  <h3 className="text-xl font-semibold mb-3">Add your members</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">Import from excel or add them manually. Set their plan and billing date.</p>
               </div>
               <div className="relative text-center z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border-2 border-slate-200 shadow-sm rounded-full flex items-center justify-center text-2xl font-bold text-indigo-500 mb-6">2</div>
                  <h3 className="text-xl font-semibold mb-3">GymNav sends reminders</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">Through SMS & WhatsApp on schedule. 7 days before, Day 0, and post expiry.</p>
               </div>
               <div className="relative text-center z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border-2 border-slate-200 shadow-sm rounded-full flex items-center justify-center text-2xl font-bold text-indigo-500 mb-6">3</div>
                  <h3 className="text-xl font-semibold mb-3">Payments collected instantly</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">Members pay on autogenerated links. Your dashboard instantly reflects the updated revenue.</p>
               </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight">Everything you need</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard title="Automated Reminders" desc="Setup automated WhatsApp and SMS nudges. Never make an awkward collection call again." icon={<Smartphone className="w-6 h-6 text-indigo-500 stroke-[2]" />} />
              <FeatureCard title="Smart Renewal Tracking" desc="Instantly see who is at risk of churning and proactively offer them deals." icon={<Clock className="w-6 h-6 text-indigo-500 stroke-[2]" />} />
              <FeatureCard title="Member Check-In (QR)" desc="Give members a seamless entry experience with individualized QR codes generated instantly." icon={<CheckCircle2 className="w-6 h-6 text-indigo-500 stroke-[2]" />} />
              <FeatureCard title="AI Daily Briefing" desc="Get a daily morning brief on exactly who requires your attention today, powered by Gemini." icon={<MessageSquare className="w-6 h-6 text-indigo-500 stroke-[2]" />} />
              <FeatureCard title="Lead Pipeline" desc="Capture leads from instagram ads right into a Kanban board. Assign follow ups seamlessly." icon={<Zap className="w-6 h-6 text-indigo-500 stroke-[2]" />} />
              <FeatureCard title="Revenue Analytics" desc="See exact cash flow metrics. Compare P&L across months without dealing with complex spreadsheets." icon={<BarChart3 className="w-6 h-6 text-indigo-500 stroke-[2]" />} />
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Simple, predictable pricing</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">All plans include a one-time setup fee of ₹2,999 to cover integration and onboarding.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
               <PricingCard title="Starter" price="1,999" limits="up to 100 members" popular={false} features={['Core Member DB', 'Automated Reminders', 'Basic Analytics', 'Email Support']} />
               <PricingCard title="Growth" price="3,999" limits="up to 300 members" popular={true} features={['All Starter features', 'AI Daily Briefings', 'Lead Pipeline', 'QR Check-in System', 'Priority Support']} />
               <PricingCard title="Pro" price="6,999" limits="unlimited members" popular={false} features={['All Growth features', 'Multi-location Ready', 'Custom API Access', 'Dedicated Account Manager', 'White-labeled App']} />
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight">Frequently asked questions</h2>
            </div>
            <div className="space-y-4">
               {faqData.map((faq, i) => (
                 <div key={i} className={`bg-white border rounded-xl overflow-hidden transition-colors ${activeFaq === i ? 'border-indigo-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                   <button 
                     onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                     className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                   >
                     <span className="font-semibold text-lg">{faq.q}</span>
                     <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${activeFaq === i ? 'rotate-180 text-indigo-500' : ''}`} />
                   </button>
                   {activeFaq === i && (
                     <div className="px-6 pb-5 text-slate-500 leading-relaxed border-t border-slate-100 pt-4 mt-1">
                       {faq.a}
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
               <Target className="w-5 h-5 text-white stroke-[2.5]" />
             </div>
             <span className="font-semibold text-xl tracking-tight">GymNav</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} GymNav Technologies. All rights reserved.</p>
          <div className="flex space-x-6 text-sm mt-4 md:mt-0 font-medium">
             <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Privacy</Link>
             <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Terms</Link>
             <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow group">
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-6 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function PricingCard({ title, price, limits, popular, features }: { title: string, price: string, limits: string, popular: boolean, features: string[] }) {
  return (
    <div className={`relative bg-white p-8 rounded-2xl border ${popular ? 'border-indigo-500 shadow-xl lg:-mt-4 lg:mb-[-1rem] z-10' : 'border-slate-200 shadow-sm'} flex flex-col h-full`}>
      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="mb-4 flex items-baseline">
         <span className="text-4xl font-bold tracking-tight">₹{price}</span>
         <span className="text-slate-500 text-sm ml-1 font-medium">/mo</span>
      </div>
      <p className="text-xs font-bold text-indigo-600 mb-8 bg-indigo-50 inline-block px-3 py-1.5 rounded-lg w-max tracking-wide uppercase">{limits}</p>
      
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start text-sm text-slate-600 font-medium">
             <Check className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
             <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>
      <Link href="/signup" className={`w-full py-3.5 rounded-xl text-center font-semibold transition-all shadow-sm ${popular ? 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-md' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
        Get Started
      </Link>
    </div>
  )
}
