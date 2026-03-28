"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Banknote, CreditCard, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { debtService } from '@/lib/services/debtService';
import { cn } from '@/lib/utils';

type PaymentMethod = 'Cash' | 'Card' | 'Transfer';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityName: string;
  currentBalance: number;
  onSuccess: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'Cash',     label: 'كاش',    icon: <Banknote className="w-4 h-4" /> },
  { id: 'Card',     label: 'فيزا',   icon: <CreditCard className="w-4 h-4" /> },
  { id: 'Transfer', label: 'تحويل',  icon: <ArrowLeftRight className="w-4 h-4" /> },
];

export const PaymentModal = ({
  isOpen,
  onClose,
  entityId,
  entityName,
  currentBalance,
  onSuccess
}: PaymentModalProps) => {
  const [amount, setAmount]               = useState<string>('');
  const [method, setMethod]               = useState<PaymentMethod>('Cash');
  const [loading, setLoading]             = useState(false);

  const handleClose = () => {
    setAmount('');
    setMethod('Cash');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (numAmount > currentBalance) {
      toast.error('المبلغ المدخل أكبر من الرصيد المتبقي');
      return;
    }

    setLoading(true);
    try {
      await debtService.processPayment(entityId, numAmount, method);
      toast.success(`تم تحصيل ${numAmount.toLocaleString()} ج.م بنجاح`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء المعالجة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass border-white/10 bg-black/90 backdrop-blur-2xl text-white rounded-[2rem] sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right">
            تحصيل مديونية
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Customer name & balance */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3 text-right">
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">العميل</p>
              <p className="text-xl font-black text-white">{entityName}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">الرصيد الحالي</p>
              <p className="text-2xl font-black text-red-400 tabular-nums">
                {Number(currentBalance).toLocaleString()} <span className="text-sm">ج.م</span>
              </p>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="space-y-2 text-right">
            <Label className="text-white/40 font-bold text-xs uppercase tracking-widest">طريقة الاستلام</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-black transition-all duration-200",
                    method === m.id
                      ? "bg-primary/20 border-primary text-primary scale-[1.03]"
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white/70"
                  )}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2 text-right">
            <Label htmlFor="pay-amount" className="text-white/40 font-bold text-xs uppercase tracking-widest">المبلغ المُحصَّل</Label>
            <div className="relative">
              <Input
                id="pay-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max={currentBalance}
                className="h-16 text-center text-3xl font-black bg-white/5 border-white/10 rounded-2xl focus:border-primary transition-all pr-16 text-white"
                autoFocus
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">ج.م</span>
            </div>
            {/* Quick fill buttons */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setAmount(String(currentBalance))}
                className="text-[10px] font-black text-primary/70 hover:text-primary transition-colors px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20"
              >
                سداد كامل ({Number(currentBalance).toLocaleString()})
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row-reverse">
            <Button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 h-14 rounded-2xl bg-primary text-black font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              {loading
                ? <Loader2 className="w-6 h-6 animate-spin" />
                : `تأكيد التحصيل`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-14 px-6 rounded-2xl border-white/10 text-white hover:bg-white/5"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
