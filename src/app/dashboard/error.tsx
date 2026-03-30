"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100/50">
         <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Something went wrong</h2>
      <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-8">
         We couldn't load this section of your dashboard. This might be a temporary connection issue.
      </p>
      
      <button 
         onClick={() => reset()} 
         className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all active:scale-95 flex items-center gap-2"
      >
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
         Try Again
      </button>
    </div>
  );
}
