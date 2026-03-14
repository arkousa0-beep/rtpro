"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, PhoneCall, MapPin, Trash2, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

import { Customer } from "@/lib/services/customerService";

interface CustomerListProps {
  customers: Customer[];
  onDelete: (id: string) => void;
}

export function CustomerList({ customers, onDelete }: CustomerListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {customers.map((customer, idx) => (
        <motion.div
          key={customer.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
        >
          <Link href={`/customers/${customer.id}`}>
            <Card className="glass border-white/5 rounded-[2rem] group hover:bg-white/[0.04] transition-all overflow-hidden cursor-pointer relative">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
              <CardContent className="p-5 flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-lg text-white flex items-center gap-2">
                      {customer.name}
                      <ExternalLink className="w-3 h-3 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20" onClick={(e) => e.preventDefault()}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {customer.phone && (
                      <div className="flex items-center gap-1.5 text-white/40">
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold font-mono">{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-1.5 text-white/40">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold truncate max-w-[120px]">{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 hidden sm:block">
                    <p className={`font-black text-sm ${Number(customer.balance) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {Number(customer.balance || 0).toLocaleString()} <span className="text-[10px]">ج.م</span>
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full text-white/20 hover:text-destructive hover:bg-destructive/10 z-20"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(customer.id!); }}              >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
