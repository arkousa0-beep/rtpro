import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | سمارت ستور",
  description: "سجل الدخول لإدارة مخزونك ومبيعاتك",
};

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-2 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">RT PRO</h1>
        <div className="h-1.5 w-16 bg-primary mx-auto rounded-full shadow-lg shadow-primary/50" />
      </div>
      
      <LoginForm />
      
      <div className="mt-12 flex flex-col items-center gap-4">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">سمارت ستور • تكنولوجيا إدارة المخازن</p>
        <p className="text-white/20 text-[10px] text-center max-w-xs mx-auto">
          جميع الحقوق محفوظة © {new Date().getFullYear()} • تصميم وتطوير بواسطة فريق المحترفين
        </p>
      </div>
      
      {/* Background gradients for premium feel */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0a0a0b]" />
      <div className="fixed top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-orange-950/20 blur-[150px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
