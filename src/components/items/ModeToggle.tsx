'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function ModeToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('type') ?? 'lost'

  const toggle = (type: 'lost' | 'found') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', type)
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <div className="relative inline-flex bg-[var(--color-bg-elevated)] rounded-[var(--radius-xl)] p-1 border border-[var(--color-bg-border)]">
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[calc(var(--radius-xl)-4px)] bg-[var(--color-accent)] transition-transform duration-200 ease-in-out"
        style={{ left: 4, transform: current === 'found' ? 'translateX(calc(100% + 8px))' : 'none' }}
      />
      <button
        onClick={() => toggle('lost')}
        className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-[calc(var(--radius-xl)-4px)] transition-colors duration-200 ${
          current === 'lost' ? 'text-[#0D0F14] font-semibold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        Lost Items
      </button>
      <button
        onClick={() => toggle('found')}
        className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-[calc(var(--radius-xl)-4px)] transition-colors duration-200 ${
          current === 'found' ? 'text-[#0D0F14] font-semibold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        Found Items
      </button>
    </div>
  )
}
