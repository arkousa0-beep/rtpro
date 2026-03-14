import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/database.types';

export const inventoryService = {
  async getAllItems() {
    const { data, error } = await supabase
      .from('items')
      .select(`
        barcode,
        status,
        selling_price,
        products (
          id,
          name,
          category_id,
          categories:category_id(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as Item[];
  },

  async insertItems(itemsToInsert: Partial<Item>[]) {
    const { error } = await supabase.from('items').insert(itemsToInsert);
    if (error) throw error;
  }
};
