import { NextResponse } from 'next/server'
import { getMockAccountData } from '@/lib/mock-data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // For MVP, return mock data
  // In production, this would fetch from Supabase + HubSpot
  const data = getMockAccountData()

  return NextResponse.json(data)
}
