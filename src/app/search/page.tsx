"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Calendar, 
  Filter, 
  ArrowLeft, 
  Package, 
  User, 
  Truck, 
  Receipt, 
  Barcode,
  X
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchService, SearchEntityType, SearchResult } from '@/lib/services/searchService';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { useUIStore } from '@/lib/store/uiStore';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { pageStates, setPageState } = useUIStore();
  const searchState = pageStates['universal-search'] || { 
    search: searchParams.get('q') || '', 
    filters: { 
      startDate: '', 
      endDate: '', 
      types: ['product', 'item', 'customer', 'supplier', 'transaction'] 
    } 
  };
  
  const query = searchState.search;
  const startDate = searchState.filters?.startDate || '';
  const endDate = searchState.filters?.endDate || '';
  const selectedTypes = (searchState.filters?.types as SearchEntityType[]) || ['product', 'item', 'customer', 'supplier', 'transaction'];

  const setQuery = (val: string) => setPageState('universal-search', { ...searchState, search: val });
  const setStartDate = (val: string) => setPageState('universal-search', { 
    ...searchState, 
    filters: { ...searchState.filters, startDate: val } 
  });
  const setEndDate = (val: string) => setPageState('universal-search', { 
    ...searchState, 
    filters: { ...searchState.filters, endDate: val } 
  });
  const setSelectedTypes = (val: SearchEntityType[]) => setPageState('universal-search', { 
    ...searchState, 
    filters: { ...searchState.filters, types: val } 
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const handleSearch = useCallback(async () => {
    if (!query && !startDate && !endDate) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const data = await searchService.universalSearch({
        query,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        entities: selectedTypes
      });
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [query, startDate, endDate, selectedTypes]);

  useEffect(() => {
    const timer = setTimeout(handleSearch, 400);
    return () => clearTimeout(timer);
  }, [handleSearch]);

  const toggleType = (type: SearchEntityType) => {
    const next = selectedTypes.includes(type) 
      ? selectedTypes.filter(t => t !== type) 
      : [...selectedTypes, type];
    setSelectedTypes(next);
  };

  const getIcon = (type: SearchEntityType) => {
    switch(type) {
      case 'product': return <Package className="w-5 h-5" />;
      case 'item': return <Barcode className="w-5 h-5" />;
      case 'customer': return <User className="w-5 h-5" />;
      case 'supplier': return <Truck className="w-5 h-5" />;
      case 'transaction': return <Receipt className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: SearchEntityType) => {
    switch(type) {
      case 'product': return 'منتج';
      case 'item': return 'قطعة/سيريال';
      case 'customer': return 'عميل';
      case 'supplier': return 'مورد';
      case 'transaction': return 'عملية';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">مركز البحث المتقدم</h1>
      </div>

      {/* Search Input Area */}
      <Card className="mb-6 glass border-white/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن أي شيء... اسم المنتج، الهاتف، رقم الفاتورة، السيريال"
              className="pr-12 h-14 text-lg bg-white/5 border-white/10 rounded-2xl focus:ring-primary shadow-inner"
              autoFocus
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" /> تاريخ البداية
              </label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" /> تاريخ النهاية
              </label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          {/* Entity Toggles */}
          <div className="mt-6 flex flex-wrap gap-2">
            {(['product', 'item', 'customer', 'supplier', 'transaction'] as SearchEntityType[]).map((type) => (
              <Button
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleType(type)}
                className="rounded-full gap-2 transition-all"
              >
                {getIcon(type)}
                {getTypeLabel(type)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p>جاري البحث في قاعدة البيانات...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground mb-2">تم العثور على {results.length} نتيجة</p>
            {results.map((res) => (
              <Link key={`${res.type}-${res.id}`} href={res.link}>
                <Card className="hover:bg-white/5 hover:border-primary/50 transition-all cursor-pointer group shadow-lg shadow-black/20">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                      {getIcon(res.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold truncate group-hover:text-primary transition-colors">{res.title}</h3>
                        {res.type === 'item' && res.metadata?.status && (
                          <Badge variant="secondary" className="text-[9px] h-4 px-1 rounded-sm bg-white/5 text-muted-foreground border-white/5">
                            {res.metadata.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{res.subtitle}</p>
                      
                      {/* Rich Metadata Section */}
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-medium">
                        {res.type === 'product' && res.metadata?.price !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-400 font-bold">السعر: {Number(res.metadata.price).toLocaleString()} ج.م</span>
                            {res.metadata.category && (
                              <>
                                <span className="text-white/10">•</span>
                                <span className="text-white/40">{res.metadata.category}</span>
                              </>
                            )}
                          </div>
                        )}
                        {(res.type === 'customer' || res.type === 'supplier') && res.metadata?.balance !== undefined && (
                          <span className={Number(res.metadata.balance) > 0 ? "text-red-400" : "text-emerald-400"}>
                            الرصيد: {Number(res.metadata.balance).toLocaleString()} ج.م
                          </span>
                        )}
                        {res.type === 'transaction' && res.metadata?.total && (
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400 font-black">المبلغ: {Number(res.metadata.total).toLocaleString()} ج.م</span>
                            <span className="text-white/10">•</span>
                            <span className="text-white/40">{res.metadata.method === 'Cash' ? 'كاش' : res.metadata.method === 'Debt' ? 'آجل' : res.metadata.method || ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] uppercase font-black text-white/40">
                        {getTypeLabel(res.type)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-bold">
                        {format(new Date(res.date), 'dd/MM/yyyy', { locale: ar })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : query || startDate || endDate ? (
          <div className="text-center py-20 opacity-50">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium">لا توجد نتائج مطابقة</p>
            <p className="text-sm">جرب كلمات بحث مختلفة أو وسع نطاق التاريخ</p>
          </div>
        ) : (
          <div className="text-center py-20 opacity-30">
            <p>اكتب شيئاً للبدء في البحث الشامل...</p>
          </div>
        )}
      </div>
    </div>
  );
}
