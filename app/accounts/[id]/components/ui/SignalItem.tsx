import { Signal, Priority } from '@/lib/types'
import { SIGNAL_ICONS } from '@/lib/constants'

interface SignalItemProps {
  type: Signal['type']
  priority: Signal['priority']
  text: string
  timestamp: string
  source_url?: string
}

const priorityDotColor: Record<Priority, string> = {
  CRITICAL: 'bg-danger',
  HIGH: 'bg-danger',
  MEDIUM: 'bg-warning',
  LOW: 'bg-text-dim',
}

function relativeTime(timestamp: string): string {
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

export default function SignalItem({ type, priority, text, timestamp, source_url }: SignalItemProps) {
  const icon = SIGNAL_ICONS[type]

  const content = (
    <div className="flex items-start gap-3 py-3 px-4 border-b border-border-light last:border-b-0">
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary leading-snug">{text}</p>
        <p className="text-xs text-text-dim mt-1">{relativeTime(timestamp)}</p>
      </div>
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${priorityDotColor[priority]}`}
        title={priority}
      />
    </div>
  )

  if (source_url) {
    return (
      <a href={source_url} target="_blank" rel="noopener noreferrer" className="block hover:bg-page transition-colors">
        {content}
      </a>
    )
  }

  return content
}
