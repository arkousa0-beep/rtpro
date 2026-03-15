"use client";

import { motion } from "framer-motion";
import { User, Phone, Trash2, ArrowUpRight, MessageCircle, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Customer } from "@/lib/services/customerService";

interface CustomerListProps {
  customers: Customer[];
  onDelete: (id: string) => void;
}

export const CustomerList = ({ customers, onDelete }: CustomerListProps) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-24 space-y-4 text-white/30">
        <User className="w-16 h-16 mx-auto opacity-20" />
        <p className="font-bold">لا يوجد عملاء مسجلين</p>
      </div>
    );
  }

  const formatWhatsAppNumber = (phone?: string) => {
    if (!phone) return null;
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '2' + clean; // Assuming Egypt (+20) as default for local numbers starting with 0
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer, idx) => {
        const waLink = formatWhatsAppNumber(customer.phone);

        return (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] transition-all group active:scale-[0.98] shadow-lg shadow-black/40">
              <CardContent className="p-5 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-white group-hover:text-blue-400 transition-colors">
                        {customer.name}
                      </h4>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-white/40 font-mono text-sm">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="w-10 h-10 rounded-xl text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
                        onDelete(customer.id);
                      }
                    }}
                    title="حذف العميل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {customer.address && (
                  <p className="text-sm text-white/40 bg-white/5 p-3 rounded-2xl mb-4 border border-white/5 truncate" title={customer.address}>
                    {customer.address}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {waLink && (
                      <a href={waLink} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all border border-emerald-500/20"
                          title="مراسلة عبر واتساب"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      className="h-10 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 font-bold px-4"
                      title="سداد / إضافة مديونية"
                    >
                      <Wallet className="w-4 h-4 ml-2" />
                      المديونية
                    </Button>
                  </div>

                  <div className="text-left bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">المبيعات</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-white text-lg">0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
