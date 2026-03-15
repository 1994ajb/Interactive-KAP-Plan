import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars not set — client unavailable')
    return null
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

/** @deprecated Use getSupabase() which returns null when env vars are missing */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase()
    if (!client) {
      throw new Error('Supabase client not available — env vars missing')
    }
    return (client as any)[prop]
  },
})
