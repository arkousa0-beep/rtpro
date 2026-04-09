"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Store, 
  Package, 
  Tag, 
  ChevronLeft,
  Settings,
  ShieldCheck,
  PackageSearch,
  CreditCard,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ReturnDialog } from "@/components/ReturnDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const allManageItems = [
  {
    title: "المخزن",
    desc: "الإضافات والجرد والحالة",
    icon: PackageSearch,
    href: "/inventory",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    borderColor: "group-hover:border-primary/50",
    permission: "inventory"
  },
  {
    title: "المنتجات",
    desc: "تعريف الأنواع والموديلات",
    icon: Package,
    href: "/products",
    color: "from-indigo-500/20 to-indigo-600/5",
    iconColor: "text-indigo-500",
    borderColor: "group-hover:border-indigo-500/50",
    permission: "inventory"
  },
  {
    title: "الأصناف",
    desc: "ترتيب وتنظيم التصنيفات",
    icon: Tag,
    href: "/categories",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-500",
    borderColor: "group-hover:border-emerald-500/50",
    permission: "inventory"
  },
  {
    title: "العملاء",
    desc: "إدارة البيانات والديون",
    icon: Users,
    href: "/customers",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
    borderColor: "group-hover:border-blue-500/50",
    permission: "customers"
  },
  {
    title: "الموردين",
    desc: "إدارة شركات التوريد",
    icon: Store,
    href: "/suppliers",
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-500",
    borderColor: "group-hover:border-amber-500/50",
    permission: "suppliers"
  },
  {
    title: "سجل المعاملات",
    desc: "الحركات المالية والمبيعات",
    icon: ShieldCheck,
    href: "/transactions",
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-500",
    borderColor: "group-hover:border-cyan-500/50",
    permission: "transactions"
  },
  {
    title: "المرتجعات",
    desc: "سجل عمليات الإرجاع والاسترجاع",
    icon: RotateCcw,
    href: "/returns",
    color: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-500",
    borderColor: "group-hover:border-orange-500/50",
    permission: "transactions"
  },
  {
    title: "إدارة الديون",
    desc: "متابعة الديون والبيع الآجل",
    icon: CreditCard,
    href: "/debts",
    color: "from-red-500/20 to-red-600/5",
    iconColor: "text-red-400",
    borderColor: "group-hover:border-red-500/50",
    permission: "finance"
  },
  {
    title: "الموظفين",
    desc: "إدارة فريق العمل والصلاحيات",
    icon: Users,
    href: "/manage/employees",
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-500",
    borderColor: "group-hover:border-rose-500/50",
    permission: "staff"
  },
];

export default function ManagePage() {
  const [manageItems, setManageItems] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      if (profileData?.role === "Manager") {
        setManageItems(allManageItems);
      } else {
        const filtered = allManageItems.filter(item => profileData?.permissions?.[item.permission]);
        setManageItems(filtered);
        
        if (filtered.length === 0) {
          router.push("/");
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 pt-10 px-6 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4 text-center md:text-right">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-l from-white to-white/50">
          مركز الإدارة
        </h1>
        <p className="text-white/30 text-lg md:text-2xl font-medium">تحكم ذكي في مفاصل مشروعك</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {manageItems.map((item, idx) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <Link href={item.href}>
                <Card className={`glass border-white/5 rounded-[2.5rem] group hover:bg-white/[0.04] active:scale-[0.98] transition-all duration-500 overflow-hidden relative border transition-colors ${item.borderColor}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  
                  <CardContent className="p-7 flex items-center gap-6 relative z-10">
                    <div className={`w-20 h-20 rounded-[1.8rem] bg-white/5 flex items-center justify-center ${item.iconColor} border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl`}>
                      <item.icon className="w-10 h-10" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-1 group-hover:translate-x-[-4px] transition-transform">{item.title}</h3>
                      <p className="text-white/40 text-base font-bold">{item.desc}</p>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-primary transition-all duration-500 group-hover:translate-x-[-8px]">
                      <ChevronLeft className="w-7 h-7" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Extra Actions */}
      <div className="space-y-6 pt-6">
        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] px-4 text-center md:text-right">إجراءات النظام الإضافية</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <ReturnDialog />
           
           <Button variant="outline" className="h-20 rounded-[2rem] flex-1 border-white/5 bg-white/5 text-xl font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-primary/30 transition-all group">
              <ShieldCheck className="w-6 h-6 ml-3 text-primary group-hover:scale-110 transition-transform" />
              تأمين البيانات والنسخ
           </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-12 opacity-30 flex flex-col items-center gap-4">
         <div className="p-4 rounded-full bg-white/5 border border-white/5">
            <Settings className="w-8 h-8 animate-spin-slow text-white" />
         </div>
         <div className="space-y-1">
           <p className="text-[11px] font-black tracking-[0.5em] uppercase text-white">SmartStore OS</p>
           <p className="text-[9px] font-bold text-white/50 tracking-widest">ENTERPRISE EDITION • V2.5.0</p>
         </div>
      </div>
    </div>
  );
}
