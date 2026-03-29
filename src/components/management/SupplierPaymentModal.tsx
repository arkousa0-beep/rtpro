"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft,
  Activity
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supplierService } from "@/lib/services/supplierService";
import { useToast } from "@/hooks/use-toast";
import { useDataStore } from "@/lib/store/dataStore";
import { Supplier } from "@/lib/database.types";

interface SupplierPaymentModalProps {
  supplierId: string;
  supplierName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type PaymentMethod = 'Cash' | 'Card' | 'Transfer';

export function SupplierPaymentModal({
  supplierId,
  supplierName,
  open,
  onOpenChange,
  onSuccess
}: SupplierPaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [loading, setLoading] = useState(false);
  const { updateSupplier, suppliers } = useDataStore();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      await supplierService.recordPayment(supplierId, Number(amount), method);
      
      // Update global store for instant UI reactivity
      const currentSupplier = suppliers.find(s => s.id === supplierId);
      if (currentSupplier) {
        updateSupplier(supplierId, { 
          balance: Number(currentSupplier.balance || 0) - Number(amount) 
        });
      }

      toast({
        title: "تم تسجيل الدفعة بنجاح",
        description: `تم سداد ${amount} ج.م للمورد ${supplierName}`,
      });
      onSuccess();
      onOpenChange(false);
      setAmount("");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدفعة",
        description: "حدث خطأ أثناء محاولة تسجيل العملية، يرجى المحاولة لاحقاً",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/80 backdrop-blur-2xl border-white/5 rounded-[2.5rem] p-6 outline-none max-w-md w-[95%]">
        <DialogHeader className="pb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 mx-auto mb-4 mt-2">
            <Wallet className="w-7 h-7" />
          </div>
          <DialogTitle className="text-center text-2xl font-black text-white tracking-tight">
            تسجيل دفعة للمورد
          </DialogTitle>
          <p className="text-center text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            {supplierName}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white/40 text-[10px] font-black uppercase tracking-widest pr-2">المبلغ المراد سداده</Label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-white/5 border-white/5 h-14 rounded-2xl text-xl font-black text-white px-6 focus:ring-amber-500/20 focus:border-amber-500/20"
                autoFocus
                required
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black">ج.م</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/40 text-[10px] font-black uppercase tracking-widest pr-2">طريقة الدفع</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', label: 'كاش', icon: Banknote },
                { id: 'Card', label: 'فيزا', icon: CreditCard },
                { id: 'Transfer', label: 'تحويل', icon: ArrowRightLeft },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as PaymentMethod)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1.5",
                    method === m.id 
                    ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 scale-[1.02]" 
                    : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10"
                  )}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading || !amount}
            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg gap-3 border border-white/10 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
          >
            {loading ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                تأكيد العملية
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
