'use client'

import { Copy } from 'lucide-react'
import type { Notification } from '@/types'

export function ContactCard({ metadata }: { metadata: Notification['metadata'] }) {
  if (!metadata) return null
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Optional: add toast notification here if available
  }

  return (
    <div className="mt-3 bg-[var(--color-bg-surface)] border border-[var(--color-accent)] border-opacity-30 rounded-[var(--radius-sm)] p-4 space-y-2">
      <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wide mb-2">Contact Details</p>
      
      {metadata.name && (
        <p className="text-sm text-[var(--color-text-primary)] font-medium">
          {metadata.name}
        </p>
      )}

      {metadata.email && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-[var(--color-text-secondary)]">{metadata.email}</p>
          <button
            onClick={() => copyToClipboard(metadata.email!)}
            className="text-[10px] px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] flex items-center gap-1 transition-colors"
          >
            <Copy size={10} /> Copy
          </button>
        </div>
      )}

      {metadata.phone && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-[var(--color-text-secondary)]">{metadata.phone}</p>
          <button
            onClick={() => copyToClipboard(metadata.phone!)}
            className="text-[10px] px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] flex items-center gap-1 transition-colors"
          >
            <Copy size={10} /> Copy
          </button>
        </div>
      )}

      {metadata.admin_note && (
        <p className="text-xs text-[var(--color-text-muted)] italic border-t border-[var(--color-bg-border)] pt-2 mt-2">
          Admin note: {metadata.admin_note}
        </p>
      )}
    </div>
  )
}
