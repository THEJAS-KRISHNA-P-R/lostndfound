import { STATUS_STYLES, TYPE_STYLES } from '@/utils/constants'

type StatusBadgeProps = {
  status: string
  label?: string
}

type TypeBadgeProps = {
  type: 'lost' | 'found'
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.archived
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {label ?? status}
    </span>
  )
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const styles = TYPE_STYLES[type]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {type}
    </span>
  )
}
