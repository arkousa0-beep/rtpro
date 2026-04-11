import { Loader2, ShoppingCart } from "lucide-react";

export default function POSLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center relative transform rotate-12">
        <ShoppingCart className="w-10 h-10 text-emerald-500" />
        <Loader2 className="absolute -top-1 -right-1 w-6 h-6 animate-spin text-emerald-400" />
      </div>
      <p className="text-emerald-500/60 text-xs font-black tracking-tighter uppercase">
        جاري تجهيز نقطة البيع...
      </p>
    </div>
  );
}
