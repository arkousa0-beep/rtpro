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
  SelectTrigger
} from '@/components/ui/select';
import { QuickAddDialog } from './QuickAddDialog';
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
    <div className="w-full mt-auto pt-4 z-50 fixed bottom-0 left-0 right-0 pb-20 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
      <div className="max-w-xl mx-auto px-4 pointer-events-auto">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass bento p-5 pb-6 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 space-y-4 bg-black/80 backdrop-blur-3xl"
        >
          {/* Input & Form Area */}
          <div className="space-y-3">
            <form onSubmit={onAddItem} className="flex gap-2 relative">
              <QuickAddDialog />
              <div className="relative flex-1 group">
                <Scan className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  ref={inputRef}
                  placeholder="باركود..."
                  className="h-14 pr-12 bg-white/5 border-white/5 rounded-2xl text-lg font-bold text-white placeholder:text-white/20 focus:bg-white/10 transition-all border-none focus:ring-0 text-right"
                  autoComplete="off"
                  aria-label="Barcode Input"
                />
              </div>
              <Button 
                type="submit" 
                className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-black shadow-xl shadow-primary/20 active:scale-95 transition-transform shrink-0"
                disabled={loading}
                aria-label="إضافة المنتج"
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
            </form>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Select 
                  onValueChange={onCustomerIdChange} 
                  value={selectedCustomerId || 'walkin'}
                >
                  <SelectTrigger className="h-12 bg-white/5 rounded-2xl border-white/5 text-right px-4 text-white/60 font-bold focus:ring-0 text-sm overflow-hidden flex items-center justify-between">
                    {selectedCustomerId && selectedCustomerId !== 'walkin' ? (
                      <span className="truncate flex-1 text-right block">{customers.find(c => c.id === selectedCustomerId)?.name || "كاشير عام"}</span>
                    ) : (
                      <span className="truncate flex-1 text-right block">كاشير عام (Walk-in)</span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="glass border-white/5 rounded-2xl bg-black/90">
                    <SelectItem value="walkin" className="text-right font-bold py-3 text-white">كاشير عام (Walk-in)</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-right font-bold py-3 text-white">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex bg-white/5 rounded-2xl p-1 gap-1 shrink-0">
                {[
                  { id: 'Cash', icon: Coins, label: 'كاش' },
                  { id: 'Card', icon: CreditCard, label: 'فيزا' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => onPaymentMethodChange(method.id)}
                    className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${
                      paymentMethod === method.id 
                        ? 'bg-primary text-black font-black shadow-lg shadow-primary/20' 
                        : 'text-white/40 hover:text-white font-bold'
                    }`}
                    type="button"
                    title={`الدفع بواسطة ${method.label}`}
                    aria-label={`الدفع بواسطة ${method.label}`}
                  >
                    <method.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Button - PRIMARY THUMB ACTION */}
          <Button 
            className="w-full h-20 rounded-[2rem] bg-primary relative overflow-hidden group active:scale-[0.98] transition-all disabled:opacity-50"
            disabled={loading || total === 0}
            onClick={onCheckout}
            aria-label="إتمام عملية البيع"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="flex items-center justify-between w-full px-6 relative z-10">
              <div className="bg-black/10 px-4 py-1.5 rounded-2xl backdrop-blur-md border border-black/5">
                 <span className="text-black/40 text-[10px] font-black uppercase tracking-widest block text-right">الإجمالي</span>
                 <span className="text-2xl font-black text-black leading-none flex items-baseline gap-1">
                   {total} <small className="text-xs">ج.م</small>
                 </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-black">إتمام الدفع</span>
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-primary group-hover:rotate-[-10deg] transition-transform shadow-2xl">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                </div>
              </div>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
