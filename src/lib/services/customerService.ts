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
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  async create(customer: Partial<Omit<Customer, 'id' | 'created_at'>>) {
    // Check if a soft-deleted customer with the same name (and phone) exists
    let query = supabase
      .from('customers')
      .select('id, deleted_at')
      .eq('name', customer.name)
      .not('deleted_at', 'is', null);
      
    if (customer.phone) {
      query = query.eq('phone', customer.phone);
    } else {
      query = query.is('phone', null);
    }

    const { data: existingDeleted } = await query.limit(1);

    if (existingDeleted && existingDeleted.length > 0) {
      // Auto-restore and update with new details
      const idToRestore = existingDeleted[0].id;
      const { data, error } = await supabase
        .from('customers')
        .update({ ...customer, deleted_at: null })
        .eq('id', idToRestore)
        .select();

      if (error) throw error;
      if (data && data[0]) {
        try {
          await logActivity('UPDATE_CUSTOMER', 'customers', idToRestore, { notes: 'Restored automatically on recreation', name: customer.name });
        } catch { /* لا نوقف العملية */ }
      }
      return data;
    }

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
    // 1. Check for outstanding balance
    const { data: customer } = await supabase
      .from('customers')
      .select('balance')
      .eq('id', id)
      .single();

    if (customer && Number(customer.balance) > 0) {
      throw new Error('لا يمكن حذف العميل — لديه رصيد مستحق غير محصَّل');
    }

    // 2. Soft delete: mark as deleted (keeps all history intact)
    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    try {
      await logActivity('DELETE_CUSTOMER', 'customers', id);
    } catch { /* لا نوقف العملية إذا فشل التسجيل */ }
  },

  /** Restore a soft-deleted customer */
  async restore(id: string) {
    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
  },
};
