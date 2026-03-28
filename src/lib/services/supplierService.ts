import { createClient } from '@/lib/supabase/client';
import { Supplier } from '@/lib/database.types';
import { logActivity } from './activityService';

export type { Supplier };

const supabase = createClient();

export const supplierService = {
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  async create(supplier: Partial<Omit<Supplier, 'id' | 'created_at'>>) {
    // Check if a soft-deleted supplier with the same name exists
    const { data: existingDeleted } = await supabase
      .from('suppliers')
      .select('id, deleted_at')
      .eq('name', supplier.name)
      .not('deleted_at', 'is', null)
      .limit(1);

    if (existingDeleted && existingDeleted.length > 0) {
      // Auto-restore and update with new details
      const idToRestore = existingDeleted[0].id;
      const { data, error } = await supabase
        .from('suppliers')
        .update({ ...supplier, deleted_at: null })
        .eq('id', idToRestore)
        .select();

      if (error) throw error;
      if (data && data[0]) {
        try {
          await logActivity('UPDATE_SUPPLIER', 'suppliers', idToRestore, { notes: 'Restored automatically on recreation', name: supplier.name });
        } catch { /* لا نوقف العملية */ }
      }
      return data;
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select();

    if (error) throw error;

    if (data && data[0]) {
      try {
        await logActivity('CREATE_SUPPLIER', 'suppliers', data[0].id, { name: supplier.name });
      } catch { /* لا نوقف العملية إذا فشل التسجيل */ }
    }

    return data;
  },

  async update(id: string, updates: Partial<Supplier>) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (data && data[0]) {
      try {
        await logActivity('UPDATE_SUPPLIER', 'suppliers', id, { ...updates });
      } catch { /* لا نوقف العملية إذا فشل التسجيل */ }
    }

    return data;
  },

  async delete(id: string) {
    // 1. Check for outstanding balance
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('balance')
      .eq('id', id)
      .single();

    if (supplier && Number(supplier.balance) > 0) {
      throw new Error('لا يمكن حذف المورد — لديه رصيد مستحق غير مسدَّد');
    }

    // 2. Soft delete
    const { error } = await supabase
      .from('suppliers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    try {
      await logActivity('DELETE_SUPPLIER', 'suppliers', id);
    } catch { /* لا نوقف العملية إذا فشل التسجيل */ }
  },

  /** Restore a soft-deleted supplier */
  async restore(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
  },

  async getTransactions(supplierId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProducts(supplierId: string) {
    const { data, error } = await supabase
      .from('items')
      .select('*, products(*, categories(*))')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /** Atomic supplier debt payment via DB RPC (with FOR UPDATE locking) */
  async recordPayment(supplierId: string, amount: number, method: 'Cash' | 'Card' | 'Transfer') {
    const { data, error } = await supabase.rpc('pay_supplier_debt', {
      p_supplier_id: supplierId,
      p_amount: amount,
      p_payment_method: method
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.message);

    await logActivity('SUPPLIER_PAYMENT', 'suppliers', supplierId, {
      amount,
      method,
      transaction_id: data.transaction_id
    });

    return data;
  }
};
