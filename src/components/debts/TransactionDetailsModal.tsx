"use client";

import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Loader2, Calendar, User, Tag, Hash } from 'lucide-react';
import { debtService } from '@/lib/services/debtService';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

export const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transactionId
}: TransactionDetailsModalProps) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchDetails();
    }
  }, [isOpen, transactionId]);

  const fetchDetails = async () => {
    if (!transactionId) return;
    setLoading(true);
    try {
      const data = await debtService.getTransactionDetails(transactionId);
      setDetails(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 bg-black/90 backdrop-blur-2xl text-white rounded-[2rem] sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right flex items-center justify-end gap-2">
            تفاصيل العملية
            <Hash className="w-5 h-5 text-primary" />
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-white/40 font-bold">جاري تحميل البيانات...</span>
          </div>
        ) : details ? (
          <div className="space-y-6 pt-4 text-right">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-1">
                <span className="text-white/40 text-xs font-bold block">التاريخ</span>
                <div className="flex items-center justify-end gap-2 font-black">
                  {format(new Date(details.created_at), 'PPP', { locale: ar })}
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-1">
                <span className="text-white/40 text-xs font-bold block">العميل</span>
                <div className="flex items-center justify-end gap-2 font-black">
                  {details.customers?.name || 'Walk-in'}
                  <User className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="font-black text-lg flex items-center justify-end gap-2">
                الأصناف
                <Tag className="w-4 h-4 text-primary" />
              </h3>
              <div className="space-y-2">
                {details.transaction_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-primary font-black">{item.price} ج.م</div>
                    <div className="text-right">
                      <div className="font-black">{item.products?.name}</div>
                      <div className="text-xs text-white/40 font-bold">{item.barcode}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Footer */}
            <div className="p-6 bg-primary rounded-[2rem] flex items-center justify-between shadow-xl shadow-primary/20 mt-4">
              <div className="text-3xl font-black text-black">{details.total} <small className="text-sm">ج.م</small></div>
              <div className="text-black/60 font-black text-lg">الإجمالي النهائي</div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-white/20 font-bold">
            لا توجد تفاصيل لهذه العملية
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
