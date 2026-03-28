'use client'

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
}

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 border ${
        active
          ? 'bg-[var(--color-accent)] text-[#0D0F14] border-[var(--color-accent)] font-semibold'
          : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-bg-border)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {label}
    </button>
  )
}
