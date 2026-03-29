'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function ModeToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Determine current mode
  const currentStatus = searchParams.get('status')
  const currentType = searchParams.get('type') ?? 'lost'
  const mode = currentStatus === 'claimed' ? 'claimed' : currentType

  const toggle = (m: 'lost' | 'found' | 'claimed') => {
    const params = new URLSearchParams(searchParams.toString())
    if (m === 'claimed') {
      params.set('status', 'claimed')
      params.delete('type')
    } else {
      params.set('type', m)
      params.delete('status')
    }
    router.push(`/browse?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative inline-flex bg-[var(--color-bg-elevated)] rounded-[var(--radius-xl)] p-1 border border-[var(--color-bg-border)] min-w-[280px]">
      {/* Sliding indicator - 3 segments */}
      <div
        className="absolute top-1 bottom-1 w-[calc(33.33%-4px)] rounded-[calc(var(--radius-xl)-4px)] bg-[var(--color-accent)] transition-all duration-300 ease-out"
        style={{ 
          left: 4, 
          transform: mode === 'found' 
            ? 'translateX(calc(100% + 2px))' 
            : mode === 'claimed' 
            ? 'translateX(calc(200% + 4px))' 
            : 'none' 
        }}
      />
      
      <button
        onClick={() => toggle('lost')}
        className={`relative z-10 flex-1 px-4 py-1.5 text-sm font-medium rounded-[calc(var(--radius-xl)-4px)] transition-colors duration-200 ${
          mode === 'lost' ? 'text-[#0D0F14] font-semibold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        Lost
      </button>
      
      <button
        onClick={() => toggle('found')}
        className={`relative z-10 flex-1 px-4 py-1.5 text-sm font-medium rounded-[calc(var(--radius-xl)-4px)] transition-colors duration-200 ${
          mode === 'found' ? 'text-[#0D0F14] font-semibold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        Found
      </button>

      <button
        onClick={() => toggle('claimed')}
        className={`relative z-10 flex-1 px-4 py-1.5 text-sm font-medium rounded-[calc(var(--radius-xl)-4px)] transition-colors duration-200 ${
          mode === 'claimed' ? 'text-[#0D0F14] font-semibold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        Claimed
      </button>
    </div>
  )
}
