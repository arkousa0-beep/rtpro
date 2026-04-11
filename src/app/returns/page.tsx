"use client";

import { useState } from "react";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw,
  Calendar,
  RefreshCcw,
  Loader2,
  ChevronRight,
  ChevronLeft,
  FileDown,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Package,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReturns } from "@/hooks/useReturns";
import { ReturnDetailsDrawer } from "@/components/management/ReturnDetailsDrawer";
import { ReturnDialog } from "@/components/ReturnDialog";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { exportToPDF, exportToExcel } from "@/lib/services/exportService";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useUIStore } from "@/lib/store/uiStore";
import { toast } from "sonner";

export default function ReturnsPage() {
  const { isAuthorized, isLoading: isAuthLoading } = useRouteGuard('transactions');
  
  const { pageStates, setPageState } = useUIStore();
  const returnsState = pageStates['returns'] || { search: '', page: 1 };
  
  const search = returnsState.search;
  const page = returnsState.page || 1;
  const setSearch = (val: string) => setPageState('returns', { ...returnsState, search: val });
  const setPage = (val: number | ((p: number) => number)) => {
    const next = typeof val === 'function' ? val(page) : val;
    setPageState('returns', { ...returnsState, page: next });
  };

  const { returns, loading, totalPages, refresh } = useReturns(page);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Realtime: auto-refresh on new returns
  useRealtimeSubscription({
    table: 'returns',
    event: '*',
    onData: () => refresh(),
  });

  const filtered = returns.filter(r => 
    r.id.includes(search) || 
    r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.reason?.toLowerCase().includes(search.toLowerCase()) ||
    r.status?.toLowerCase().includes(search.toLowerCase())
  );

  const handleReturnClick = (id: string) => {
    setSelectedReturnId(id);
    setDrawerOpen(true);
  };

  const handleExportPDF = () => {
    const columns = ['العميل', 'المبلغ', 'طريقة الاسترجاع', 'عدد القطع', 'السبب', 'التاريخ'];
    const rows = filtered.map(r => [
      r.customer_name || 'عميل عام',
      Number(r.total_amount || 0).toLocaleString(),
      r.refund_method === 'Cash' ? 'كاش' : 'رصيد',
      String(r.items_count || r.items?.length || 0),
      r.reason || '-',
      new Date(r.created_at).toLocaleDateString('ar-EG'),
    ]);
    exportToPDF('تقرير المرتجعات', columns, rows);
  };

  const handleExportExcel = () => {
    const columns = ['رقم المرتجع', 'العميل', 'المبلغ', 'طريقة الاسترجاع', 'عدد القطع', 'السبب', 'التاريخ'];
    const rows = filtered.map(r => [
      r.id.split('-')[0],
      r.customer_name || 'عميل عام',
      Number(r.total_amount || 0),
      r.refund_method === 'Cash' ? 'كاش' : 'رصيد',
      r.items_count || r.items?.length || 0,
      r.reason || '-',
      new Date(r.created_at).toLocaleDateString('ar-EG'),
    ]);
    exportToExcel('تقرير المرتجعات', columns, rows);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      case 'pending': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      case 'cancelled': return 'bg-red-500/10 border-red-500/20 text-red-500';
      default: return 'bg-white/5 border-white/10 text-white/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'قيد الانتظار';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <ManagePageLayout
      title="سجل المرتجعات"
      subtitle="جميع عمليات الإرجاع والاسترجاع"
      backHref="/manage"
      searchPlaceholder="ابحث برقم المرتجع أو اسم العميل..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="تحميل تقرير"
      addDialogTitle="تقارير"
      addDialogIcon={RotateCcw}
      isDialogOpen={false}
      onDialogOpenChange={() => {}}
      isLoading={loading}
      onRefresh={refresh}
      iconColor="text-amber-500"
      buttonColor="bg-amber-600"
      extraContent={
        <div className="flex justify-end pt-4">
          <ReturnDialog
            customTrigger={
              <Button 
                variant="outline" 
                className="h-14 px-8 rounded-[1.5rem] bg-amber-500 hover:bg-amber-400 text-black font-black text-lg border-none shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all gap-3 overflow-hidden group relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <RotateCcw className="w-5 h-5 relative z-10 group-hover:-rotate-45 transition-transform duration-300" />
                <span className="relative z-10">إرجاع بضاعة جديد</span>
              </Button>
            }
          />
        </div>
      }
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
              لا توجد مرتجعات مطابقة
            </motion.div>
          ) : (
            filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className="glass border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] transition-all cursor-pointer group active:scale-[0.98]"
                  onClick={() => handleReturnClick(r.id)}
                >
                  <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-white text-lg">مرتجع مبيعات</h4>
                          <Badge variant="outline" className="bg-white/5 border-none text-white/40 text-[10px] font-mono">
                            #{r.id.split('-')[0]}
                          </Badge>
                        </div>
                        <div className="flex flex-col text-sm text-white/40 gap-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(r.created_at).toLocaleString('ar-EG')}</span>
                          {r.customer_name && (
                            <span className="flex items-center gap-1 font-bold text-white/60"><User className="w-3 h-3" /> {r.customer_name}</span>
                          )}
                          {r.reason && (
                            <span className="text-xs text-white/30 truncate max-w-[200px]">السبب: {r.reason}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-amber-500">
                          -{Number(r.total_amount || 0).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-white/40">ج.م</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`font-bold border ${getStatusColor(r.status || '')}`}>
                          {getStatusLabel(r.status || '')}
                        </Badge>
                        <Badge className="bg-white/5 text-white/60 hover:bg-white/10 font-bold border-none">
                          {r.items_count || r.items?.length || 0} قطع
                        </Badge>
                      </div>

                      <Badge className="bg-white/5 text-white/60 hover:bg-white/10 font-bold border-none mt-1">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {r.refund_method === 'Cash' ? 'كاش' : 'رصيد الحساب'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <ReturnDetailsDrawer 
        returnId={selectedReturnId}
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
