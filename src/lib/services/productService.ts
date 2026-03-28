import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/database.types';
import { logActivity } from './activityService';

export type { Product };

const supabase = createClient();

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, icon)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select('*, categories(name, icon)')
      .single();

    if (error) throw error;

    if (data) {
      await logActivity('CREATE_PRODUCT', 'products', data.id, { name: product.name });
    }

    return data;
  },

  async update(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select('*, categories(name, icon)')
      .single();

    if (error) throw error;
    await logActivity('UPDATE_PRODUCT', 'products', id, { updates: product });
    return data;
  },

  async delete(id: string) {
    // Check for linked items first to give a clear error message
    const { data: linkedItems } = await supabase
      .from('items')
      .select('barcode')
      .eq('product_id', id)
      .limit(1);

    if (linkedItems && linkedItems.length > 0) {
      throw new Error('لا يمكن حذف المنتج — لديه قطع مرتبطة في المخزون');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await logActivity('DELETE_PRODUCT', 'products', id);
  },

  async getInventoryStats() {
    const { data, error } = await supabase.rpc('get_inventory_stats');
    if (error) throw error;
    return data[0] as {
      total_items: number;
      low_stock_count: number;
      total_cost_value: number;
      total_selling_value: number;
    };
  }
};
