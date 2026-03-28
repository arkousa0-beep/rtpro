"use client";

import { Phone, ChevronLeft, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DebtCardProps {
  id: string;
  name: string;
  phone?: string | null;
  balance: number;
  href: string;
  variant: 'customer' | 'supplier';
  onPaymentClick?: () => void;
}

export function DebtCard({ id, name, phone, balance, href, variant, onPaymentClick }: DebtCardProps) {
  const isCustomer = variant === 'customer';

  return (
    <Card className={`glass border-white/5 rounded-[2rem] group hover:bg-white/[0.04] active:scale-[0.98] transition-all duration-300 overflow-hidden border ${
      isCustomer ? 'hover:border-red-500/30' : 'hover:border-amber-500/30'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isCustomer ? 'from-red-500/10 to-red-600/5' : 'from-amber-500/10 to-amber-600/5'
      }`} />

      <CardContent className="p-5 flex items-center gap-4 relative z-10">
        {/* Avatar */}
        <Link href={href} className="contents">
          <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-xl font-black border shrink-0 ${
            isCustomer
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            {name.charAt(0)}
          </div>
        </Link>

        {/* Info */}
        <Link href={href} className="flex-1 min-w-0">
          <p className="text-white font-black text-lg truncate">{name}</p>
          {phone && (
            <div className="flex items-center gap-1 text-white/40 text-sm mt-0.5">
              <Phone className="w-3 h-3" />
              <span className="font-mono">{phone}</span>
            </div>
          )}
        </Link>

        {/* Balance & Action */}
        <div className="flex flex-col items-start gap-2 shrink-0 pr-4">
          <div className="text-left w-full">
            <p className={`text-xl font-black tabular-nums ${isCustomer ? 'text-red-400' : 'text-amber-400'}`}>
              {Number(balance).toLocaleString()}
            </p>
            <p className="text-[10px] font-black text-white/30 text-left">ج.م</p>
          </div>
          
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPaymentClick?.();
            }}
            className={`h-8 px-3 rounded-xl text-[10px] font-black transition-all ${
              isCustomer 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' 
                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white'
            }`}
          >
            <Wallet className="w-3 h-3 ml-1" />
            {isCustomer ? 'تحصيل' : 'سداد'}
          </Button>
        </div>

        {/* Arrow */}
        <Link href={href}>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-primary transition-all duration-300 group-hover:translate-x-[-4px]">
            <ChevronLeft className="w-4 h-4" />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
