"use client";

import { motion } from "framer-motion";
import { Wallet, ScrollText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Supplier } from "@/lib/services/supplierService";

interface SupplierFinanceTabProps {
  supplier: Supplier;
  transactions: any[];
  onAddPayment: () => void;
}

export function SupplierFinanceTab({ 
  supplier, 
  transactions, 
  onAddPayment 
}: SupplierFinanceTabProps) {
  return (
    <motion.div
      key="finance"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className={cn(
        "p-8 rounded-[2.5rem] border flex flex-col items-center justify-center text-center shadow-2xl relative group overflow-hidden",
        Number(supplier.balance || 0) > 0 
        ? "bg-red-500/10 border-red-500/20 shadow-red-500/5" 
        : "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5"
      )}>
        <span className={cn(
          "text-xs font-black uppercase tracking-[0.3em] mb-2 leading-none",
          Number(supplier.balance || 0) > 0 ? "text-red-400" : "text-emerald-400"
        )}>
          {Number(supplier.balance || 0) > 0 ? "إجمالي المديونية" : "الرصيد الحالي"}
        </span>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-5xl font-black tracking-tighter",
            Number(supplier.balance || 0) > 0 ? "text-red-500" : "text-emerald-500"
          )}>
            {Math.abs(Number(supplier.balance || 0)).toLocaleString()}
          </span>
          <span className="text-white/40 font-bold text-sm">ج.م</span>
        </div>

        {Number(supplier.balance || 0) > 0 && (
          <Button
            onClick={onAddPayment}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white border-white/10 rounded-2xl h-12 px-8 font-black text-xs gap-2 shadow-xl shadow-red-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            تسجيل سداد دفعة
          </Button>
        )}
      </div>

      <div className="glass p-6 rounded-[2.5rem] border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ScrollText className="w-5 h-5" />
            </div>
            <h5 className="font-black text-white text-sm">سجل المدفوعات</h5>
          </div>
          <Button variant="ghost" size="sm" className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 rounded-xl border border-amber-500/10 h-8">تصدير كشف</Button>
        </div>

        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">دفعة نقدية</p>
                    <p className="text-white/30 text-[10px] font-bold">{format(new Date(t.created_at), "dd/MM/yyyy")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-500 font-black tracking-tight">{Number(t.total).toLocaleString()} ج.م</p>
                  <p className="text-white/20 text-[10px] font-bold uppercase">{t.method}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 space-y-2 opacity-20">
              <ScrollText className="w-12 h-12 mx-auto" />
              <p className="text-xs font-bold">لا يوجد تعاملات مالية مسجلة</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
