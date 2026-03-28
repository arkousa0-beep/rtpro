"use server";

import { createClient } from '@/lib/supabase/server';
import { Supplier } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export async function createSupplierAction(supplier: Partial<Omit<Supplier, 'id' | 'created_at'>>) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بإضافة موردين");

  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplier as any])
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'CREATE_SUPPLIER' as any,
    entity_type: 'suppliers',
    entity_id: data.id,
    details: { name: supplier.name } as any
  });

  revalidatePath('/suppliers');
  revalidatePath('/more');
  return data;
}

export async function updateSupplierAction(id: string, supplier: Partial<Supplier>) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بتعديل الموردين");

  const { data, error } = await supabase
    .from('suppliers')
    .update(supplier as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'UPDATE_SUPPLIER' as any,
    entity_type: 'suppliers',
    entity_id: id,
    details: { updates: supplier } as any
  });

  revalidatePath('/suppliers');
  revalidatePath(`/suppliers/${id}`);
  revalidatePath('/more');
  return data;
}

export async function deleteSupplierAction(id: string) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بحذف الموردين");

  // Check for linked items
  const { data: items } = await supabase
    .from('items')
    .select('barcode')
    .eq('supplier_id', id)
    .limit(1);

  if (items && items.length > 0) {
    throw new Error('لا يمكن حذف المورد — لديه قطع مخزنة أو مباعة مرتبطة به');
  }

  // Check for outstanding balance
  const { data: supplierData } = await supabase
    .from('suppliers')
    .select('balance')
    .eq('id', id)
    .single();

  if (supplierData && Number(supplierData.balance) > 0) {
    throw new Error('لا يمكن حذف المورد — لديه رصيد مستحق لم يُسدد');
  }

  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'DELETE_SUPPLIER' as any,
    entity_type: 'suppliers',
    entity_id: id,
    details: {} as any
  });

  revalidatePath('/suppliers');
  revalidatePath('/more');
  return { success: true };
}
