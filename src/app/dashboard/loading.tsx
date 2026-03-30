import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
       <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
       </div>
       <h2 className="text-xl font-black text-slate-900 tracking-tight mt-6">Loading Workspace...</h2>
       <p className="text-sm font-medium text-slate-500 mt-2 max-w-[280px] text-center">Crunching the latest data from your GymNav database.</p>
    </div>
  );
}
