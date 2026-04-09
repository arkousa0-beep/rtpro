import { supabase } from '@/lib/supabase/client';

export interface ReturnRecord {
  id: string;
  transaction_id: string;
  customer_id: string | null;
  customer_name: string | null;
  reason: string;
  refund_method: 'Cash' | 'Balance';
  total_amount: number;
  items_count: number;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  items: ReturnItem[];
}

export interface ReturnItem {
  id: string;
  barcode: string;
  product_name: string;
  price: number;
  sold_date: string | null;
  item_status: string;
}

export async function getReturns(page: number = 1, limit: number = 20): Promise<{ returns: ReturnRecord[]; total: number }> {
  const offset = (page - 1) * limit;
  
  const { count } = await supabase
    .from('returns')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      items:return_items(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { returns: (data || []) as ReturnRecord[], total: count || 0 };
}

export async function getReturnDetails(returnId: string): Promise<ReturnRecord | null> {
  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      items:return_items(*)
    `)
    .eq('id', returnId)
    .single();

  if (error) throw error;
  return data as ReturnRecord;
}

export async function getReturnHistoryByTransaction(transactionId: string): Promise<ReturnRecord[]> {
  const { data, error } = await supabase
    .from('returns')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ReturnRecord[];
}

export async function getItemReturnHistory(barcode: string): Promise<ReturnRecord[]> {
  const { data, error } = await supabase
    .from('return_items')
    .select(`
      returns(*)
    `)
    .eq('barcode', barcode)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((d: any) => d.returns) as ReturnRecord[];
}
