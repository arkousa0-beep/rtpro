"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/lib/database.types";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Receipt, RefreshCcw, Loader2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*, customers(name)')
      .order('created_at', { ascending: false });
      
    if (data) setTransactions(data as any[]);
    setLoading(false);
  }

  const filtered = transactions.filter(t => 
    t.id.includes(search) || 
    (t as any).customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'Sale': return <ArrowUpRight className="w-5 h-5 text-emerald-500" />;
      case 'Return': return <RefreshCcw className="w-5 h-5 text-amber-500" />;
      case 'Expense': return <ArrowDownRight className="w-5 h-5 text-red-500" />;
      case 'Income': return <ArrowUpRight className="w-5 h-5 text-blue-500" />;
      default: return <Receipt className="w-5 h-5 text-white/50" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch(type) {
      case 'Sale': return 'عملية بيع';
      case 'Return': return 'مرتجع';
      case 'Expense': return 'مصروفات / سداد مورد';
      case 'Income': return 'إيراد / تحصيل عميل';
      default: return type;
    }
  };

  const getTransactionColor = (type: string) => {
    switch(type) {
      case 'Sale': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      case 'Return': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      case 'Expense': return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'Income': return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
      default: return 'bg-white/5 border-white/10 text-white/50';
    }
  };

  return (
    <ManagePageLayout
      title="سجل المعاملات"
      subtitle="جميع الحركات المالية في النظام"
      searchPlaceholder="ابحث برقم المعاملة أو اسم العميل..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="تحميل تقرير"
      addDialogTitle="تقارير"
      addDialogIcon={Receipt}
      isDialogOpen={false}
      onDialogOpenChange={() => {}}
      isLoading={loading}
      iconColor="text-indigo-500"
      buttonColor="bg-indigo-600"
      addDialogContent={<div className="text-center p-8 text-white/50">سيتم توفير ميزة طباعة التقارير قريباً</div>}
    >
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="wait">
          {filtered.length === 0 && !loading ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-20 text-white/30"
            >
              لا توجد معاملات مطابقة
            </motion.div>
          ) : (
            filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.02] transition-colors">
                  <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTransactionColor(t.type)}`}>
                        {getTransactionIcon(t.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-white text-lg">{getTransactionLabel(t.type)}</h4>
                          <Badge variant="outline" className="bg-white/5 border-none text-white/40 text-[10px] font-mono">
                            {t.id.split('-')[0]}
                          </Badge>
                        </div>
                        <div className="flex flex-col text-sm text-white/40 gap-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(t.created_at).toLocaleString('ar-EG')}</span>
                          {(t as any).customers?.name && (
                            <span className="font-bold text-white/60">العميل: {(t as any).customers?.name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${t.type === 'Expense' || t.type === 'Return' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {t.type === 'Expense' || t.type === 'Return' ? '-' : '+'}{Number(t.total).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-white/40">ج.م</span>
                      </div>
                      <Badge className="bg-white/5 text-white/60 hover:bg-white/10 font-bold border-none">
                        {t.payment_method === 'Cash' ? 'كاش' : t.payment_method === 'Card' ? 'فيزا' : 'آجل'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </ManagePageLayout>
  );
}