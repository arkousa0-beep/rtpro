import { createClient } from '@/lib/supabase/client';
import { Item } from '@/lib/database.types';

export type { Item };
import { logActivity } from './activityService';

const supabase = createClient();

export const inventoryService = {
  async getAllItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*, products(*, categories(*))')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getProductItems(productId: string, filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    dateType?: 'Add' | 'Sale' | 'Return';
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('items')
      .select(`
        *,
        customers:customer_id(name),
        created_by_profile:created_by(full_name),
        sold_by_profile:sold_by(full_name),
        returned_by_profile:returned_by(full_name)
      `, { count: 'exact' })
      .eq('product_id', productId);

    if (filters.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`barcode.ilike.%${filters.search}%`);
    }

    if (filters.startDate) {
      const col = filters.dateType === 'Sale' ? 'sold_date' : 
                  filters.dateType === 'Return' ? 'return_date' : 'created_at';
      query = query.gte(col, filters.startDate);
    }

    if (filters.endDate) {
      const col = filters.dateType === 'Sale' ? 'sold_date' : 
                  filters.dateType === 'Return' ? 'return_date' : 'created_at';
      query = query.lte(col, filters.endDate);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (error) throw error;
    return { data, count };
  },

  async getItemDetails(barcode: string) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        products(*, categories(*)),
        customers(*),
        created_by_profile:created_by(full_name),
        sold_by_profile:sold_by(full_name),
        returned_by_profile:returned_by(full_name),
        history:item_history(*, created_by_profile:actor_id(full_name))
      `)
      .eq('barcode', barcode)
      .single();

    if (error) throw error;
    return data;
  },

  async insertItems(itemsToInsert: Partial<Item>[]) {
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Check for duplicate barcodes within the batch itself
    const barcodes = itemsToInsert.map(i => i.barcode).filter(Boolean) as string[];
    const uniqueBarcodes = new Set(barcodes);
    if (uniqueBarcodes.size !== barcodes.length) {
      const dupes = barcodes.filter((b, i) => barcodes.indexOf(b) !== i);
      throw new Error(`يوجد باركود مكرر في القائمة: ${[...new Set(dupes)].join(', ')}`);
    }

    // 2. Check if any barcode already exists in the database
    if (barcodes.length > 0) {
      const { data: existing } = await supabase
        .from('items')
        .select('barcode')
        .in('barcode', barcodes);

      if (existing && existing.length > 0) {
        const existingBarcodes = existing.map(e => e.barcode).join(', ');
        throw new Error(`الباركود التالي موجود بالفعل في المخزون: ${existingBarcodes}`);
      }
    }

    // 3. Insert items
    const items = itemsToInsert.map(item => ({
      ...item,
      created_by: item.created_by || user?.id
    }));
    
    const { error } = await supabase.from('items').insert(items);
    if (error) throw error;

    // Log Activity
    if (items.length > 0) {
      const barcode = items.length === 1 ? items[0].barcode : 'bulk';
      await logActivity(
        items.length === 1 ? 'CREATE_ITEM' : 'CREATE_ITEM', // Can refine later
        'items',
        barcode as string,
        { count: items.length, products: items.map(i => i.product_id) }
      );
    }
  }
};
