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

type LoadState = 'loading' | 'loaded' | 'error'

export default function AccountPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [data, setData] = useState<AccountData | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoadState('loading')
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/account/${params.id}`)
      if (!res.ok) {
        throw new Error(`Failed to load account data (${res.status})`)
      }
      const json = await res.json()
      setData(json)
      setLoadState('loaded')
    } catch (err) {
      console.error('[AccountPage] Fetch error:', err)
      setErrorMessage(
        err instanceof Error ? err.message : 'Connection error — retry'
      )
      setLoadState('error')
    }
  }, [params.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Loading state
  if (loadState === 'loading') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white rounded-xl border border-border px-8 py-6 shadow-sm">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-lg font-semibold text-text-primary">
                Loading Account Intelligence
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Connecting to data sources...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (loadState === 'error' || !data) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl border border-border px-8 py-8 shadow-sm max-w-md">
            <div className="text-4xl mb-4">&#9888;&#65039;</div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Connection Error
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {errorMessage || 'Unable to load account data. Check your connection and try again.'}
            </p>
            <button
              onClick={fetchData}
              className="bg-accent text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Retry
            </button>
          </div>
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
      />
      <TabNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && <Overview data={data} />}
        {activeTab === 'people' && (
          <People contacts={data.contacts} signals={data.signals} />
        )}
        {activeTab === 'pipeline' && <Pipeline deals={data.deals} contacts={data.contacts} />}
        {activeTab === 'intelligence' && (
          <Intelligence
            eosic={data.eosic}
            opportunities={data.opportunities}
            account={data.account}
          />
        )}
        {activeTab === 'action-plan' && (
          <ActionPlan account={data.account} manMarking={data.manMarking} />
        )}
        {activeTab === 'performance' && (
          <Performance
            deliveryMetrics={data.deliveryMetrics}
            campaignMetrics={data.campaignMetrics}
            integrationStatus={data.integrationStatus}
          />
        )}
        {activeTab === 'coach' && <Coach data={data} />}
      </main>
    </div>
  )
}
