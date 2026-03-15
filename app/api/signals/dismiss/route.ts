import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { signalId } = await request.json()
    if (!signalId) {
      return NextResponse.json({ error: 'signalId is required' }, { status: 400 })
    }

    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase
        .from('signals')
        .update({ dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', signalId)

      if (error) {
        console.error('[signals/dismiss] Supabase error:', error.message)
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to dismiss signal' }, { status: 500 })
  }
}
