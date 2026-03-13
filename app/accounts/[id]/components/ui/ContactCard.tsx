'use client'

import { ContactKapData } from '@/lib/types'
import Badge from './Badge'

interface ContactCardProps extends ContactKapData {
  onClick?: () => void
}

export default function ContactCard({
  name,
  role,
  days_since_contact,
  priority,
  is_stale,
  onClick,
}: ContactCardProps) {
  const showPriorityBadge = priority === 'CRITICAL' || priority === 'HIGH'
  const badgeVariant = priority === 'CRITICAL' ? 'red' : 'amber'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-card border border-border rounded-card p-4 transition-shadow hover:shadow-md ${
        is_stale ? 'border-l-4 border-l-danger' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-text-primary truncate">{name}</p>
          <p className="text-xs text-text-secondary mt-0.5 truncate">{role}</p>
        </div>
        {showPriorityBadge && <Badge label={priority} variant={badgeVariant} />}
      </div>
      {days_since_contact != null && (
        <p className="text-xs text-text-dim mt-2">
          Last contact: <span className="font-mono font-medium text-text-secondary">{days_since_contact}d</span> ago
        </p>
      )}
    </button>
  )
}
