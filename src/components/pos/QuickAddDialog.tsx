"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, PackageOpen, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePOSStore } from "@/store/usePOSStore";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchResultItem {
  barcode: string;
  selling_price: number;
  products: { name: string };
}

interface GroupedProduct {
  name: string;
  items: SearchResultItem[];
  count: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function QuickAddDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [grouped, setGrouped] = useState<GroupedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const { addItem, cart } = usePOSStore();

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delaySearch = setTimeout(() => handleSearch(), 500);
      return () => clearTimeout(delaySearch);
    } else {
      setGrouped([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSearch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select(`barcode, selling_price, products!inner(name)`)
      .eq('status', 'In-Stock')
      .ilike('products.name', `%${searchQuery}%`)
      .limit(50);

    if (error) {
      console.error("Error searching items:", error);
      setGrouped([]);
    } else {
      const cartBarcodes = new Set(cart.map((item) => item.barcode));
      const available = (data ?? []).filter(
        (item) => !cartBarcodes.has(item.barcode)
      ) as unknown as SearchResultItem[];

      // Group by product name
      const groupMap = new Map<string, SearchResultItem[]>();
      for (const item of available) {
        const name = item.products?.name ?? 'غير معروف';
        if (!groupMap.has(name)) groupMap.set(name, []);
        groupMap.get(name)!.push(item);
      }

      setGrouped(
        Array.from(groupMap.entries()).map(([name, items]) => ({
          name,
          items,
          count: items.length,
        }))
      );
    }
    setLoading(false);
  };

  const handleQuickAdd = async (barcode: string, productName: string) => {
    const res = await addItem(barcode);
    if (res.success) {
      toast.success(`تم إضافة ${productName}`);
      // Remove added item from grouped results
      setGrouped(prev =>
        prev.map(g => ({
          ...g,
          items: g.items.filter(i => i.barcode !== barcode),
          count: g.items.filter(i => i.barcode !== barcode).length,
        })).filter(g => g.count > 0)
      );
      if (grouped.length <= 1 && grouped[0]?.count <= 1) {
        setOpen(false);
        setSearchQuery("");
      }
    } else {
      toast.error(res.message || "حدث خطأ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearchQuery(""); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95 flex-shrink-0"
          title="بحث يدوي"
        >
          <Search className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-white/10 rounded-[2.5rem] p-6 max-w-md mx-auto top-[30%] translate-y-[-30%]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-black text-white text-right flex items-center justify-end gap-2">
            إضافة يدوية سريعة
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <PackageOpen className="w-4 h-4" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="ابحث باسم المنتج..."
              className="h-14 pr-12 rounded-2xl bg-white/5 border-white/5 text-white placeholder:text-white/30 focus:bg-white/10 transition-all border-none focus:ring-0 text-right text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <ScrollArea className="h-[250px] pr-2">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : grouped.length > 0 ? (
              <div className="space-y-2">
                {grouped.map((group) => (
                  <div key={group.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
                    <div className="flex-1 text-right">
                      <p className="font-bold text-white text-sm">{group.name}</p>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-md font-bold">
                          {group.count} قطعة متاحة
                        </span>
                        <span className="text-xs font-black text-primary">
                          {group.items[0].selling_price} ج.م
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleQuickAdd(group.items[0].barcode, group.name)}
                      className="ml-3 h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 2 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-2">
                <PackageOpen className="w-10 h-10 opacity-20" />
                <p>لا توجد نتائج أو القطع مضافة مسبقاً</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white/20 text-sm">
                اكتب 3 حروف على الأقل للبحث
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
