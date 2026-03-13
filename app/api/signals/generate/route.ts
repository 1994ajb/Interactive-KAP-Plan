import { NextResponse } from 'next/server'
import { getMockAccountData } from '@/lib/mock-data'

export async function POST() {
  // Phase 2: Generate signals from all integration sources
  // Will scan HubSpot for engagement gaps, check Clay for org changes,
  // monitor Slack for mentions, check Asana for delivery slips
  const data = getMockAccountData()

  // For now, return existing signals from mock data
  return NextResponse.json({
    signals: data.signals,
    generated_at: new Date().toISOString(),
    sources_checked: ['HubSpot', 'Mock Data'],
    sources_unavailable: ['Clay', 'Gmail', 'Slack', 'Asana', 'Google Calendar'],
  })
}
