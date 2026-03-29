"use client";

import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Loader2, Calendar, User, Tag, Hash, Wallet } from 'lucide-react';
import { ResponsiveDialog } from '@/components/ui/ResponsiveDialog';
import { debtService } from '@/lib/services/debtService';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TransactionItem {
  id: string;
  barcode: string | null;
  price: number;
  products: { name: string; image_url: string | null } | null;
}

interface TransactionDetails {
  id: string;
  type: string;
  total: number;
  paid_amount: number;
  method: string | null;
  created_at: string;
  customers: { name: string; phone: string | null } | null;
  transaction_items: TransactionItem[];
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transactionId
}: TransactionDetailsModalProps) => {
  const [details, setDetails] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchDetails(transactionId);
    }
    if (!isOpen) setDetails(null);
  }, [isOpen, transactionId]);

  const fetchDetails = async (id: string) => {
    setLoading(true);
    try {
      const data = await debtService.getTransactionDetails(id);
      setDetails(data as unknown as TransactionDetails);
    } catch (error) {
      console.error('Failed to load transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const remaining = details ? Number(details.total) - Number(details.paid_amount ?? 0) : 0;
  const status = details
    ? remaining <= 0 ? 'paid' : Number(details.paid_amount ?? 0) > 0 ? 'partial' : 'pending'
    : null;

  const statusConfig = {
    paid:    { label: 'مسددة بالكامل',   className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    partial: { label: 'مسددة جزئياً',    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    pending: { label: 'غير مسددة',        className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onClose}
      title="تفاصيل الفاتورة"
      description={`Transaction #${transactionId?.slice(0, 8)}`}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-white/40 font-bold">جاري تحميل البيانات...</span>
        </div>
      ) : details ? (
        <div className="space-y-5 pt-4 text-right">
          {/* Status Badge */}
          {status && (
            <div className="flex justify-end">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-xs font-black border",
                statusConfig[status].className
              )}>
                {statusConfig[status].label}
              </span>
            </div>
          )}

          {/* Header Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest block">التاريخ</span>
              <div className="flex items-center justify-end gap-2 font-black text-sm">
                {format(new Date(details.created_at), 'PPP', { locale: ar })}
                <Calendar className="w-4 h-4 text-primary shrink-0" />
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest block">العميل</span>
              <div className="flex items-center justify-end gap-2 font-black text-sm">
                {details.customers?.name || 'زبون عابر'}
                <User className="w-4 h-4 text-primary shrink-0" />
              </div>
            </div>
          </div>

          {/* Financial summary */}
          <div className="bg-white/5 rounded-2xl border border-white/5 p-4 space-y-3">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center justify-end gap-2">
              ملخص مالي
              <Wallet className="w-3.5 h-3.5" />
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-black text-white">{Number(details.total).toLocaleString()} ج.م</span>
                <span className="text-white/40 font-bold">الإجمالي</span>
              </div>
              <div className="flex justify-between">
                <span className="font-black text-emerald-400">{Number(details.paid_amount ?? 0).toLocaleString()} ج.م</span>
                <span className="text-white/40 font-bold">المدفوع</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="font-black text-red-400 text-base">{remaining.toLocaleString()} ج.م</span>
                  <span className="text-white/40 font-bold">المتبقي</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <h3 className="font-black text-base flex items-center justify-end gap-2">
              الأصناف ({details.transaction_items?.length ?? 0})
              <Tag className="w-4 h-4 text-primary" />
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {details.transaction_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 transition-all hover:bg-white/10"
                >
                  <div className="text-primary font-black tabular-nums">{Number(item.price).toLocaleString()} ج.م</div>
                  <div className="text-right">
                    <div className="font-black text-sm">{item.products?.name ?? '—'}</div>
                    <div className="text-[10px] text-white/30 font-bold font-mono">{item.barcode}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-white/20 font-bold">
          لا توجد تفاصيل لهذه العملية
        </div>
      )}
    </ResponsiveDialog>
  );
};
