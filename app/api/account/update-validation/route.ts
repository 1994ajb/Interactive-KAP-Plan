import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accountId, validated } = await request.json()
    if (!accountId) {
      return NextResponse.json({ error: 'accountId required' }, { status: 400 })
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase
        .from('accounts')
        .update({ why_validated_by_client: validated, updated_at: new Date().toISOString() })
        .eq('id', accountId)
    } catch {
      // Supabase not configured
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
