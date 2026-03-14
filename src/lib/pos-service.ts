import { supabase } from '@/lib/supabase';
import { validateBarcodes } from './barcode-utils';

export const POSService = {
  async fetchItemByBarcode(barcode: string) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        barcode,
        selling_price,
        status,
        products (name)
      `)
      .eq('barcode', barcode)
      .eq('status', 'In-Stock')
      .single();

    if (error || !data) {
      throw new Error('القطعة غير موجودة أو تم بيعها مسبقاً');
    }
    return data;
  },

  async processSale(cart: { barcode: string }[], total: number, paymentMethod: string, customerId: string | null) {
    const invalidBarcodes = validateBarcodes(cart.map(item => item.barcode));

    if (invalidBarcodes.length > 0) {
      throw new Error('Invalid barcode format detected');
    }

    if (total <= 0 || isNaN(total)) {
      throw new Error('Invalid total amount');
    }

    const { data, error } = await supabase.rpc('process_sale', {
      p_items_list: cart.map(i => i.barcode),
      p_total_amount: total,
      p_payment_method: paymentMethod,
      p_customer_id: customerId === 'walkin' ? null : customerId
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.message);

    return data;
  }
};
