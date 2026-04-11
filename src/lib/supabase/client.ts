import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

export function createClient() {
  if (client) return client

    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'rtpro-auth-token',
          flowType: 'pkce',
        },
        global: {
          headers: {
            'x-rtpro-version': '1.1.0',
          },
        },
      }
    )

  return client
}

export const supabase = createClient()
