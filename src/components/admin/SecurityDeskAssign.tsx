'use client'

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { assignToSecurityDesk } from '@/actions/claims'
import { Button } from '@/components/ui/Button'

export function SecurityDeskAssign({ itemId, currentLocation }: { itemId: string; currentLocation?: string | null }) {
  const [open, setOpen] = useState(false)
  const [location, setLocation] = useState(currentLocation ?? '')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!location.trim()) { toast.error('Enter a location'); return }
    startTransition(async () => {
      const result = await assignToSecurityDesk(itemId, location)
      if (result.success) { toast.success('Assigned to security desk'); setOpen(false) }
      else toast.error(result.error ?? 'Failed')
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 rounded border border-blue-700/60 text-blue-400 hover:bg-blue-950/30 transition-colors"
      >
        🏢 Assign Desk
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="e.g. Security Office, Locker G-12"
        className="text-xs bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded px-2 py-1 text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500 w-44"
        autoFocus
        onKeyDown={e => e.key === 'Enter' && handleSave()}
      />
      <Button size="sm" onClick={handleSave} loading={isPending} className="text-xs py-1 px-2">Save</Button>
      <button onClick={() => setOpen(false)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
    </div>
  )
}
