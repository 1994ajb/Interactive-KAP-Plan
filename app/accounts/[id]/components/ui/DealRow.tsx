import { HubSpotDeal } from '@/lib/types'
import { STAGE_COLORS, PIPELINE_STAGES } from '@/lib/constants'

interface DealRowProps extends HubSpotDeal {}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatGBP(amount: number | null): string {
  if (amount == null) return '-'
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function DealRow({ dealname, dealstage, stage_label, closedate, amount }: DealRowProps) {
  const dotColor = STAGE_COLORS[dealstage] || 'bg-text-dim'
  const label = stage_label || PIPELINE_STAGES[dealstage]?.label || dealstage

  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 border-b border-border-light last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className="text-sm font-medium text-text-primary truncate">{dealname}</span>
      </div>
      <span className="text-xs text-text-secondary whitespace-nowrap">{label}</span>
      <span className="text-xs text-text-dim whitespace-nowrap">{formatDate(closedate)}</span>
      <span className="font-mono text-sm font-medium text-text-primary whitespace-nowrap">{formatGBP(amount)}</span>
    </div>
  )
}
