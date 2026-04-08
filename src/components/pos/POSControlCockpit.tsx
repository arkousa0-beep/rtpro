"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, ArrowRight, Loader2, Coins, CreditCard, HandCoins, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger
} from '@/components/ui/select';
import { QuickAddDialog } from './QuickAddDialog';
import { CameraScannerDialog } from '@/components/ui/CameraScannerDialog';
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
  paidAmount: number;
  onPaidAmountChange: (amount: number) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  customers: Customer[];
  onScanBarcode: (barcode: string) => void;
  discountType: 'amount' | 'percentage';
  discountValue: number;
  onDiscountChange: (type: 'amount' | 'percentage', value: number) => void;
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
  paidAmount,
  onPaidAmountChange,
  inputRef,
  customers,
  onScanBarcode,
  discountType,
  discountValue,
  onDiscountChange
}: POSControlCockpitProps) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const computedDiscount = discountType === 'amount' ? discountValue : (total * (discountValue / 100));
  const finalTotal = Math.max(0, total - computedDiscount);
  
  return (
    <div className="w-full mt-auto pt-4 z-50 md:z-10 fixed bottom-0 left-0 right-0 md:static pb-20 md:pb-0 bg-gradient-to-t from-black via-black to-transparent md:from-transparent md:bg-none pointer-events-none md:pointer-events-auto">
      <div className="max-w-xl md:max-w-none mx-auto px-4 md:px-0 pointer-events-auto">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass bento p-5 pb-6 md:p-6 rounded-[2.5rem] md:rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] md:shadow-none border border-white/5 space-y-4 bg-black/80 md:bg-white/5 backdrop-blur-3xl md:backdrop-blur-none"
        >
          {/* Total Display (Desktop Only - Top of control panel) */}
          <div className="hidden md:flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-2">
            <span className="text-primary/60 font-black text-xs uppercase tracking-widest">المجموع الكلي</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-primary">{total.toLocaleString()}</span>
              <span className="text-xs font-bold text-primary/60">ج.م</span>
            </div>
          </div>

          {/* Input & Form Area */}
          <div className="space-y-3">
            <form onSubmit={onAddItem} className="flex gap-2 relative">
              <QuickAddDialog />
              <Button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/30 text-white/50 hover:text-primary shadow-lg active:scale-95 transition-all shrink-0"
                aria-label="فتح الكاميرا لمسح الباركود"
              >
                <Camera className="w-6 h-6" />
              </Button>
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

            <CameraScannerDialog
              open={isCameraOpen}
              onClose={() => setIsCameraOpen(false)}
              onScan={onScanBarcode}
            />

            <div className="flex flex-col sm:flex-row gap-2">
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

              {paymentMethod === 'Credit' && (
                <div className="flex-1 relative animate-in fade-in slide-in-from-right-2">
                  <Input
                    type="number"
                    value={paidAmount || ''}
                    onChange={(e) => onPaidAmountChange(Number(e.target.value))}
                    placeholder="المبلغ المدفع..."
                    className="h-12 bg-white/5 rounded-2xl border-white/5 text-right px-4 text-primary font-black focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-bold pointer-events-none">مدفوع</span>
                </div>
              )}

              <div className="flex bg-white/5 rounded-2xl p-1 gap-1 shrink-0">
                {[
                  { id: 'Cash', icon: Coins, label: 'كاش' },
                  { id: 'Card', icon: CreditCard, label: 'فيزا' },
                  { id: 'Credit', icon: HandCoins, label: 'آجل' }
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

            {/* Discount Section */}
            <div className="flex gap-2">
              <div className="flex-1 relative flex items-center bg-white/5 rounded-2xl p-1 overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => onDiscountChange('amount', discountValue)}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all ${discountType === 'amount' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  مبلغ (ج.م)
                </button>
                <button
                  type="button"
                  onClick={() => onDiscountChange('percentage', discountValue)}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all ${discountType === 'percentage' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  نسبة (%)
                </button>
              </div>
              <div className="flex-1 relative">
                <Input
                  type="number"
                  value={discountValue || ''}
                  onChange={(e) => onDiscountChange(discountType, Number(e.target.value))}
                  placeholder="قيمة الخصم..."
                  className="h-12 bg-white/5 rounded-2xl border-white/5 text-right px-4 text-amber-500 font-black focus:ring-1 focus:ring-amber-500/30 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Checkout Button - PRIMARY THUMB ACTION */}
          <Button 
            className="w-full h-20 md:h-24 rounded-[2rem] bg-primary relative overflow-hidden group active:scale-[0.98] transition-all disabled:opacity-50"
            disabled={loading || total === 0}
            onClick={onCheckout}
            aria-label="إتمام عملية البيع"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="flex items-center justify-between w-full px-6 relative z-10">
              <div className="bg-black/10 px-4 py-1.5 rounded-2xl backdrop-blur-md border border-black/5 md:hidden">
                 <span className="text-black/40 text-[10px] font-black uppercase tracking-widest block text-right">الإجمالي النهائي</span>
                 <span className="text-2xl font-black text-black leading-none flex items-baseline gap-1">
                   {finalTotal} <small className="text-xs">ج.م</small>
                 </span>
              </div>
              
              <div className="flex items-center justify-center w-full md:justify-between gap-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-black/50">بعد الخصم</span>
                  <span className="text-2xl font-black text-black leading-none">{finalTotal} ج.م</span>
                </div>
                <span className="text-xl md:text-2xl font-black text-black">إتمام الدفع الآن</span>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded-xl flex items-center justify-center text-primary group-hover:rotate-[-10deg] transition-transform shadow-2xl">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6 md:w-7 md:h-7" />}
                </div>
              </div>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

