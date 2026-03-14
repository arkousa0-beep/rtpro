"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Scan, ArrowRight, Loader2, Coins, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

import { Customer } from "@/lib/services/customerService";

interface POSControlCockpitProps {
  total: number;
  loading: boolean;
  paymentMethod: string;
  selectedCustomerId: string | null;
  onAddItem: (e: React.FormEvent) => void;
  onCheckout: () => void;
  onPaymentMethodChange: (method: string) => void;
  onCustomerIdChange: (id: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  customers: Customer[];
}

/**
 * POS Control Cockpit
 * Fixed bottom control area optimized for one-handed mobile use (Thumb Zone).
 * Following @[/mobile-design] standards for reachability and feedback.
 */
export const POSControlCockpit = ({
  total,
  loading,
  paymentMethod,
  selectedCustomerId,
  onAddItem,
  onCheckout,
  onPaymentMethodChange,
  onCustomerIdChange,
  inputRef,
  customers
}: POSControlCockpitProps) => {
  return (
    <div className="w-full mt-auto pt-4 z-50">
      <div className="max-w-xl mx-auto">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass bento p-6 pb-8 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 space-y-5"
        >
          {/* Input & Form Area */}
          <div className="space-y-4">
            <form onSubmit={onAddItem} className="flex gap-3">
              <div className="relative flex-1 group">
                <Scan className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  ref={inputRef}
                  placeholder="امسح الباركود هنا..." 
                  className="h-16 pr-14 bg-white/5 border-white/5 rounded-2xl text-lg font-bold text-white placeholder:text-white/20 focus:bg-white/10 transition-all border-none focus:ring-0"
                  autoComplete="off"
                  aria-label="Barcode Input"
                />
              </div>
              <Button 
                type="submit" 
                className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 text-black shadow-xl shadow-primary/20 active:scale-95 transition-transform"
                disabled={loading}
                aria-label="إضافة المنتج"
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
            </form>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Select 
                  onValueChange={onCustomerIdChange} 
                  value={selectedCustomerId || 'walkin'}
                >
                  <SelectTrigger className="h-14 bg-white/5 rounded-2xl border-white/5 text-right px-6 text-white/60 font-bold focus:ring-0 text-sm">
                    {selectedCustomerId && selectedCustomerId !== 'walkin' ? (
                      <span className="block truncate">{customers.find(c => c.id === selectedCustomerId)?.name || "كاشير عام"}</span>
                    ) : (
                      <span className="block truncate">كاشير عام (Walk-in)</span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="glass border-white/5 rounded-2xl">
                    <SelectItem value="walkin" className="text-right font-bold py-3">كاشير عام (Walk-in)</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-right font-bold py-3">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
                {[
                  { id: 'Cash', icon: Coins, label: 'كاش' },
                  { id: 'Card', icon: CreditCard, label: 'فيزا' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => onPaymentMethodChange(method.id)}
                    className={`flex items-center gap-2 px-5 rounded-xl transition-all h-12 ${
                      paymentMethod === method.id 
                        ? 'bg-primary text-black font-black shadow-lg shadow-primary/20' 
                        : 'text-white/40 hover:text-white font-bold'
                    }`}
                    type="button"
                    aria-label={`الدفع بواسطة ${method.label}`}
                  >
                    <method.icon className="w-4 h-4" />
                    <span className="text-xs">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Button - PRIMARY THUMB ACTION */}
          <Button 
            className="w-full h-24 rounded-[2.5rem] bg-primary relative overflow-hidden group active:scale-[0.98] transition-all disabled:opacity-50"
            disabled={loading}
            onClick={onCheckout}
            aria-label="إتمام عملية البيع"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="flex items-center justify-between w-full px-10 relative z-10">
              <div className="bg-black/10 px-6 py-2 rounded-2xl backdrop-blur-md">
                 <span className="text-black/40 text-[10px] font-black uppercase tracking-widest block text-right">الإجمالي</span>
                 <span className="text-3xl font-black text-black leading-none">{total} <small className="text-sm">ج.م</small></span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-black">إتمام الدفع</span>
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-primary group-hover:rotate-[-10deg] transition-transform shadow-2xl">
                  {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <ArrowRight className="w-7 h-7" />}
                </div>
              </div>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
