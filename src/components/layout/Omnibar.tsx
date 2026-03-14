"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function Omnibar() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{ id: string; name: string; type: 'منتج' | 'قطعة' | 'عميل' }[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(3);

      const { data: items } = await supabase
        .from('items')
        .select('barcode')
        .ilike('barcode', `%${query}%`)
        .limit(3);

      const combined: { id: string; name: string; type: 'منتج' | 'قطعة' }[] = [
        ...(products?.map(p => ({ id: p.id, name: p.name, type: 'منتج' as const })) || []),
        ...(items?.map(i => ({ id: i.barcode, name: `سيريال: ${i.barcode}`, type: 'قطعة' as const })) || []),
      ];
      
      setResults(combined);
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const onSelect = (type: string, id: string) => {
    setOpen(false);
    if (type === 'منتج') router.push(`/inventory/product/${id}`);
    if (type === 'قطعة') router.push(`/inventory/item/${id}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 glass border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all w-10 h-10 md:w-auto md:h-auto group"
      >
        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline font-medium">بحث...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-bold text-white/50 opacity-100 uppercase">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="ابحث عن منتج، سيريال، أو عميل..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>لا توجد نتائج.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="النتائج">
              {results.map((res) => (
                <CommandItem
                  key={res.id}
                  onSelect={() => onSelect(res.type, res.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{res.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground uppercase">{res.type}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
