"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Transaction } from "@/lib/database.types";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownRight, ArrowUpRight, Receipt, RefreshCcw, Loader2, Calendar, ChevronRight, ChevronLeft, FileDown, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TransactionDetailsDrawer } from "@/components/management/TransactionDetailsDrawer";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { exportToPDF, exportToExcel } from "@/lib/services/exportService";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  async function fetchTransactions() {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from('transactions')
      .select('*, customers(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (data) setTransactions(data as any[]);
    if (count !== null) setTotalPages(Math.ceil(count / pageSize) || 1);
    setLoading(false);
  }

  // Realtime: auto-refresh on new transactions
  useRealtimeSubscription({
    table: 'transactions',
    event: '*',
    onData: () => fetchTransactions(),
  });

  const handleExportPDF = () => {
    const columns = ['النوع', 'العميل', 'المبلغ', 'طريقة الدفع', 'التاريخ'];
    const rows = filtered.map(t => {
      const type = t.type as string;
      return [
        type === 'Sale' ? 'بيع' : type === 'Return' ? 'مرتجع' : type === 'Expense' ? 'مصروفات' : 'إيراد',
        (t as any).customers?.name || '-',
        Number(t.total).toLocaleString(),
        t.method === 'Cash' ? 'كاش' : t.method === 'Card' ? 'فيزا' : t.method === 'Debt' ? 'آجل' : t.method,
        new Date(t.created_at).toLocaleDateString('ar-EG'),
      ];
    });
    exportToPDF('تقرير المعاملات', columns, rows);
  };

  const handleExportExcel = () => {
    const columns = ['النوع', 'العميل', 'المبلغ', 'طريقة الدفع', 'التاريخ', 'رقم المعاملة'];
    const rows = filtered.map(t => {
      const type = t.type as string;
      return [
        type === 'Sale' ? 'بيع' : type === 'Return' ? 'مرتجع' : type === 'Expense' ? 'مصروفات' : 'إيراد',
        (t as any).customers?.name || '-',
        Number(t.total),
        t.method === 'Cash' ? 'كاش' : t.method === 'Card' ? 'فيزا' : t.method === 'Debt' ? 'آجل' : t.method,
        new Date(t.created_at).toLocaleDateString('ar-EG'),
        t.id,
      ];
    });
    exportToExcel('تقرير المعاملات', columns, rows);
  };

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

  const handleTransactionClick = (id: string) => {
    setSelectedTransactionId(id);
    setDrawerOpen(true);
  };

  return (
    <ManagePageLayout
      title="سجل المعاملات"
      subtitle="جميع الحركات المالية في النظام"
      backHref="/manage"
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
      addDialogContent={
        <div className="flex flex-col gap-4 p-6">
          <Button onClick={handleExportPDF} className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg gap-3">
            <FileDown className="w-6 h-6" />
            تحميل تقرير PDF
          </Button>
          <Button onClick={handleExportExcel} className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg gap-3">
            <FileSpreadsheet className="w-6 h-6" />
            تحميل تقرير Excel
          </Button>
        </div>
      }
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
                <Card 
                  className="glass border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] transition-all cursor-pointer group active:scale-[0.98]"
                  onClick={() => handleTransactionClick(t.id)}
                >
                  <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTransactionColor(t.type)} group-hover:scale-110 transition-transform`}>
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

                    <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${(t as any).type === 'Return' || (t as any).type === 'Expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {(t as any).type === 'Return' || (t as any).type === 'Expense' ? '-' : '+'}{Number(t.total).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-white/40">ج.م</span>
                      </div>
                      
                      {t.type === 'Sale' && t.method === 'Debt' && t.paid_amount > 0 && (
                        <div className="text-[10px] font-bold text-emerald-500/60 flex items-center gap-1">
                          <span>تم دفع:</span>
                          <span>{Number(t.paid_amount).toLocaleString()} ج.م</span>
                        </div>
                      )}

                      <Badge className="bg-white/5 text-white/60 hover:bg-white/10 font-bold border-none mt-1">
                        {t.method === 'Cash' ? 'كاش' : t.method === 'Card' ? 'فيزا' : t.method === 'Debt' ? 'آجل' : t.method === 'Transfer' ? 'تحويل' : t.method}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <TransactionDetailsDrawer 
        transactionId={selectedTransactionId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pb-8">
          <Button 
            variant="outline" 
            className="glass border-white/5 bg-white/5 hover:bg-white/10 text-white"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <span className="text-white/50 text-sm font-bold">
            صفحة {page} من {totalPages}
          </span>
          <Button 
            variant="outline" 
            className="glass border-white/5 bg-white/5 hover:bg-white/10 text-white"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      )}
    </ManagePageLayout>
  );
}
