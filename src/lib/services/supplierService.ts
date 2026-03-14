import { supabase } from '@/lib/supabase';

export interface Supplier {
  id?: string;
  name: string;
  phone?: string;
  address?: string;
  balance?: number;
}

export const supplierService = {
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  },

  async create(supplier: Partial<Supplier>) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select();
      
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};
