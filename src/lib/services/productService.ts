import { supabase } from '@/lib/supabase';

export interface Product {
  id?: string;
  name: string;
  category_id?: string | null;
  categories?: { name: string };
}

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('name');
      
    if (error) throw error;
    return data;
  },

  async create(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
      
    if (error) throw error;
    return data;
  },

  async update(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};
