import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../database.types";

/**
 * Administrative Supabase client using the SERVICE_ROLE_KEY.
 * Use ONLY in Server Actions or API routes for administrative tasks (like creating users).
 */
export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase Admin Environment Variables");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
