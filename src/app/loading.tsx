import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse rounded-full" />
      </div>
      <p className="text-white/40 text-sm font-black tracking-widest uppercase animate-pulse">
        جاري التحميل...
      </p>
    </div>
  );
}
