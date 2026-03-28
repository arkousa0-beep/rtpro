import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DebtSummary {
  total_customer_debt: number;
  customer_debtors_count: number;
  total_deferred_sales: number;
}

export interface CustomerDebt {
  id: string;
  name: string;
  phone: string | null;
  balance: number;
  created_at: string;
}

export interface DeferredSale {
  id: string;
  total: number;
  created_at: string;
  customer_id: string | null;
  customers: {
    name: string;
    balance: number;
    phone: string | null;
  } | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const debtService = {
  async getSummary(): Promise<DebtSummary> {
    const { data, error } = await supabase.rpc('get_debt_summary');
    if (error) throw error;
    const row = data?.[0];
    return {
      total_customer_debt: Number(row?.total_customer_debt ?? 0),
      customer_debtors_count: Number(row?.customer_debtors_count ?? 0),
      total_deferred_sales: Number(row?.total_deferred_sales ?? 0),
    };
  },

  async getCustomerDebts(): Promise<CustomerDebt[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, balance, created_at')
      .gt('balance', 0)
      .order('balance', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getDeferredSales(customerId?: string): Promise<DeferredSale[]> {
    let query = supabase
      .from('transactions')
      .select('id, total, created_at, customer_id, customers(name, balance, phone)')
      .eq('type', 'Sale')
      .eq('method', 'Debt')
      .order('created_at', { ascending: false });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as DeferredSale[];
  },

  async getTransactionDetails(transactionId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customers(name, phone),
        transaction_items(
          *,
          products(name, image_url)
        )
      `)
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Process customer debt payment atomically via DB RPC.
   * Uses FOR UPDATE locking — prevents race conditions.
   */
  async processPayment(customerId: string, amount: number) {
    const { data, error } = await supabase.rpc('pay_customer_debt', {
      p_customer_id: customerId,
      p_amount: amount,
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.message);

    return {
      success: true,
      newBalance: data.new_balance,
      transactionId: data.transaction_id,
    };
  },
};
