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
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { debtService } from '@/lib/services/debtService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityName: string;
  currentBalance: number;
  onSuccess: () => void;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  entityId,
  entityName,
  currentBalance,
  onSuccess
}: PaymentModalProps) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (numAmount > currentBalance) {
      toast.error('المبلغ المدخل أكبر من الرصيد المتبقي');
      // We still allow it if they really want to? Usually no.
      return;
    }

    setLoading(true);
    try {
      await debtService.processPayment(entityId, numAmount);
      toast.success('تمت العملية بنجاح');
      onSuccess();
      onClose();
      setAmount('');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء المعالجة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 bg-black/90 backdrop-blur-2xl text-white rounded-[2rem] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right">
            تحصيل مديونية
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2 text-right">
            <Label className="text-white/40 font-bold">الاسم</Label>
            <div className="text-xl font-black">{entityName}</div>
          </div>

          <div className="space-y-2 text-right">
            <Label className="text-white/40 font-bold">الرصيد الحالي</Label>
            <div className="text-xl font-black text-primary">{currentBalance} ج.م</div>
          </div>

          <div className="space-y-2 text-right">
            <Label htmlFor="amount" className="text-white/40 font-bold">المبلغ المدفوع</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-14 text-center text-2xl font-black bg-white/5 border-white/10 rounded-2xl focus:border-primary transition-all"
              autoFocus
            />
          </div>

          <DialogFooter className="sm:justify-start gap-2">
            <Button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 h-14 rounded-2xl bg-primary text-black font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تأكيد العملية'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
