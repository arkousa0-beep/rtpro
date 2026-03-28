import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const cairo = localFont({
  src: "./fonts/Cairo-Variable.ttf",
  display: "swap",
  variable: "--font-cairo",
});

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
        <ServiceWorkerRegister />
        <OfflineIndicator />
        
        <AppShell>
          {children}
        </AppShell>

        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
