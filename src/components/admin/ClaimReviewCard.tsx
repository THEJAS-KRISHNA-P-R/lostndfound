'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { approveClaim, rejectClaim } from '@/actions/claims'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge, TypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatRelative } from '@/utils/formatDate'
import type { Claim, Profile, Item } from '@/types'

type FullClaim = Claim & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone' | 'uni_reg_no' | 'avatar_url'>
  items: Pick<Item, 'id' | 'title' | 'type' | 'images' | 'status'>
}

export function ClaimReviewCard({ claim }: { claim: FullClaim }) {
  const [isPending, startTransition] = useTransition()
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const [note, setNote] = useState('')

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveClaim(claim.id, note)
      if (result.success) {
        toast.success('Claim approved!')
        setModal(null)
      } else {
        toast.error(result.error ?? 'Approval failed.')
      }
    })
  }

  const handleReject = () => {
    if (!note.trim()) { toast.error('Please provide a reason for rejection.'); return }
    startTransition(async () => {
      const result = await rejectClaim(claim.id, note)
      if (result.success) {
        toast.success('Claim rejected.')
        setModal(null)
      } else {
        toast.error(result.error ?? 'Rejection failed.')
      }
    })
  }

  return (
    <>
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 p-4 border-b border-[var(--color-bg-border)]">
          {/* Item thumbnail */}
          <div className="relative w-16 h-16 shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-elevated)]">
            {claim.items?.images?.[0] ? <Image src={claim.items.images[0]} alt={claim.items.title} fill className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-2xl opacity-20">📦</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Claimed Item</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{claim.items?.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {claim.items?.type && <TypeBadge type={claim.items.type} />}
              <StatusBadge status={claim.status} />
            </div>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] shrink-0">{formatRelative(claim.created_at)}</span>
        </div>

        {/* Claimer info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar src={claim.profiles?.avatar_url} fallback={claim.profiles?.full_name ?? 'U'} size={40} />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{claim.profiles?.full_name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{claim.profiles?.email}</p>
              <p className="text-xs text-[var(--color-text-muted)] font-mono">{claim.profiles?.uni_reg_no}</p>
            </div>
          </div>

          <div className="bg-[var(--color-bg-elevated)] rounded-[var(--radius-sm)] p-3">
            <p className="text-xs text-[var(--color-text-muted)] mb-1.5">Claim Description:</p>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{claim.description}</p>
          </div>

          {claim.proof_images && claim.proof_images.length > 0 && (
            <div className="flex gap-2">
              {claim.proof_images.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-bg-border)]">
                  <Image src={img} alt={`Proof ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions (only for pending claims) */}
        {claim.status === 'pending' && (
          <div className="flex gap-3 p-4 border-t border-[var(--color-bg-border)]">
            <Button variant="primary" size="sm" onClick={() => { setNote(''); setModal('approve') }} className="flex-1">
              ✅ Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => { setNote(''); setModal('reject') }} className="flex-1">
              ❌ Reject
            </Button>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal open={modal === 'approve'} onClose={() => setModal(null)} title="Approve Claim">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Approving this claim will mark the item as resolved and notify both the finder and claimer with each other&apos;s contact details.
          </p>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Admin note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
              placeholder="Any notes for the parties involved…"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleApprove} loading={isPending} className="flex-1">Confirm Approval</Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={modal === 'reject'} onClose={() => setModal(null)} title="Reject Claim">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">The claimer will be notified with the reason.</p>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Reason for rejection <span className="text-red-400">*</span></label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
              placeholder="e.g. description does not match private details…"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={isPending} className="flex-1">Confirm Rejection</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
