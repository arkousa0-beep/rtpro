"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Profile, ProfilePermissions } from "@/lib/database.types";


export async function createEmployeeAction(formData: {
  fullName: string;
  email: string;
  password: string;
  role: "Employee" | "Manager";
}) {
  const supabase = createAdminClient();

  // 1. Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      full_name: formData.fullName,
    },
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return { success: false, error: authError.message };
  }

  // 2. Create profile in Public
  const defaultPermissions: ProfilePermissions = {
    pos: true,
    inventory: formData.role === "Manager",
    finance: formData.role === "Manager",
    staff: formData.role === "Manager",
    customers: true,
    suppliers: formData.role === "Manager",
    transactions: true,
  };

  const { error: profileError } = await (supabase as any).from("profiles").insert({
    id: authData.user.id,
    full_name: formData.fullName,
    role: formData.role,
    permissions: defaultPermissions,
  });


  if (profileError) {
    console.error("Profile Error:", profileError);
    // Cleanup: try to remove auth user if profile creation fails?
    // In a real system, you might want more robust error handling
    return { success: false, error: "Failed to create profile" };
  }

  revalidatePath("/manage/employees");
  return { success: true };
}

export async function deleteEmployeeAction(userId: string) {
  const supabase = createAdminClient();

  // 1. Delete from Auth (this usually triggers cascading delete if set up, 
  // but let's be explicit if needed or just handle Auth)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/manage/employees");
  return { success: true };
}

export async function updateEmployeeRoleAction(userId: string, role: "Employee" | "Manager") {
  const supabase = createAdminClient();

  const { error } = await (supabase as any)
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/manage/employees");
  return { success: true };
}

export async function getAllEmployees(): Promise<Profile[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Profile[];
}

export async function updateEmployeePermissionsAction(userId: string, permissions: ProfilePermissions) {
  const supabase = createAdminClient();

  const { error } = await (supabase as any)
    .from("profiles")
    .update({ permissions })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/manage/employees");
  return { success: true };
}
