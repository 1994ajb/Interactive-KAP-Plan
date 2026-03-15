import { NextResponse } from 'next/server'

interface AccountSummary {
  id: string
  name: string
  tier: string
  healthScore: number
  contactCount: number
  activeDeals: number
  pipelineValue: number
  signalCount: number
  lastActivity: string
}

const MOCK_ACCOUNTS: AccountSummary[] = [
  {
    id: 'vaseline-uk',
    name: 'Vaseline UK',
    tier: 'RETENTION',
    healthScore: 62,
    contactCount: 10,
    activeDeals: 5,
    pipelineValue: 85000,
    signalCount: 3,
    lastActivity: '2025-03-14T10:30:00Z',
  },
  {
    id: 'hellmanns-global',
    name: "Hellmann's Global",
    tier: 'DEVELOPMENT',
    healthScore: 78,
    contactCount: 7,
    activeDeals: 3,
    pipelineValue: 220000,
    signalCount: 1,
    lastActivity: '2025-03-13T16:45:00Z',
  },
  {
    id: 'magnum-eu',
    name: 'Magnum EU',
    tier: 'ACQUISITION',
    healthScore: 45,
    contactCount: 4,
    activeDeals: 2,
    pipelineValue: 150000,
    signalCount: 5,
    lastActivity: '2025-03-12T09:00:00Z',
  },
  {
    id: 'dove-uk',
    name: 'Dove UK',
    tier: 'RETENTION',
    healthScore: 85,
    contactCount: 8,
    activeDeals: 4,
    pipelineValue: 175000,
    signalCount: 0,
    lastActivity: '2025-03-14T14:20:00Z',
  },
  {
    id: 'lynx-uk',
    name: 'Lynx UK',
    tier: 'MAINTENANCE',
    healthScore: 71,
    contactCount: 5,
    activeDeals: 1,
    pipelineValue: 40000,
    signalCount: 2,
    lastActivity: '2025-03-11T11:15:00Z',
  },
]

export async function GET() {
  // Try Supabase first
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name')

    if (!error && accounts && accounts.length > 0) {
      const summaries: AccountSummary[] = accounts.map(a => ({
        id: a.id,
        name: a.name,
        tier: a.tier || 'MAINTENANCE',
        healthScore: 0,
        contactCount: 0,
        activeDeals: 0,
        pipelineValue: 0,
        signalCount: 0,
        lastActivity: a.updated_at || a.created_at || new Date().toISOString(),
      }))

      // Merge with mock if vaseline-uk exists
      const mockMap = new Map(MOCK_ACCOUNTS.map(m => [m.id, m]))
      for (const s of summaries) {
        const mock = mockMap.get(s.id)
        if (mock) {
          s.healthScore = mock.healthScore
          s.contactCount = mock.contactCount
          s.activeDeals = mock.activeDeals
          s.pipelineValue = mock.pipelineValue
          s.signalCount = mock.signalCount
        }
      }

      return NextResponse.json(summaries)
    }
  } catch {
    // Supabase not configured — fall through to mock
  }

  return NextResponse.json(MOCK_ACCOUNTS)
}
