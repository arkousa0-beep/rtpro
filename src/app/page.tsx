"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
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

import { productService } from "@/lib/services/productService";

export default function Home() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    todaySales: 0,
    yesterdaySales: 0,
    customers: 0,
    totalCost: 0,
    totalSelling: 0
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      // Get User Info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }

      // 1. Inventory Stats from RPC
      const inventoryStats = await productService.getInventoryStats();

      // 2. Customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // 3. Today's & Yesterday's Sales (for real growth calculation)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const [todayRes, yesterdayRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('total')
          .eq('type', 'Sale')
          .gte('created_at', today.toISOString()),
        supabase
          .from('transactions')
          .select('total')
          .eq('type', 'Sale')
          .gte('created_at', yesterday.toISOString())
          .lt('created_at', today.toISOString()),
      ]);

      const todayTotal = todayRes.data?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;
      const yesterdayTotal = yesterdayRes.data?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;

      setStats({
        totalItems: Number(inventoryStats.total_items) || 0,
        lowStock: Number(inventoryStats.low_stock_count) || 0,
        todaySales: todayTotal,
        yesterdaySales: yesterdayTotal,
        customers: customersCount || 0,
        totalCost: Number(inventoryStats.total_cost_value) || 0,
        totalSelling: Number(inventoryStats.total_selling_value) || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  // Realtime: auto-refresh stats when transactions change
  useRealtimeSubscription({
    table: 'transactions',
    event: '*',
    onData: () => {
      // Re-fetch stats silently without showing loading
      fetchStats();
    },
  });
  const cards = [
    { title: "مبيعات اليوم", value: `${stats.todaySales}`, unit: "ج.م", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", href: "/transactions", permission: "transactions" },
    { title: "المخزن", value: stats.totalItems, unit: "قطع", icon: Package, color: "text-amber-400", bg: "bg-amber-400/10", href: "/inventory", permission: "inventory" },
    { title: "قيمة المخزن (بيع)", value: stats.totalSelling.toLocaleString(), unit: "ج.م", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", href: "/inventory", permission: "inventory" },
    { title: "النواقص", value: stats.lowStock, unit: "منتج", icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", href: "/inventory", permission: "inventory" },
  ].filter(card => !card.permission || (profile?.permissions?.[card.permission] ?? true));

  const quickActions = [
    { title: "نقطة البيع (POS)", desc: "فتح واجهة المبيعات السريعة", icon: ShoppingCart, color: "emerald", href: "/pos", permission: "pos" },
    { title: "إضافة للمخزن", desc: "تسجيل بضاعة جديدة في المتجر", icon: PlusCircle, color: "primary", href: "/inventory", permission: "inventory" },
  ].filter(action => !action.permission || (profile?.permissions?.[action.permission] ?? true));

  const bottomActions = [
    { title: "سجل العمليات", icon: History, href: "/transactions", permission: "transactions" },
    { title: "إدارة العملاء", icon: Users, href: "/customers", permission: "customers" },
  ].filter(action => !action.permission || (profile?.permissions?.[action.permission] ?? true));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1 px-2">
        <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-2xl">أهلاً بك 👋</h1>
        <p className="text-white/40 text-sm font-bold tracking-wide uppercase">إليك ملخص أداء متجرك اليوم</p>
      </div>

      {/* Hero Stats Card - Animated & Premium */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0A0A0B] p-8 text-white shadow-2xl border border-white/5 group active:scale-[0.98] transition-all duration-500"
      >
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent opacity-50 transition-opacity group-hover:opacity-80" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 glass border border-indigo-500/20">
                <TrendingUp className="w-6 h-6" />
             </div>
             <span className="text-xs font-black text-indigo-400/80 uppercase tracking-[0.2em]">إجمالي المبيعات اليوم</span>
          </div>
          
          <div className="flex items-baseline gap-3">
            <span className="text-7xl font-black tracking-tighter tabular-nums drop-shadow-2xl">
              {stats.todaySales.toLocaleString()}
            </span>
            <span className="text-2xl font-black text-white/10 uppercase tracking-[0.2em] relative -top-1">ج.م</span>
          </div>

          <div className="flex items-center gap-4 mt-2">
            {(() => {
              const pct = stats.yesterdaySales > 0
                ? Math.round(((stats.todaySales - stats.yesterdaySales) / stats.yesterdaySales) * 100)
                : stats.todaySales > 0 ? 100 : 0;
              const isPositive = pct >= 0;
              return (
                <div className={`flex items-center gap-2 py-2 px-5 rounded-full backdrop-blur-3xl border shadow-xl ${
                  isPositive
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  {isPositive
                    ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    : <ArrowUpRight className="w-4 h-4 text-red-400 rotate-90" />
                  }
                  <span className={`text-xs font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{pct}% عن أمس
                  </span>
                </div>
              );
            })()}
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">تحديث مباشر</span>
          </div>
        </div>
      </motion.div>

      {/* Grid Stats - Premium Bento Style */}
      <div className="grid grid-cols-2 gap-6">
        {cards.slice(1).map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * (idx + 1), type: "spring", stiffness: 100 }}
          >
            <Link href={card.href || "#"}>
              <Card className="bento border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.04] transition-all group relative h-full shadow-lg">
                <CardContent className="p-7 flex flex-col gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center ${card.color} glass border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    <card.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{card.title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{card.value}</span>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{card.unit}</span>
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute -left-4 -top-4 w-12 h-12 ${card.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Action Dashboard - Floating Glass Design */}
      <div className="space-y-8 pt-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black tracking-tighter text-white flex items-center gap-4">
            <Scan className="w-7 h-7 text-indigo-500" />
            إجراءات سريعة
          </h3>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent mr-6 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="group relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-1 transition-all hover:bg-white/[0.05] active:scale-[0.98]">
                <div className={`flex items-center gap-6 p-6 rounded-[2.3rem] bg-gradient-to-br from-${action.color}-500/10 to-transparent border border-${action.color}-500/10 shadow-2xl overflow-hidden relative`}>
                  <div className={`w-18 h-18 min-w-[4.5rem] rounded-3xl bg-${action.color}-500 flex items-center justify-center text-white shadow-2xl shadow-${action.color}-500/40 group-hover:scale-105 transition-transform duration-500 relative z-10`}>
                    <action.icon className="w-9 h-9" />
                  </div>
                  <div className="flex-1 text-right relative z-10">
                    <p className={`font-black text-2xl text-${action.color}-400 mb-1 tracking-tight`}>{action.title}</p>
                    <p className={`text-sm text-white/40 font-bold tracking-tight`}>{action.desc}</p>
                  </div>
                  {/* Background Accents */}
                  <div className={`absolute -left-10 -bottom-10 w-32 h-32 bg-${action.color}-500/20 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-700`} />
                  <div className={`absolute top-0 right-0 w-2 h-full bg-${action.color}-500/20 blur-sm`} />
                </div>
              </div>
            </Link>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {bottomActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="p-6 flex flex-col items-center gap-4 rounded-[2.5rem] bento border-white/5 hover:bg-white/[0.06] cursor-pointer transition-all active:scale-95 group shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-500">
                    <action.icon className="w-7 h-7" />
                  </div>
                  <span className="font-black text-sm text-white/80 tracking-tight">{action.title}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
