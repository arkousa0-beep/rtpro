"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, TrendingDown, TrendingUp, Minus, ShoppingBag, Search, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDebts } from "@/hooks/useDebts";
import { DebtCard } from "@/components/debts/DebtCard";
import { PaymentModal } from "@/components/debts/PaymentModal";
import { TransactionDetailsModal } from "@/components/debts/TransactionDetailsModal";

type Tab = "customers" | "deferred";

const TABS = [
  { id: "customers" as Tab, label: "مديونات العملاء" },
  { id: "deferred" as Tab, label: "فواتير الآجل" },
];

export default function DebtsPage() {
  const { summary, deferredSales, loading, refresh } = useDebts();
  const [search, setSearch] = useState("");
  
  // Modal States
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; entityId: string; entityName: string; balance: number }>({
    isOpen: false,
    entityId: '',
    entityName: '',
    balance: 0
  });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; transactionId: string | null }>({
    isOpen: false,
    transactionId: null
  });

  const filteredDeferred = deferredSales.filter((d) =>
    d.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.id.includes(search)
  );

  return (
    <div className="min-h-screen pb-40 pt-10 px-4 max-w-2xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-3 text-center">
        <h1 className="text-5xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-l from-white to-white/50">
          المبيعات الآجلة
        </h1>
        <p className="text-white/30 text-lg font-medium">إدارة مديونات العملاء والتحصيل</p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Debt */}
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
                <p className="text-[10px] text-white/20 font-bold">ج.م · {summary?.customer_debtors_count ?? 0} عميل</p>
              </div>
            </CardContent>
          </Card>

          {/* Deferred Sales Amount */}
          <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-white/30 uppercase tracking-widest">فواتير لم تسدد</p>
                <p className="text-3xl font-black text-blue-400 tabular-nums">
                  {(summary?.total_deferred_sales ?? 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-white/20 font-bold">ج.م · {deferredSales.length} فاتورة</p>
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

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeferred.length === 0 ? (
            <EmptyState icon={<ShoppingBag className="w-8 h-8 text-white/20" />} text="لا توجد مبيعات آجلة" />
          ) : (
            filteredDeferred.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="glass border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all duration-300">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-[1.2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 cursor-pointer hover:bg-blue-500/20 transition-colors"
                      onClick={() => setDetailsModal({ isOpen: true, transactionId: d.id })}
                    >
                      <Receipt className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black truncate">
                        {d.customers?.name ?? "عميل غير محدد"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <p className="text-white/40 text-[10px]">
                          {new Date(d.created_at).toLocaleString("ar-EG")}
                        </p>
                        {d.customers?.balance && d.customers.balance > 0 && (
                          <span className="text-[10px] font-bold text-red-400/60 leading-none">
                            رصيد: {d.customers.balance.toLocaleString()} ج.م
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <div className="text-left shrink-0">
                        <p className="text-xl font-black text-blue-400 tabular-nums">
                          {Number(d.total).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-black text-white/30">ج.م</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (d.customers) {
                            setPaymentModal({
                              isOpen: true,
                              entityId: d.customer_id!,
                              entityName: d.customers.name,
                              balance: d.customers.balance
                            });
                          }
                        }}
                        className="h-8 px-4 rounded-xl bg-primary text-black font-black text-[10px] hover:scale-105 transition-transform"
                      >
                        تحصيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

       {/* Refresh Button */}
      <div className="flex justify-center pt-4 pb-10">
        <Button
          variant="outline"
          onClick={refresh}
          className="rounded-2xl border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </Button>
      </div>

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

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
      {icon}
      <p className="text-white/50 font-bold text-sm">{text}</p>
    </div>
  );
}
