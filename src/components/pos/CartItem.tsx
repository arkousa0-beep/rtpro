"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CartItemProps {
  item: {
    barcode: string;
    selling_price: number;
    products: {
      name: string;
      image_url: string | null;
    } | null;
  };
  onRemove: (barcode: string) => void;
}

/**
 * POS Cart Item Component
 * Optimized for mobile touch with 48px+ touch targets and performance memoization.
 * Following @[/mobile-design] and @[/frontend-mobile-development-component-scaffold] standards.
 */
export const CartItem = React.memo(({ item, onRemove }: CartItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      layout
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <Card 
        className="glass border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] transition-all group active:scale-[0.99]"
        role="listitem"
        aria-label={`منتج: ${item.products?.name || 'غير معروف'}, السعر: ${item.selling_price}`}
      >
        <CardContent className="p-4 pr-5 pl-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center border border-white/5 shrink-0 group-hover:bg-primary/5 transition-colors overflow-hidden">
              {item.products?.image_url ? (
                <img 
                  src={item.products.image_url} 
                  alt={item.products.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Tag className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-base text-white truncate leading-tight mb-1">
                {item.products?.name}
              </h4>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black font-mono text-white/10 tracking-widest uppercase">
                   {item.barcode}
                 </span>
                 <Badge className="bg-white/5 text-[9px] h-5 rounded-full font-bold text-white/40 border-none px-2">
                   في المخزن
                 </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
               <div className="flex items-baseline justify-end gap-1">
                  <span className="text-xl font-black text-white">{item.selling_price}</span>
                  <span className="text-[10px] font-bold text-primary">ج.م</span>
               </div>
            </div>
            {/* 48px Touch Target Button for Mobile Optimization */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-12 rounded-2xl hover:bg-red-500/10 hover:text-red-500 text-white/20 transition-all active:scale-90" 
              onClick={() => onRemove(item.barcode)}
              aria-label={`إزالة ${item.products?.name || 'المنتج'} من السلة`}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';
