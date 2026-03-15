'use client'

import { useState, useEffect, useCallback } from 'react'
import { AccountData } from '@/lib/types'
import { TabId } from '@/lib/constants'
import Header from './components/Header'
import TabNav from './components/TabNav'
import Overview from './components/Overview'
import People from './components/Relationships'
import Pipeline from './components/Pipeline'
import Intelligence from './components/Intelligence'
import ActionPlan from './components/ActionPlan'
import Performance from './components/Deliverables'
import Coach from './components/Coach'
import CommandPalette from './components/CommandPalette'

type LoadState = 'loading' | 'loaded' | 'error'

// Skeleton loader component
function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-page">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-5 rounded" />
            <div className="skeleton w-32 h-6 rounded" />
            <div className="skeleton w-20 h-5 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <div className="skeleton w-8 h-8 skeleton-circle" />
            <div className="flex gap-1">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton w-2 h-2 skeleton-circle" />)}</div>
          </div>
        </div>
      </div>
      {/* Tab skeleton */}
      <div className="sticky top-[52px] z-40 bg-white border-b border-border px-6">
        <div className="flex gap-4 py-3">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton w-16 h-5 rounded" />)}</div>
      </div>
      {/* Content skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="skeleton skeleton-card h-48" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton skeleton-card h-20" />)}
            </div>
          </div>
          <div className="skeleton skeleton-card h-96" />
        </div>
      </main>
    </div>
  )
}

export default function AccountPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [data, setData] = useState<AccountData | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastFetchedAt, setLastFetchedAt] = useState<string | undefined>()
  const [paletteOpen, setPaletteOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoadState('loading')
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/account/${params.id}`)
      if (!res.ok) throw new Error(`Failed to load account data (${res.status})`)
      const json = await res.json()
      setData(json)
      setLastFetchedAt(json.lastFetchedAt || new Date().toISOString())
      setLoadState('loaded')
    } catch (err) {
      console.error('[AccountPage] Fetch error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Connection error — retry')
      setLoadState('error')
    }
  }, [params.id])

  useEffect(() => { fetchData() }, [fetchData])

  // Cmd+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Compute notification dots
  const getNotifications = (): Record<string, 'red' | 'amber' | null> => {
    if (!data) return {}
    const notifications: Record<string, 'red' | 'amber' | null> = {}

    // Overview: red if undismissed HIGH signals
    const highSignals = data.signals.filter(s => !s.dismissed && (s.priority === 'HIGH' || s.priority === 'CRITICAL'))
    if (highSignals.length > 0) notifications['overview'] = 'red'

    // People: red if CRITICAL contact past staleness
    const staleContacts = data.contacts.filter(c => c.is_stale && (c.priority === 'CRITICAL' || c.priority === 'HIGH'))
    if (staleContacts.length > 0) notifications['people'] = 'red'

    // Pipeline: amber if any deal <50% confidence
    const lowConfidence = data.deals.filter(d => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost' && (d.confidence_score ?? 0) < 50)
    if (lowConfidence.length > 0) notifications['pipeline'] = 'amber'

    return notifications
  }

  const handleHealthClick = () => {
    setActiveTab('overview')
    setTimeout(() => {
      document.getElementById('health-score-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handlePaletteSelect = (type: string, item: { name: string; id?: string }) => {
    setPaletteOpen(false)
    if (type === 'contact') {
      setActiveTab('people')
    } else if (type === 'deal') {
      setActiveTab('pipeline')
    } else if (type === 'signal') {
      setActiveTab('overview')
    }
  }

  if (loadState === 'loading') return <SkeletonLoader />

  if (loadState === 'error' || !data) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-3xl mb-4">⚠</div>
          <h2 className="text-section-header text-text-primary mb-2">Connection Error</h2>
          <p className="text-sm text-text-secondary mb-6">{errorMessage || 'Unable to load account data.'}</p>
          <button onClick={fetchData} className="bg-accent text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      <Header
        accountName={data.account.name}
        tier={data.account.tier}
        healthScore={data.healthScore}
        integrationStatus={data.integrationStatus}
        lastFetchedAt={lastFetchedAt}
        onHealthClick={handleHealthClick}
      />
      <TabNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabId)}
        notifications={getNotifications()}
      />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && <Overview data={data} />}
        {activeTab === 'people' && (
          <People
            contacts={data.contacts}
            signals={data.signals}
            accountName={data.account.name}
            accountTier={data.account.tier}
            accountObjectiveRetention={data.account.objective_retention}
            accountObjectiveDevelopment={data.account.objective_development}
          />
        )}
        {activeTab === 'pipeline' && <Pipeline deals={data.deals} contacts={data.contacts} />}
        {activeTab === 'intelligence' && (
          <Intelligence
            eosic={data.eosic}
            opportunities={data.opportunities}
            account={data.account}
            crossBrandContacts={data.crossBrandContacts}
          />
        )}
        {activeTab === 'action-plan' && (
          <ActionPlan
            account={data.account}
            manMarking={data.manMarking}
            contacts={data.contacts}
            onNavigateToContact={(name) => {
              setActiveTab('people')
            }}
          />
        )}
        {activeTab === 'performance' && (
          <Performance
            deliveryMetrics={data.deliveryMetrics}
            campaignMetrics={data.campaignMetrics}
            integrationStatus={data.integrationStatus}
            deals={data.deals}
          />
        )}
        {activeTab === 'coach' && <Coach data={data} />}
      </main>

      {/* Command Palette */}
      {paletteOpen && data && (
        <CommandPalette
          contacts={data.contacts}
          deals={data.deals}
          signals={data.signals}
          onSelect={handlePaletteSelect}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </div>
  )
}
