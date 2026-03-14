"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Wallet
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
      let revenue = 0;
      let profit = 0;
      let inventoryValue = 0;
      let customerDebt = 0;
      let supplierDebt = 0;

      // Try fetching from RPC for efficiency
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_finance_stats');
      
      if (!rpcError && rpcData) {
        revenue = rpcData.revenue || 0;
        profit = rpcData.profit || 0;
        inventoryValue = rpcData.inventoryValue || 0;
        customerDebt = rpcData.customerDebt || 0;
        supplierDebt = rpcData.supplierDebt || 0;
      } else {
        console.error("RPC failed, please run docs/database_updates.sql", rpcError);
      }

      // Fetch only recent sales for the chart (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'Sale')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      // Group sales by day for the chart
      const salesByDay = (recentTransactions || []).reduce((acc: Record<string, number>, t: Transaction) => {
        const date = new Date(t.created_at).toLocaleDateString('ar-EG', { weekday: 'short' });
        acc[date] = (acc[date] || 0) + Number(t.total);
        return acc;
      }, {});

      const dailyData = Object.keys(salesByDay).map(date => ({
        name: date,
        value: salesByDay[date]
      })).reverse();

      setStats({
        revenue,
        profit,
        inventoryValue,
        customerDebt,
        supplierDebt,
        recentSales: recentTransactions?.slice(0, 5) || [],
        dailyData: dailyData.length > 0 ? dailyData : [{ name: 'N/A', value: 0 }]
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

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
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4 px-4">
        {/* Revenue Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 bento p-6 rounded-[2.5rem] space-y-4 relative overflow-hidden group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary glass border border-primary/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" />
              12%
            </div>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-white/40 text-sm font-bold">إجمالي المبيعات</p>
            <h3 className="text-4xl font-black text-white tabular-nums">
              {stats?.revenue?.toLocaleString()} 
              <span className="text-sm font-normal text-white/30 mr-2">ج.م</span>
            </h3>
          </div>
        </motion.div>

        {/* Profit Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bento p-5 rounded-[2rem] space-y-3"
        >
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-500 glass border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">صافي الربح</p>
            <h4 className="text-xl font-black text-white">
              {stats?.profit?.toLocaleString()}
            </h4>
          </div>
        </motion.div>

        {/* Inventory Value */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bento p-5 rounded-[2rem] space-y-3"
        >
          <div className="p-2.5 w-fit rounded-xl bg-orange-500/10 text-orange-500 glass border border-orange-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">قيمة المخزون</p>
            <h4 className="text-xl font-black text-white">
              {stats?.inventoryValue?.toLocaleString()}
            </h4>
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4"
      >
        <Card className="bento border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                حركة المبيعات
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyData || []}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffaa00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ffaa00" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Debt Summary */}
      <div className="grid grid-cols-1 gap-4 px-4">
        <h3 className="text-xl font-black text-white px-2 mt-4">إدارة الديون</h3>
        <Card className="bento border-none rounded-[2.5rem] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 glass border border-red-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-white">ديون العملاء</h4>
                <p className="text-white/30 text-xs">إجمالي المبالغ المطلوبة من العملاء</p>
              </div>
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-red-500">{stats?.customerDebt?.toLocaleString()}</span>
              <span className="text-xs text-white/20 mr-1">ج.م</span>
            </div>
          </div>

          <div className="h-[1px] bg-white/5 w-full" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 glass border border-orange-500/20">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-white">ديون الموردين</h4>
                <p className="text-white/30 text-xs">إجمالي المبالغ المستحقة للموردين</p>
              </div>
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-white">{stats?.supplierDebt?.toLocaleString()}</span>
              <span className="text-xs text-white/20 mr-1">ج.م</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
