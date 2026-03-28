"use client";

import { motion } from "framer-motion";
import { User, Phone, Trash2, ArrowUpRight, MessageCircle, Wallet, Search, MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Customer } from "@/lib/services/customerService";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CustomerListProps {
  customers: Customer[];
}

export const CustomerList = ({ customers }: CustomerListProps) => {
  const router = useRouter();

  if (customers.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-32 space-y-4"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-6">
          <User className="w-12 h-12 text-white/10" />
        </div>
        <p className="text-white/30 text-xl font-black">لا يوجد عملاء مسجلين</p>
        <p className="text-white/10 text-sm">ابدأ بإضافة أول عميل لك بالضغط على زر "عميل جديد"</p>
      </motion.div>
    );
  }

  const formatWhatsAppNumber = (phone?: string | null) => {
    if (!phone) return null;
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '2' + clean;
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {customers.map((customer, idx) => {
        const waLink = formatWhatsAppNumber(customer.phone);
        const hasBalance = Number(customer.balance || 0) > 0;

        return (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: idx * 0.05,
              type: "spring",
              stiffness: 120,
              damping: 12
            }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <Card 
              onClick={() => router.push(`/customers/${customer.id}`)}
              className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] active:scale-[0.98] cursor-pointer relative"
            >
              {/* Top Accent Gradient */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1 transition-opacity duration-500",
                hasBalance ? "bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0" : "bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"
              )} />

              <CardContent className="p-7 space-y-6">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1.5">
                    <h4 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                      {customer.name}
                    </h4>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/30 font-bold text-sm">
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 hover:text-white/50 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                          <span dir="ltr">{customer.phone}</span>
                        </div>
                      )}
                      {customer.created_at && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(customer.created_at), 'd MMM yyyy', { locale: ar })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-white/10 via-white/5 to-transparent flex items-center justify-center border border-white/10 shadow-xl group-hover:rotate-6 transition-transform duration-500">
                      <User className="w-8 h-8 text-white/50" />
                    </div>
                  </div>
                </div>



                {/* Action Grid/Tabs */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={cn(
                      "rounded-[1.8rem] p-4 flex flex-col items-center justify-center gap-1.5 border transition-all duration-500 relative overflow-hidden group/item",
                      hasBalance 
                        ? "bg-red-500/[0.02] border-red-500/10 hover:border-red-500/40 hover:bg-red-500/5" 
                        : "bg-emerald-500/[0.02] border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                    )}>
                        <Wallet className={cn("w-5 h-5", hasBalance ? "text-red-400" : "text-emerald-400")} />
                        <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">المديونية</span>
                        <span className={cn(
                          "text-lg font-black tracking-tight",
                          hasBalance ? "text-red-400" : "text-emerald-400"
                        )}>
                          {Number(customer.balance || 0).toLocaleString()}
                        </span>
                        
                        {/* Subtle background glow on item hover */}
                        <div className={cn(
                          "absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity blur-2xl -z-10",
                          hasBalance ? "bg-red-500/10" : "bg-emerald-500/10"
                        )} />
                    </div>

                    <div className="bg-blue-500/[0.02] border-white/5 rounded-[1.8rem] p-4 flex flex-col items-center justify-center gap-1.5 border hover:border-blue-400/40 hover:bg-blue-500/5 transition-all duration-500 group/item">
                        <ArrowUpRight className="w-5 h-5 text-blue-400" />
                        <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">دخول</span>
                        <span className="text-xs font-black text-blue-400">التفاصيل</span>
                        
                        <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity blur-2xl bg-blue-500/10 -z-10" />
                    </div>
                </div>

                {/* WhatsApp Action Button */}
                {waLink && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(waLink, '_blank');
                    }}
                    className="w-full h-14 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 group/wa active:scale-[0.98] transition-all"
                  >
                    <MessageCircle className="w-6 h-6 text-black fill-black/10 group-hover/wa:scale-110 transition-transform" />
                    <span className="text-black font-black text-lg">واتساب</span>
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
