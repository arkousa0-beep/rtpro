import { supabase } from "@/lib/supabase/client";
import { sanitizeLikePattern } from "@/lib/utils";

export type SearchEntityType = 'product' | 'item' | 'customer' | 'supplier' | 'transaction';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: SearchEntityType;
  date: string;
  link: string;
  metadata?: any;
}

export interface SearchFilters {
  query: string;
  startDate?: string;
  endDate?: string;
  entities?: SearchEntityType[];
  limitPerEntity?: number;
}

export const searchService = {
  async universalSearch(filters: SearchFilters): Promise<SearchResult[]> {
    const { query, startDate, endDate, entities = ['product', 'item', 'customer', 'supplier', 'transaction'], limitPerEntity = 10 } = filters;
    
    if (!query && !startDate && !endDate) return [];

    const sanitizedQuery = sanitizeLikePattern(query);
    const results: SearchResult[] = [];
    const promises: Promise<any>[] = [];

    // --- 1. Products ---
    if (entities.includes('product')) {
      const fetchProducts = async () => {
        let q = supabase.from('products').select('id, name, price, created_at, categories(name)').ilike('name', `%${sanitizedQuery}%`).is('deleted_at', null).limit(limitPerEntity);
        if (startDate) q = q.gte('created_at', startDate);
        if (endDate) q = q.lte('created_at', endDate);
        const { data } = await q;
        return (data || []).map(p => {
          const categoryName = Array.isArray(p.categories) 
            ? p.categories[0]?.name 
            : (p.categories as any)?.name;
            
          return {
            id: p.id,
            title: p.name,
            subtitle: categoryName || 'بدون تصنيف',
            type: 'product' as const,
            date: p.created_at,
            link: `/products?search=${p.id}`,
            metadata: { price: p.price, category: categoryName }
          };
        });
      };
      promises.push(fetchProducts());
    }

    // --- 2. Items (Serials) ---
    if (entities.includes('item')) {
      const fetchItems = async () => {
        let q = supabase.from('items').select('barcode, created_at, status, products(name)').ilike('barcode', `%${sanitizedQuery}%`).limit(limitPerEntity);
        if (startDate) q = q.gte('created_at', startDate);
        if (endDate) q = q.lte('created_at', endDate);
        const { data } = await q;
        return (data || []).map(i => ({
          id: i.barcode,
          title: `سيريال: ${i.barcode}`,
          subtitle: `المنتج: ${Array.isArray(i.products) ? i.products[0]?.name : (i.products as any)?.name || 'غير معروف'}`,
          type: 'item' as const,
          date: i.created_at,
          link: `/inventory?search=${i.barcode}`,
          metadata: { status: i.status }
        }));
      };
      promises.push(fetchItems());
    }

    // --- 3. Customers ---
    if (entities.includes('customer')) {
      const fetchCustomers = async () => {
        let q = supabase.from('customers').select('id, name, phone, balance, created_at').or(`name.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%`).is('deleted_at', null).limit(limitPerEntity);
        if (startDate) q = q.gte('created_at', startDate);
        if (endDate) q = q.lte('created_at', endDate);
        const { data } = await q;
        return (data || []).map(c => ({
          id: c.id,
          title: c.name,
          subtitle: c.phone || 'بدون هاتف',
          type: 'customer' as const,
          date: c.created_at,
          link: `/customers?search=${c.id}`,
          metadata: { balance: c.balance }
        }));
      };
      promises.push(fetchCustomers());
    }

    // --- 4. Suppliers ---
    if (entities.includes('supplier')) {
      const fetchSuppliers = async () => {
        let q = supabase.from('suppliers').select('id, name, phone, balance, created_at').or(`name.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%`).is('deleted_at', null).limit(limitPerEntity);
        if (startDate) q = q.gte('created_at', startDate);
        if (endDate) q = q.lte('created_at', endDate);
        const { data } = await q;
        return (data || []).map(s => ({
          id: s.id,
          title: s.name,
          subtitle: s.phone || 'بدون هاتف',
          type: 'supplier' as const,
          date: s.created_at,
          link: `/suppliers?search=${s.id}`,
          metadata: { balance: s.balance }
        }));
      };
      promises.push(fetchSuppliers());
    }

    // --- 5. Transactions ---
    if (entities.includes('transaction')) {
      const fetchTransactions = async () => {
        let q = supabase.from('transactions').select('id, type, method, total, created_at, customers(name)').or(`type.ilike.%${sanitizedQuery}%,method.ilike.%${sanitizedQuery}%`).limit(limitPerEntity);
        
        if (query.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            q = supabase.from('transactions').select('id, type, method, total, created_at, customers(name)').eq('id', query).limit(limitPerEntity);
        }

        if (startDate) q = q.gte('created_at', startDate);
        if (endDate) q = q.lte('created_at', endDate);
        
        const { data } = await q;
        return (data || []).map(t => ({
          id: t.id,
          title: `عملية ${t.type} #${t.id.slice(0, 8)}`,
          subtitle: `العميل: ${(t.customers as any)?.name || 'نقدي'}`,
          type: 'transaction' as const,
          date: t.created_at,
          link: `/transactions?id=${t.id}`,
          metadata: { total: t.total, method: t.method }
        }));
      };
      promises.push(fetchTransactions());
    }

    const allResults = await Promise.all(promises);
    return allResults.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};
