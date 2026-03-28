"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { exportToPDF } from "@/lib/services/exportService";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ArrowDownRight,
  Loader2,
  Calendar,
  Wallet,
  Clock,
  Store,
  ArrowUpRight,
  FileDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Transaction } from "@/lib/database.types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Stats {
  revenue: number;
  profit: number;
  inventoryValue: number;
  customerDebt: number;
  supplierDebt: number;
  recentSales: Transaction[];
  dailyData: { name: string; value: number }[];
}

export default function FinancePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("today");

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  async function fetchStats() {
    setLoading(true);
    try {
      // ─── Time range window ───────────────────────────────────────────
      const now = new Date();
      let since: Date | null = null;
      if (timeRange === 'today') {
        since = new Date(now); since.setHours(0, 0, 0, 0);
      } else if (timeRange === 'week') {
        since = new Date(now); since.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        since = new Date(now); since.setMonth(now.getMonth() - 1);
      } else {
        since = null;
      }

      // ─── Finance stats from RPC ───────────────────────────────────────
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_finance_stats', since ? { p_since: since.toISOString() } : {});

      let revenue = 0, profit = 0, inventoryValue = 0, customerDebt = 0, supplierDebt = 0;

      if (rpcError) {
        // RPC might not exist yet — silently fall back to fetching transactions directly
        console.warn('get_finance_stats RPC not available, falling back.', rpcError.message);
      } else if (rpcData) {
        revenue       = rpcData.revenue       || 0;
        profit        = rpcData.profit        || 0;
        inventoryValue = rpcData.inventoryValue || 0;
        customerDebt  = rpcData.customerDebt  || 0;
        supplierDebt  = rpcData.supplierDebt  || 0;
      }

      // ─── Recent sales for chart (within selected range) ──────────────
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('type', 'Sale')
        .order('created_at', { ascending: false });
        
      if (since) {
        query = query.gte('created_at', since.toISOString());
      }
      
      const { data: recentTransactions } = await query;

      // Group sales by day
      const salesByDay = (recentTransactions || []).reduce(
        (acc: Record<string, number>, t) => {
          const date = new Date(t.created_at).toLocaleDateString('ar-EG', { weekday: 'short' });
          acc[date] = (acc[date] || 0) + Number(t.total);
          return acc;
        },
        {}
      );

      const dailyData = Object.entries(salesByDay)
        .map(([name, value]) => ({ name, value }))
        .reverse();

      // If RPC wasn't available, use transactions to compute revenue
      if (rpcError) {
        revenue = (recentTransactions || []).reduce((s, t) => s + Number(t.total), 0);
      }

      setStats({
        revenue,
        profit,
        inventoryValue,
        customerDebt,
        supplierDebt,
        recentSales: recentTransactions?.slice(0, 5) || [],
        dailyData: dailyData.length > 0 ? dailyData : [{ name: 'N/A', value: 0 }],
      });
    } catch (err) {
      console.error('Error loading finance stats:', err);
    }
    setLoading(false);
  }

  // Realtime: auto-refresh when transactions change
  useRealtimeSubscription({
    table: 'transactions',
    event: '*',
    onData: () => fetchStats(),
  });

  const handleExportPDF = () => {
    if (!stats) return;
    const columns = ['البيان', 'القيمة'];
    const rows = [
      ['إجمالي الإيرادات', `${stats.revenue.toLocaleString()} ج.م`],
      ['صافي الأرباح', `${stats.profit.toLocaleString()} ج.م`],
      ['قيمة المخزون', `${stats.inventoryValue.toLocaleString()} ج.م`],
      ['مديونيات العملاء', `${stats.customerDebt.toLocaleString()} ج.م`],
      ['مديونيات الموردين', `${stats.supplierDebt.toLocaleString()} ج.م`],
    ];
    const period = timeRange === 'today' ? 'اليوم' : timeRange === 'week' ? 'آخر 7 أيام' : timeRange === 'month' ? 'آخر 30 يوم' : 'كل الأوقات';
    exportToPDF('التقرير المالي', columns, rows, { subtitle: `الفترة: ${period}` });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-4 px-1 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary glass border border-primary/20">
              <TrendingUp className="w-7 h-7" />
            </div>
            التقارير المالية
          </h2>
          <p className="text-white/40 text-sm font-medium">متابعة الأداء المالي والأرباح</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="h-12 px-4 rounded-2xl border-white/10 bg-red-500/10 text-red-400 hover:bg-red-500/20 gap-2 font-black"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </Button>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px] h-12 bg-white/5 border-white/10 text-white rounded-2xl glass font-bold">
            <Clock className="w-4 h-4 ml-2 text-primary" />
            <SelectValue placeholder="الفترة" />
          </SelectTrigger>
          <SelectContent className="glass border-white/10 rounded-2xl text-right" dir="rtl">
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">آخر 7 أيام</SelectItem>
            <SelectItem value="month">آخر 30 يوم</SelectItem>
            <SelectItem value="all">كل الأوقات</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6 px-6">
        {/* Revenue Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 bento p-8 rounded-[3rem] space-y-6 relative overflow-hidden group shadow-2xl border border-white/5"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700" />
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px]" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 glass border border-indigo-500/20 shadow-xl">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-400/20 backdrop-blur-md">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>مباشر</span>
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <p className="text-white/30 text-sm font-black uppercase tracking-[0.2em]">إجمالي المبيعات (نظري)</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                {stats?.revenue?.toLocaleString()}
              </h3>
              <span className="text-xl font-bold text-white/20">ج.م</span>
            </div>
          </div>
        </motion.div>


        {/* Profit Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="group bento p-7 rounded-[2.5rem] space-y-4 relative overflow-hidden border border-white/5 shadow-xl hover:bg-white/[0.04] transition-all"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="p-3.5 w-fit rounded-2xl bg-emerald-500/10 text-emerald-400 glass border border-emerald-500/20 shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">صافي الربح</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-white tabular-nums tracking-tight">
                {stats?.profit?.toLocaleString()}
              </h4>
              <span className="text-[10px] font-bold text-white/20">ج.م</span>
            </div>
          </div>
        </motion.div>

        {/* Inventory Value */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="group bento p-7 rounded-[2.5rem] space-y-4 relative overflow-hidden border border-white/5 shadow-xl hover:bg-white/[0.04] transition-all"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="p-3.5 w-fit rounded-2xl bg-amber-500/10 text-amber-400 glass border border-amber-500/20 shadow-lg">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">قيمة المخزون</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-white tabular-nums tracking-tight">
                {stats?.inventoryValue?.toLocaleString()}
              </h4>
              <span className="text-[10px] font-bold text-white/20">ج.م</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6"
      >
        <Card className="bento border-white/5 rounded-[3rem] overflow-hidden shadow-2xl p-8">
          <CardHeader className="p-0 pb-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Calendar className="w-5 h-5" />
                  </div>
                  تحليل المبيعات الأسبوعي
                </CardTitle>
                <p className="text-white/20 text-xs font-bold mr-11">نمو المبيعات خلال الـ 7 أيام الماضية</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[250px] w-full p-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyData || []}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15,15,20,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '1.5rem',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 900 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px', fontWeight: 900 }}
                  formatter={(value) => [`${Number(value).toLocaleString()} ج.م`, 'المبيعات']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={4}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Debt Summary */}
      <div className="grid grid-cols-1 gap-6 px-6">
        <h3 className="text-xl font-black text-white px-2 mt-4 flex items-center gap-3">
          <Wallet className="w-6 h-6 text-indigo-500" />
          إدارة الديون الجارية
        </h3>
        <Card className="bento border-white/5 rounded-[3rem] p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center text-red-400 glass border border-red-500/20 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-xl text-white mb-1">ديون العملاء</h4>
                <p className="text-white/20 text-xs font-bold uppercase tracking-wider">مستحقات خارجية</p>
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-red-500 tabular-nums">
                  {stats?.customerDebt?.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-white/10 uppercase italic">ج.م</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent w-full" />

          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 glass border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-xl text-white mb-1">ديون الموردين</h4>
                <p className="text-white/20 text-xs font-bold uppercase tracking-wider">التزامات للمخزن</p>
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums">
                  {stats?.supplierDebt?.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-white/10 uppercase italic">ج.م</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
