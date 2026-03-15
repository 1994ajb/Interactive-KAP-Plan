import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { url, key } = await request.json()
    if (!url || !key) {
      return NextResponse.json({ success: false, error: 'URL and key required' })
    }

    const client = createClient(url, key)
    const { error } = await client.from('accounts').select('id').limit(1)

    if (error) {
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Connection failed' })
  }
}
