import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { accountId, validated } = await request.json()
    if (!accountId) {
      return NextResponse.json({ error: 'accountId required' }, { status: 400 })
    }

    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase
        .from('accounts')
        .update({ why_validated_by_client: validated, updated_at: new Date().toISOString() })
        .eq('id', accountId)

      if (error) {
        console.error('[update-validation] Supabase error:', error.message)
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
