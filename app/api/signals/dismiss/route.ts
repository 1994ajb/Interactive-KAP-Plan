import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { signalId } = await request.json()
    if (!signalId) {
      return NextResponse.json({ error: 'signalId is required' }, { status: 400 })
    }

    // Try to update Supabase if configured
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase
        .from('signals')
        .update({ dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', signalId)
    } catch {
      // Supabase not configured — dismiss is UI-only
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to dismiss signal' }, { status: 500 })
  }
}
