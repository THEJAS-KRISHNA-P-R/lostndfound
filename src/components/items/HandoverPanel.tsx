'use client'

import { useTransition } from 'react'
import toast from 'react-hot-toast'
import { confirmHandover } from '@/actions/claims'
import { Button } from '@/components/ui/Button'

interface HandoverPanelProps {
  claimId: string
  isItemOwner: boolean            // true = user is the item poster
  posterConfirmed: boolean
  claimerConfirmed: boolean
}

export function HandoverPanel({ claimId, isItemOwner, posterConfirmed, claimerConfirmed }: HandoverPanelProps) {
  const [isPending, startTransition] = useTransition()
  const bothDone = posterConfirmed && claimerConfirmed

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmHandover(claimId, isItemOwner ? 'poster' : 'claimer')
      if (result.success) toast.success('Confirmation recorded!')
      else toast.error(result.error ?? 'Failed to confirm.')
    })
  }

  const myConfirmed = isItemOwner ? posterConfirmed : claimerConfirmed
  const otherConfirmed = isItemOwner ? claimerConfirmed : posterConfirmed

  return (
    <div className="border border-[var(--color-bg-border)] rounded-[var(--radius-md)] overflow-hidden">
      <div className="bg-[var(--color-bg-elevated)] px-4 py-3 border-b border-[var(--color-bg-border)]">
        <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          {bothDone ? '✅ Handover Complete' : '📦 Confirm Handover'}
        </p>
      </div>
      <div className="p-4 space-y-3">
        {/* Status indicators */}
        <div className="flex gap-2">
          <div className={`flex-1 text-center py-2 rounded-[var(--radius-sm)] text-xs font-medium border ${posterConfirmed ? 'bg-green-950/40 border-green-800/50 text-green-400' : 'bg-[var(--color-bg-elevated)] border-[var(--color-bg-border)] text-[var(--color-text-muted)]'}`}>
            {posterConfirmed ? '✓' : '○'} Poster
          </div>
          <div className={`flex-1 text-center py-2 rounded-[var(--radius-sm)] text-xs font-medium border ${claimerConfirmed ? 'bg-green-950/40 border-green-800/50 text-green-400' : 'bg-[var(--color-bg-elevated)] border-[var(--color-bg-border)] text-[var(--color-text-muted)]'}`}>
            {claimerConfirmed ? '✓' : '○'} Claimer
          </div>
        </div>

        {bothDone ? (
          <p className="text-xs text-green-400 text-center font-medium">Both parties confirmed. Item is resolved.</p>
        ) : myConfirmed ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            Waiting for the {otherConfirmed ? 'other party' : isItemOwner ? 'claimer' : 'poster'} to confirm…
          </p>
        ) : (
          <Button onClick={handleConfirm} loading={isPending} fullWidth size="sm" variant="primary">
            {isItemOwner ? 'Mark as Handed Over' : 'Confirm Received'}
          </Button>
        )}
      </div>
    </div>
  )
}
