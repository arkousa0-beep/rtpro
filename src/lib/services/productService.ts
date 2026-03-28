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
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(product: Partial<Product>) {
    // Check if a soft-deleted product with the same name exists
    const { data: existingDeleted } = await supabase
      .from('products')
      .select('id, deleted_at')
      .eq('name', product.name)
      .not('deleted_at', 'is', null)
      .limit(1);

    if (existingDeleted && existingDeleted.length > 0) {
      // Auto-restore and update with new details
      const idToRestore = existingDeleted[0].id;
      const { data, error } = await supabase
        .from('products')
        .update({ ...product, deleted_at: null })
        .eq('id', idToRestore)
        .select('*, categories(name, icon)')
        .single();
      
      if (error) throw error;
      if (data) await logActivity('UPDATE_PRODUCT', 'products', data.id, { notes: 'Restored automatically on recreation', name: product.name });
      return data;
    }

    // Otherwise, create a new one
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
    // Check for linked In-Stock items — Soft Delete won't remove them
    const { data: linkedItems } = await supabase
      .from('items')
      .select('barcode')
      .eq('product_id', id)
      .eq('status', 'In-Stock')
      .limit(1);

    if (linkedItems && linkedItems.length > 0) {
      throw new Error('لا يمكن حذف المنتج — لديه قطع متاحة في المخزون. قم ببيعها أو نقلها أولاً');
    }

    // Soft delete: set deleted_at instead of hard delete
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await logActivity('DELETE_PRODUCT', 'products', id);
  },

  /** Restore a soft-deleted product */
  async restore(id: string) {
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
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
