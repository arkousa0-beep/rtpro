import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TransactionDetails {
  id: string;
  type: 'Sale' | 'Return' | 'Exchange' | 'Payment' | 'SupplierPayment';
  total: number;
  paid_amount: number;
  method: string;
  customer_id: string | null;
  supplier_id: string | null;
  created_at: string;
  customers?: {
    name: string;
    phone: string | null;
  } | null;
  suppliers?: {
    name: string;
    phone: string | null;
  } | null;
  items?: Array<{
    barcode: string;
    price: number;
    products: {
      name: string;
      image_url: string | null;
    };
  }>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const transactionService = {
  async getTransactionDetails(id: string): Promise<TransactionDetails | null> {
    // 1. Fetch transaction with relations
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .select(`
        *,
        customers(name, phone),
        suppliers(name, phone)
      `)
      .eq('id', id)
      .single();

    if (transError || !transaction) return null;

    // 2. Fetch items from transaction_items (historical price, not current)
    const { data: txItems, error: txItemsError } = await supabase
      .from('transaction_items')
      .select(`
        barcode,
        price,
        products(name, image_url)
      `)
      .eq('transaction_id', id);

    if (txItemsError) {
      console.error('Error fetching transaction_items:', txItemsError);
      return transaction as unknown as TransactionDetails;
    }

    return {
      ...transaction,
      items: (txItems ?? []) as unknown as TransactionDetails['items'],
    } as unknown as TransactionDetails;
  }
};
