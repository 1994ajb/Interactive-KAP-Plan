import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseBrowser: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient | null {
  if (_supabaseBrowser) return _supabaseBrowser

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars not set — browser client unavailable')
    return null
  }

  _supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return _supabaseBrowser
}

/** @deprecated Use getSupabaseBrowser() which returns null when env vars are missing */
export const supabaseBrowser = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseBrowser()
    if (!client) {
      throw new Error('Supabase browser client not available — env vars missing')
    }
    return (client as any)[prop]
  },
})
