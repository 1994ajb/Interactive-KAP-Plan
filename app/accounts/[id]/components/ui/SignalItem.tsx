'use client'

import { useState } from 'react'
import { Signal, Priority } from '@/lib/types'
import { SIGNAL_ICONS } from '@/lib/constants'

interface SignalItemProps {
  id: string
  type: Signal['type']
  priority: Signal['priority']
  title: string
  detail?: string | null
  source: string
  source_url?: string | null
  timestamp: string
  onDismiss?: (id: string) => void
}

const priorityBorderClass: Record<Priority, string> = {
  CRITICAL: 'signal-high',
  HIGH: 'signal-high',
  MEDIUM: 'signal-medium',
  LOW: 'signal-low',
}

export function relativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function SignalItem({ id, type, priority, title, detail, source, source_url, timestamp, onDismiss }: SignalItemProps) {
  const [dismissed, setDismissed] = useState(false)
  const icon = SIGNAL_ICONS[type] ?? '📌'

  if (dismissed) return null

  const handleDismiss = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDismissed(true)
    if (onDismiss) onDismiss(id)
    try {
      await fetch('/api/signals/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId: id }),
      })
    } catch {
      // silent — UI already updated
    }
  }

  const content = (
    <div className={`flex items-start gap-3 py-3 px-4 mb-3 rounded-card bg-white border border-border ${priorityBorderClass[priority]} hover:border-border/80 transition-colors group`}>
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary leading-snug">{title}</p>
        {detail && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">{detail}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="source-pill">{source}</span>
          <span className="text-meta">{relativeTime(timestamp)}</span>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-dim hover:text-text-primary flex-shrink-0 mt-0.5 p-1"
        title="Dismiss signal"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
    </div>
  )

  if (source_url) {
    return (
      <a href={source_url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}
