import { supabase } from '@/lib/supabase';

export interface Customer {
  id?: string;
  name: string;
  phone?: string;
  address?: string;
  balance?: number;
}

export const customerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  },

  async create(customer: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select();
      
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};
