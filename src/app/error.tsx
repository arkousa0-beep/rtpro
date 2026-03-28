"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">حدث خطأ</h2>
          <p className="text-white/40 text-sm font-medium">
            {error.message || "تعذّر تحميل هذه الصفحة"}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2 h-12 px-6 rounded-2xl bg-primary text-black font-black"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
          <Button asChild variant="ghost" className="gap-2 h-12 px-6 rounded-2xl text-white/60 hover:text-white">
            <Link href="/">
              <Home className="w-4 h-4" />
              الرئيسية
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
