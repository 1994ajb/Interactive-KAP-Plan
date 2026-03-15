'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

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

type SortKey = 'name' | 'healthScore' | 'pipelineValue' | 'tier'

const TIER_COLORS: Record<string, string> = {
  RETENTION: 'bg-blue-100 text-blue-700',
  DEVELOPMENT: 'bg-green-100 text-green-700',
  ACQUISITION: 'bg-purple-100 text-purple-700',
  MAINTENANCE: 'bg-gray-100 text-gray-600',
}

const HEALTH_COLOR = (score: number) => {
  if (score >= 75) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-danger'
}

const HEALTH_RING_COLOR = (score: number) => {
  if (score >= 75) return 'stroke-success'
  if (score >= 50) return 'stroke-warning'
  return 'stroke-danger'
}

function HealthRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-border" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className={HEALTH_RING_COLOR(score)} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" className={`${HEALTH_COLOR(score)} text-xs font-mono font-bold`} transform={`rotate(90, ${size / 2}, ${size / 2})`} fill="currentColor">
        {score}
      </text>
    </svg>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function PortfolioHome() {
  const { user, signOut } = useAuth()
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then(data => { setAccounts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'name')
    }
  }

  const filtered = useMemo(() => {
    let list = accounts
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.tier.toLowerCase().includes(q))
    }
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'healthScore') cmp = a.healthScore - b.healthScore
      else if (sortKey === 'pipelineValue') cmp = a.pipelineValue - b.pipelineValue
      else if (sortKey === 'tier') cmp = a.tier.localeCompare(b.tier)
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [accounts, search, sortKey, sortAsc])

  const totalPipeline = accounts.reduce((s, a) => s + a.pipelineValue, 0)
  const avgHealth = accounts.length > 0 ? Math.round(accounts.reduce((s, a) => s + a.healthScore, 0) / accounts.length) : 0
  const totalSignals = accounts.reduce((s, a) => s + a.signalCount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-page">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="skeleton w-48 h-8 rounded mb-8" />
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card h-24" />)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton skeleton-card h-20" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Campfire KAP Intelligence</h1>
            <p className="text-meta mt-0.5">Key Account Portfolio</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search accounts..."
              className="bg-page border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-dim w-56 outline-none focus:border-accent transition-colors"
            />
            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-border">
                <span className="text-meta truncate max-w-[140px]">{user.email}</span>
                <button onClick={signOut} className="text-xs text-text-secondary hover:text-danger transition-colors">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-meta mb-1">Accounts</p>
            <p className="text-2xl font-mono font-semibold text-text-primary">{accounts.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-meta mb-1">Avg Health</p>
            <p className={`text-2xl font-mono font-semibold ${HEALTH_COLOR(avgHealth)}`}>{avgHealth}</p>
          </div>
          <div className="card text-center">
            <p className="text-meta mb-1">Total Pipeline</p>
            <p className="text-2xl font-mono font-semibold text-text-primary">{'\u00A3'}{totalPipeline.toLocaleString()}</p>
          </div>
          <div className="card text-center">
            <p className="text-meta mb-1">Active Signals</p>
            <p className={`text-2xl font-mono font-semibold ${totalSignals > 0 ? 'text-warning' : 'text-text-primary'}`}>{totalSignals}</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-meta">Sort:</span>
          {([['name', 'Name'], ['healthScore', 'Health'], ['pipelineValue', 'Pipeline'], ['tier', 'Tier']] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${sortKey === key ? 'bg-accent text-white' : 'bg-page text-text-secondary hover:bg-border'}`}
            >
              {label} {sortKey === key && (sortAsc ? '↑' : '↓')}
            </button>
          ))}
        </div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(account => (
            <Link key={account.id} href={`/accounts/${account.id}`} className="block">
              <div className="card-interactive p-5 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate">{account.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${TIER_COLORS[account.tier] || TIER_COLORS.MAINTENANCE}`}>
                      {account.tier}
                    </span>
                  </div>
                  <HealthRing score={account.healthScore} size={44} />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div>
                    <p className="text-meta">Contacts</p>
                    <p className="text-sm font-mono font-semibold text-text-primary">{account.contactCount}</p>
                  </div>
                  <div>
                    <p className="text-meta">Deals</p>
                    <p className="text-sm font-mono font-semibold text-text-primary">{account.activeDeals}</p>
                  </div>
                  <div>
                    <p className="text-meta">Pipeline</p>
                    <p className="text-sm font-mono font-semibold text-text-primary">{'\u00A3'}{(account.pipelineValue / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  {account.signalCount > 0 ? (
                    <span className="text-[11px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                      {account.signalCount} signal{account.signalCount !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-meta">No alerts</span>
                  )}
                  <span className="text-meta">{timeAgo(account.lastActivity)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-text-secondary">No accounts match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
