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
      .is('deleted_at', null)
      .order('name');

    if (error) throw error;
    return data;
  },
  async create(category: Partial<Omit<Category, 'id' | 'created_at'>>) {
    // Check if a soft-deleted category with the same name exists
    const { data: existingDeleted } = await supabase
      .from('categories')
      .select('id, deleted_at')
      .eq('name', category.name)
      .not('deleted_at', 'is', null)
      .limit(1);

    if (existingDeleted && existingDeleted.length > 0) {
      // Auto-restore and update with new details
      const idToRestore = existingDeleted[0].id;
      const { data, error } = await supabase
        .from('categories')
        .update({ ...category, deleted_at: null })
        .eq('id', idToRestore)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        await logActivity('UPDATE_CATEGORY', 'categories', idToRestore, { notes: 'Restored automatically on recreation', name: category.name });
      }
      return data;
    }

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
    // Check for linked active products first
    const { data: linked } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .is('deleted_at', null)
      .limit(1);

    if (linked && linked.length > 0) {
      throw new Error('لا يمكن حذف التصنيف — لديه منتجات نشطة مرتبطة به');
    }

    // Soft delete
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await logActivity('DELETE_CATEGORY', 'categories', id);
  },

  /** Restore a soft-deleted category */
  async restore(id: string) {
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
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
