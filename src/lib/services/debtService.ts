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

export type DeferredSaleStatus = 'pending' | 'partial' | 'paid';

export interface DeferredSale {
  id: string;
  total: number;
  paid_amount: number;
  created_at: string;
  customer_id: string | null;
  status: DeferredSaleStatus;
  customers: {
    name: string;
    balance: number;
    phone: string | null;
  } | null;
}

const PAGE_SIZE = 50;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveSaleStatus(total: number, paidAmount: number): DeferredSaleStatus {
  if (paidAmount <= 0)        return 'pending';
  if (paidAmount >= total)    return 'paid';
  return 'partial';
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const debtService = {
  async getSummary(): Promise<DebtSummary> {
    const { data, error } = await supabase.rpc('get_debt_summary');
    if (error) throw error;
    const row = data?.[0];
    return {
      total_customer_debt:    Number(row?.total_customer_debt    ?? 0),
      customer_debtors_count: Number(row?.customer_debtors_count ?? 0),
      total_deferred_sales:   Number(row?.total_deferred_sales   ?? 0),
    };
  },

  async getCustomerDebts(): Promise<CustomerDebt[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, balance, created_at')
      .is('deleted_at', null)
      .gt('balance', 0)
      .order('balance', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getDeferredSales(customerId?: string, page = 1): Promise<{
    data: DeferredSale[];
    hasMore: boolean;
    total: number;
  }> {
    const from = (page - 1) * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let query = supabase
      .from('transactions')
      .select('id, total, paid_amount, created_at, customer_id, customers(name, balance, phone)', { count: 'exact' })
      .eq('type', 'Sale')
      .eq('method', 'Debt')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const rows = (data ?? []).map((d: any) => ({
      ...d,
      status: resolveSaleStatus(Number(d.total), Number(d.paid_amount ?? 0)),
      customers: d.customers ?? null,
    })) as DeferredSale[];

    return {
      data:    rows,
      hasMore: (count ?? 0) > to + 1,
      total:   count ?? 0,
    };
  },

  async getTransactionDetails(transactionId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        type,
        total,
        paid_amount,
        method,
        created_at,
        customers(name, phone),
        transaction_items(
          id,
          barcode,
          price,
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
   * FOR UPDATE locking in DB — prevents race conditions.
   */
  async processPayment(customerId: string, amount: number, paymentMethod: 'Cash' | 'Card' | 'Transfer' = 'Cash') {
    // The safe RPC (p_customer_id, p_amount) — no payment method parameter
    // We log it separately via activity after the RPC
    const { data, error } = await supabase.rpc('pay_customer_debt', {
      p_customer_id: customerId,
      p_amount:      amount,
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.message);

    // Update transaction to record the actual payment method used
    if (data?.transaction_id && paymentMethod !== 'Cash') {
      await supabase
        .from('transactions')
        .update({ method: paymentMethod })
        .eq('id', data.transaction_id);
    }

    return {
      success:       true,
      newBalance:    data.new_balance,
      transactionId: data.transaction_id,
    };
  },
};
