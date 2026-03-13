interface BadgeProps {
  label: string
  variant: 'green' | 'amber' | 'red' | 'blue' | 'gray'
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  green: 'bg-success-soft text-success',
  amber: 'bg-warning-soft text-warning',
  red: 'bg-danger-soft text-danger',
  blue: 'bg-accent-soft text-accent',
  gray: 'bg-page text-text-secondary',
}

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {label}
    </span>
  )
}
