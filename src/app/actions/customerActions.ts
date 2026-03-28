"use server";

import { createClient } from '@/lib/supabase/server';
import { Customer } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export async function createCustomerAction(customer: Partial<Omit<Customer, 'id' | 'created_at'>>) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بإضافة عملاء");

  const { data, error } = await supabase
    .from('customers')
    .insert([customer as any])
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'CREATE_CUSTOMER' as any,
    entity_type: 'customers',
    entity_id: data.id,
    details: { name: customer.name } as any
  });

  revalidatePath('/customers');
  revalidatePath('/more');
  return data;
}

export async function updateCustomerAction(id: string, customer: Partial<Customer>) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بتعديل العملاء");

  const { data, error } = await supabase
    .from('customers')
    .update(customer as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'UPDATE_CUSTOMER' as any,
    entity_type: 'customers',
    entity_id: id,
    details: { updates: customer } as any
  });

  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  revalidatePath('/more');
  return data;
}

export async function deleteCustomerAction(id: string) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بحذف العملاء");

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
  const { data: customerData } = await supabase
    .from('customers')
    .select('balance')
    .eq('id', id)
    .single();

  if (customerData && Number(customerData.balance) > 0) {
    throw new Error('لا يمكن حذف العميل — لديه رصيد مستحق غير محصَّل');
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'DELETE_CUSTOMER' as any,
    entity_type: 'customers',
    entity_id: id,
    details: {} as any
  });

  revalidatePath('/customers');
  revalidatePath('/more');
  return { success: true };
}
