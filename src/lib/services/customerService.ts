import { createClient } from '@/lib/supabase/client';
import { Customer } from '@/lib/database.types';
import { logActivity } from './activityService';

export type { Customer };

const supabase = createClient();

export const customerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(customer: Partial<Omit<Customer, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select();

    if (error) throw error;

    if (data && data[0]) {
      try {
        await logActivity('CREATE_CUSTOMER', 'customers', data[0].id, { name: customer.name });
      } catch { /* لا نوقف العملية إذا فشل التسجيل */ }
    }

    return data;
  },

  async update(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (data && data[0]) {
      try {
        await logActivity('UPDATE_CUSTOMER', 'customers', id, updates);
      } catch { /* لا نوقف العملية إذا فشل التسجيل */ }
    }

    return data[0];
  },

  async delete(id: string) {
    // Check for linked sold items
    const { data: items } = await supabase
      .from('items')
      .select('barcode')
      .eq('customer_id', id)
      .eq('status', 'Sold')
      .limit(1);

    if (items && items.length > 0) {
      throw new Error('لا يمكن حذف العميل — لديه قطع مباعة مرتبطة به');
    }

    // Check for outstanding balance
    const { data: customer } = await supabase
      .from('customers')
      .select('balance')
      .eq('id', id)
      .single();

    if (customer && Number(customer.balance) > 0) {
      throw new Error('لا يمكن حذف العميل — لديه رصيد مستحق غير محصَّل');
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    try {
      await logActivity('DELETE_CUSTOMER', 'customers', id);
    } catch { /* لا نوقف العملية إذا فشل التسجيل */ }
  },
};
