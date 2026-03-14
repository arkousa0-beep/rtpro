import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Omnibar } from "@/components/layout/Omnibar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const cairo = Cairo({ subsets: ["arabic"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "سمارت ستور | إدارة المخازن والمبيعات",
  description: "نظام ذكي لإدارة المخازن والمبيعات بنظام السيريال نمبر",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "سمارت ستور",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={cn(cairo.className, "min-h-screen bg-background text-foreground antialiased selection:bg-primary/30")}>
        <header className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b flex items-center justify-between px-6">
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-medium text-primary/80 mb-0.5">RT PRO</span>
            <h1 className="text-xl font-black tracking-tight text-white">سمارت ستور</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />
            <Omnibar />
          </div>
        </header>

        <main className="pt-20 pb-24 px-4 w-full max-w-md md:max-w-4xl mx-auto min-h-screen">
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Subtle Background Elements for Luxury feel */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
          </div>
        </main>

        <BottomNav />
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
