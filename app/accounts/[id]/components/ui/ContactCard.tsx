'use client'

import { ContactKapData } from '@/lib/types'
import { RELATIONSHIP_COLORS, OWNER_MAP } from '@/lib/constants'
import Badge from './Badge'

interface ContactCardProps extends ContactKapData {
  onClick?: () => void
  isSelected?: boolean
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const avatarColorByLevel: Record<string, string> = {
  CHAMPION: 'bg-success text-white',
  TRUST: 'bg-success text-white',
  RESPECT: 'bg-warning text-white',
  ACCEPTANCE: 'bg-warning text-white',
  ACKNOWLEDGE: 'bg-danger text-white',
}

export default function ContactCard({
  name,
  role,
  relationship_level,
  days_since_contact,
  priority,
  is_stale,
  campfire_owner,
  man_marking_owner,
  onClick,
  isSelected,
}: ContactCardProps) {
  const showPriorityBadge = priority === 'CRITICAL' || priority === 'HIGH'
  const badgeVariant = priority === 'CRITICAL' ? 'red' : 'amber'
  const avatarColor = avatarColorByLevel[relationship_level] ?? 'bg-text-dim text-white'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border rounded-card p-4 transition-all ${
        isSelected
          ? 'border-l-4 border-l-accent bg-accent-soft/30 border-accent/30'
          : is_stale
            ? 'border-l-4 border-l-danger border-border'
            : 'border-border hover:border-border/70'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor}`}>
          {getInitials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-text-primary truncate">{name}</p>
            {showPriorityBadge && <Badge label={priority} variant={badgeVariant} />}
          </div>
          <p className="text-xs text-text-secondary mt-0.5 truncate">{role}</p>
          <div className="flex items-center gap-3 mt-2">
            {days_since_contact != null && (
              <span className="text-meta">
                Last contact: <span className="font-mono font-medium text-text-secondary">{days_since_contact}d</span>
              </span>
            )}
            {(man_marking_owner || campfire_owner) && (
              <span className="text-meta truncate">
                {man_marking_owner || campfire_owner}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
