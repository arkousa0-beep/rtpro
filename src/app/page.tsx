"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  Scan, 
  PlusCircle, 
  History,
  ArrowUpRight,
  ShoppingCart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    todaySales: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // 1. Total In-Stock Items
      const { count: itemsCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'In-Stock');

      // 2. Customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // 3. Today's Sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: salesData } = await supabase
        .from('transactions')
        .select('total')
        .eq('type', 'Sale')
        .gte('created_at', today.toISOString());

      const todayTotal = salesData?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;

      // 4. Low Stock Count
      let lowStockCount = 0;
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_low_stock_count', { p_threshold: 5 });
        if (!rpcError) lowStockCount = rpcData || 0;
      } catch (e) {
        // Fallback or ignore if RPC isn't created yet
      }

      setStats({
        totalItems: itemsCount || 0,
        lowStock: lowStockCount,
        todaySales: todayTotal,
        customers: customersCount || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const cards = [
    { title: "مبيعات اليوم", value: `${stats.todaySales}`, unit: "ج.م", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { title: "المخزن", value: stats.totalItems, unit: "قطع", icon: Package, color: "text-amber-400", bg: "bg-amber-400/10" },
    { title: "العملاء", value: stats.customers, unit: "عميل", icon: Users, color: "text-orange-400", bg: "bg-orange-400/10" },
    { title: "النواقص", value: stats.lowStock, unit: "منتج", icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Welcome message */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white">أهلاً بك 👋</h1>
        <p className="text-white/60 text-sm">إليك ملخص أداء متجرك اليوم</p>
      </div>

      {/* Hero Stats Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-orange-600 p-8 text-white shadow-2xl shadow-primary/30 group active:scale-[0.98] transition-transform"
      >
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-xs font-black opacity-80 uppercase tracking-[0.2em]">إجمالي المبيعات اليوم</span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black drop-shadow-sm">{stats.todaySales}</span>
            <span className="text-xl font-medium opacity-80">ج.م</span>
          </div>
          <div className="mt-6 flex items-center gap-2 bg-white/15 w-fit py-1.5 px-4 rounded-full backdrop-blur-xl border border-white/10">
            <ArrowUpRight className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">+12% عن أمس</span>
          </div>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        {cards.slice(1).map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
          >
            <Card className="glass border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-all hover:-translate-y-1">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center ${card.color} border border-white/5`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/50">{card.title}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-white">{card.value}</span>
                    <span className="text-[10px] font-bold opacity-30">{card.unit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Dashboard */}
      <div className="space-y-6">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
          إجراءات سريعة
          <div className="h-1 w-8 bg-primary rounded-full" />
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <Link href="/pos">
            <Card className="p-6 flex items-center gap-5 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/10 hover:bg-emerald-500/20 transition-all active:scale-95 group overflow-hidden relative">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="flex-1 text-right relative z-10">
                <p className="font-black text-xl text-emerald-400">نقطة البيع (POS)</p>
                <p className="text-sm text-emerald-400/60 font-medium">فتح واجهة المبيعات السريعة</p>
              </div>
              {/* Decorative circle */}
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            </Card>
          </Link>

          <Link href="/inventory">
            <Card className="p-6 flex items-center gap-5 rounded-[2.5rem] bg-primary/10 border border-primary/10 hover:bg-primary/20 transition-all active:scale-95 group overflow-hidden relative">
              <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div className="flex-1 text-right relative z-10">
                <p className="font-black text-xl text-primary">إضافة للمخزن</p>
                <p className="text-sm text-primary/60 font-medium">تسجيل بضاعة جديدة في المتجر</p>
              </div>
              {/* Decorative circle */}
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            </Card>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 flex flex-col items-center gap-3 rounded-[2rem] glass border-white/5 hover:bg-white/[0.04] cursor-pointer transition-all active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/70 border border-white/5 group-hover:bg-white/10 transition-colors">
                <History className="w-6 h-6" />
              </div>
              <span className="font-black text-xs text-white/80">سجل العمليات</span>
            </Card>
            <Card className="p-5 flex flex-col items-center gap-3 rounded-[2rem] glass border-white/5 hover:bg-white/[0.04] cursor-pointer transition-all active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/70 border border-white/5 group-hover:bg-white/10 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <span className="font-black text-xs text-white/80">إدارة العملاء</span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
