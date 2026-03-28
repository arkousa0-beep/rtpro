import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface TransactionDetails {
  id: string;
  type: 'Sale' | 'Return' | 'Exchange' | 'Payment' | 'SupplierPayment';
  total: number;
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
    selling_price: number;
    products: {
      name: string;
      image_url: string | null;
    }
  }>;
}

export const transactionService = {
  async getTransactionDetails(id: string): Promise<TransactionDetails | null> {
    // 1. Fetch transaction and customer/supplier info
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

    // 2. Fetch items linked to this transaction via item_history
    // In our schema, when a sale happens, we log in item_history with target_id = v_transaction_id
    const { data: history, error: historyError } = await supabase
      .from('item_history')
      .select(`
        item_barcode,
        items (
          barcode,
          selling_price,
          products (
            name,
            image_url
          )
        )
      `)
      .eq('target_id', id)
      .eq('action', 'Sold');

    if (historyError) {
      console.error('Error fetching items for transaction:', historyError);
      return transaction as TransactionDetails;
    }

    const items = history
      .map(h => h.items)
      .filter(item => item !== null) as any[];

    return {
      ...transaction,
      items
    } as TransactionDetails;
  }
};
