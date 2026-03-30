"use client";

import { useEffect, useState } from "react";

export function toast(message: string, type: "success" | "error" = "success") {
   const event = new CustomEvent("gymnav-toast", { detail: { message, type } });
   window.dispatchEvent(event);
}

export function Toaster() {
   const [open, setOpen] = useState(false);
   const [toastData, setToastData] = useState({ message: "", type: "success" });

   useEffect(() => {
      const handleToast = (e: any) => {
         setToastData(e.detail);
         setOpen(true);
         
         const timer = setTimeout(() => {
            setOpen(false);
         }, 3000);
         
         return () => clearTimeout(timer);
      };

      window.addEventListener("gymnav-toast", handleToast);
      return () => window.removeEventListener("gymnav-toast", handleToast);
   }, []);

   if (!open) return null;

   const isSuccess = toastData.type === "success";

   return (
      <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
         <div className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
            isSuccess ? 'bg-white border-green-100 shadow-green-500/10' : 'bg-red-50 border-red-200 shadow-red-500/10'
         }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
               {isSuccess ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
               ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               )}
            </div>
            <p className={`text-sm font-bold ${isSuccess ? 'text-slate-800' : 'text-red-900'}`}>{toastData.message}</p>
         </div>
      </div>
   );
}
