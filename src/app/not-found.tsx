import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
          <SearchX className="w-10 h-10 text-white/30" />
        </div>
        <div className="space-y-2">
          <p className="text-8xl font-black text-white/10 tracking-tighter">404</p>
          <h2 className="text-2xl font-black text-white">الصفحة غير موجودة</h2>
          <p className="text-white/40 text-sm font-medium">
            الصفحة التي تبحث عنها غير موجودة أو تم نقلها
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-12 px-8 rounded-2xl bg-primary text-black font-black hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
