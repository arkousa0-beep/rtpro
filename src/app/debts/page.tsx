"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, TrendingDown, ShoppingBag, Search, Receipt, FileDown, CheckCircle2, Clock, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/services/exportService";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDebts } from "@/hooks/useDebts";
import { DebtCard } from "@/components/debts/DebtCard";
import { PaymentModal } from "@/components/debts/PaymentModal";
import { TransactionDetailsModal } from "@/components/debts/TransactionDetailsModal";
import { DeferredSaleStatus } from "@/lib/services/debtService";
import { cn } from "@/lib/utils";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DeferredSaleStatus, { label: string; icon: React.ReactNode; className: string }> = {
  paid:    { label: 'مسددة',      icon: <CheckCircle2 className="w-3 h-3" />, className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  partial: { label: 'جزئي',       icon: <Clock className="w-3 h-3" />,        className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  pending: { label: 'معلقة',      icon: <AlertCircle className="w-3 h-3" />,  className: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DebtsPage() {
  const { summary, deferredSales, loading, loadingMore, hasMore, totalCount, refresh, loadMore } = useDebts();
  const [search, setSearch] = useState("");

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean; entityId: string; entityName: string; balance: number;
  }>({ isOpen: false, entityId: '', entityName: '', balance: 0 });

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean; transactionId: string | null;
  }>({ isOpen: false, transactionId: null });

  const filteredDeferred = deferredSales.filter((d) =>
    d.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.id.includes(search)
  );

  return (
    <div className="min-h-screen pb-40 pt-10 px-4 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-l from-white to-white/50">
          المبيعات الآجلة
        </h1>
        <p className="text-white/30 text-base font-medium">إدارة مديونات العملاء والتحصيل</p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-white/30 uppercase tracking-widest">إجمالي المديونات</p>
                <p className="text-3xl font-black text-red-400 tabular-nums">
                  {(summary?.total_customer_debt ?? 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-white/20 font-bold">
                  ج.م · {summary?.customer_debtors_count ?? 0} عميل
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-white/30 uppercase tracking-widest">فواتير آجلة</p>
                <p className="text-3xl font-black text-blue-400 tabular-nums">
                  {(summary?.total_deferred_sales ?? 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-white/20 font-bold">
                  ج.م · {totalCount} فاتورة
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم العميل أو رقم الفاتورة..."
          className="h-14 rounded-[1.5rem] bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 pr-12 focus-visible:ring-primary focus-visible:border-primary/50 text-right"
        />
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {filteredDeferred.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
              <ShoppingBag className="w-8 h-8 text-white/20" />
              <p className="text-white/50 font-bold text-sm">لا توجد مبيعات آجلة</p>
            </div>
          ) : (
            filteredDeferred.map((d, i) => {
              const cfg = STATUS_CONFIG[d.status];
              const remaining = Number(d.total) - Number(d.paid_amount ?? 0);

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <Card className="glass border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all duration-300">
                    <CardContent className="p-5 flex items-center gap-4">
                      {/* Icon — clickable for details */}
                      <button
                        className="w-12 h-12 rounded-[1.2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 hover:bg-blue-500/20 transition-colors"
                        onClick={() => setDetailsModal({ isOpen: true, transactionId: d.id })}
                        title="عرض التفاصيل"
                      >
                        <Receipt className="w-5 h-5 text-blue-400" />
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black truncate">
                          {d.customers?.name ?? "عميل غير محدد"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-white/30 text-[10px]">
                            {new Date(d.created_at).toLocaleDateString("ar-EG")}
                          </p>
                          {/* Status badge */}
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border",
                            cfg.className
                          )}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>
                        {/* Remaining amount (only if partial) */}
                        {d.status === 'partial' && (
                          <p className="text-amber-400/70 text-[10px] font-bold mt-0.5">
                            متبقي: {remaining.toLocaleString()} ج.م
                          </p>
                        )}
                      </div>

                      {/* Amount & Action */}
                      <div className="flex flex-col items-end shrink-0 gap-1.5">
                        <div>
                          <p className="text-xl font-black text-blue-400 tabular-nums">
                            {Number(d.total).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-black text-white/30 text-left">ج.م</p>
                        </div>
                        {d.status !== 'paid' && d.customers && (
                          <Button
                            size="sm"
                            onClick={() => setPaymentModal({
                              isOpen:     true,
                              entityId:   d.customer_id!,
                              entityName: d.customers!.name,
                              balance:    d.customers!.balance,
                            })}
                            className="h-8 px-3 rounded-xl bg-primary text-black font-black text-[10px] hover:scale-105 transition-transform"
                          >
                            تحصيل
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}

          {/* Load More */}
          {hasMore && !search && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-2xl border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 gap-2"
              >
                {loadingMore
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ChevronDown className="w-4 h-4" />}
                تحميل المزيد
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Export & Refresh */}
      <div className="flex justify-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            const columns = ['العميل', 'إجمالي الفاتورة', 'المدفوع', 'المتبقي', 'الحالة', 'التاريخ'];
            const rows = filteredDeferred.map(d => [
              d.customers?.name ?? 'غير محدد',
              Number(d.total).toLocaleString(),
              Number(d.paid_amount ?? 0).toLocaleString(),
              Math.max(0, Number(d.total) - Number(d.paid_amount ?? 0)).toLocaleString(),
              STATUS_CONFIG[d.status].label,
              new Date(d.created_at).toLocaleDateString('ar-EG'),
            ]);
            exportToPDF('تقرير المديونيات الآجلة', columns, rows, {
              summary: [
                { label: 'إجمالي المديونات',  value: `${(summary?.total_customer_debt ?? 0).toLocaleString()} ج.م` },
                { label: 'عدد الفواتير',       value: String(totalCount) },
              ]
            });
          }}
          className="rounded-2xl border-white/10 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 gap-2"
        >
          <FileDown className="w-4 h-4" />
          تقرير PDF
        </Button>
        <Button
          variant="outline"
          onClick={refresh}
          className="rounded-2xl border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
        entityId={paymentModal.entityId}
        entityName={paymentModal.entityName}
        currentBalance={paymentModal.balance}
        onSuccess={refresh}
      />

      <TransactionDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal(prev => ({ ...prev, isOpen: false }))}
        transactionId={detailsModal.transactionId}
      />
    </div>
  );
}
