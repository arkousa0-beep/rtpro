import { createClient } from '@/lib/supabase/client';
import { Category } from '@/lib/database.types';
import { logActivity } from './activityService';

export type { Category };

const supabase = createClient();

export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async create(category: Partial<Omit<Category, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      await logActivity('CREATE_CATEGORY', 'categories', data.id, { name: category.name });
    }

    return data;
  },

  async update(id: string, category: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await logActivity('UPDATE_CATEGORY', 'categories', id, { updates: category });
    return data;
  },

  async delete(id: string) {
    // Check for linked products first
    const { data: linked } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (linked && linked.length > 0) {
      throw new Error('لا يمكن حذف التصنيف — لديه منتجات مرتبطة به');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await logActivity('DELETE_CATEGORY', 'categories', id);
  },

  async getProducts(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', id);

    if (error) throw error;
    return data;
  }
};
