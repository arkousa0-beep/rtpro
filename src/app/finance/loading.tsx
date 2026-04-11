import { Loader2, TrendingUp } from "lucide-react";

export default function FinanceLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center relative">
        <TrendingUp className="w-10 h-10 text-indigo-500" />
        <Loader2 className="absolute -top-1 -right-1 w-6 h-6 animate-spin text-indigo-400" />
      </div>
      <p className="text-indigo-500/60 text-xs font-black tracking-tighter uppercase">
        جاري تحليل البيانات المالية...
      </p>
    </div>
  );
}
