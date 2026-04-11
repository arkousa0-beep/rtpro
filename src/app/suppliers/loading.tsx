import { Loader2, Truck } from "lucide-react";

export default function SuppliersLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-20 h-20 rounded-[2.5rem] bg-orange-500/10 flex items-center justify-center relative">
        <Truck className="w-10 h-10 text-orange-500" />
        <Loader2 className="absolute -top-1 -right-1 w-6 h-6 animate-spin text-orange-400" />
      </div>
      <p className="text-orange-500/60 text-xs font-black tracking-tighter uppercase">
        جاري معالجة بيانات الموردين...
      </p>
    </div>
  );
}
