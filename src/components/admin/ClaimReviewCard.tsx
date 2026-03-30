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
  items: Pick<Item, 'id' | 'title' | 'type' | 'images' | 'status' | 'private_details'>
}

export function ClaimReviewCard({ claim, privateDetails }: { claim: FullClaim; privateDetails?: string }) {
  const [isPending, startTransition] = useTransition()
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const [note, setNote] = useState('')

  const isReturnOfLost = claim.items?.type === 'lost'
  const termNoun = isReturnOfLost ? 'Found Report' : 'Claim'
  const personNoun = isReturnOfLost ? 'Finder' : 'Claimant'

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveClaim(claim.id, note)
      if (result.success) { toast.success(`${termNoun} approved!`); setModal(null) }
      else toast.error(result.error ?? 'Approval failed.')
    })
  }

  const handleReject = () => {
    if (!note.trim()) { toast.error('Please provide a reason for rejection.'); return }
    startTransition(async () => {
      const result = await rejectClaim(claim.id, note)
      if (result.success) { toast.success(`${termNoun} rejected.`); setModal(null) }
      else toast.error(result.error ?? 'Rejection failed.')
    })
  }

  return (
    <>
      <div className={`bg-[var(--color-bg-surface)] border rounded-[var(--radius-lg)] overflow-hidden ${isReturnOfLost ? 'border-amber-900/40' : 'border-[var(--color-bg-border)]'}`}>
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-[var(--color-bg-border)]">
          <div className="relative w-14 h-14 shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-elevated)]">
            {claim.items?.images?.[0]
              ? <Image src={claim.items.images[0]} alt={claim.items.title} fill sizes="80px" className="object-cover" />
              : <span className="absolute inset-0 flex items-center justify-center text-xl opacity-20">📦</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">
              {isReturnOfLost ? '📥 INCOMING FOUND REPORT' : '📋 INCOMING CLAIM'}
            </p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{claim.items?.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {claim.items?.type && <TypeBadge type={claim.items.type} />}
              <StatusBadge status={claim.status} />
            </div>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{formatRelative(claim.created_at)}</span>
        </div>

        {/* Submitter */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={claim.profiles?.avatar_url} fallback={claim.profiles?.full_name ?? 'U'} size={40} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{claim.profiles?.full_name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] font-bold">{personNoun}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{claim.profiles?.email}</p>
              <p className="text-xs text-[var(--color-text-muted)] font-mono opacity-70">{claim.profiles?.uni_reg_no}</p>
            </div>
          </div>

          {/* Challenge-Response Comparison (core USP) */}
          {!isReturnOfLost ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-[var(--radius-sm)] p-3">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">📦 POSTER&apos;S SECRET</p>
                {privateDetails
                  ? <p className="text-xs text-amber-200 leading-relaxed">{privateDetails}</p>
                  : <p className="text-xs text-[var(--color-text-muted)] italic">Not provided by poster</p>}
              </div>
              <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] p-3">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">🔍 CLAIMER&apos;S ANSWER</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{claim.description}</p>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] p-3">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">📍 FOUND REPORT DETAILS</p>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{claim.description}</p>
            </div>
          )}

          {/* Proof images */}
          {claim.proof_images && claim.proof_images.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                {isReturnOfLost ? 'Photo Proof (Possession):' : 'Ownership Proof Images:'}
              </p>
              <div className="flex gap-2">
                {claim.proof_images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-bg-border)]">
                    <Image src={img} alt={`Proof ${i + 1}`} fill sizes="200px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {claim.status === 'pending' && (
          <div className="flex gap-3 p-4 border-t border-[var(--color-bg-border)] bg-[var(--color-bg-elevated)]/30">
            <Button variant="primary" size="sm" onClick={() => { setNote(''); setModal('approve') }} className="flex-1 font-bold">
              ✅ Approve {isReturnOfLost ? 'Report' : 'Claim'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setNote(''); setModal('reject') }} className="flex-1 font-bold text-red-400 hover:bg-red-950/20">
              ❌ Reject
            </Button>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal open={modal === 'approve'} onClose={() => setModal(null)} title={`Approve ${termNoun}`}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {isReturnOfLost
              ? `The owner will receive the finder's contact details to coordinate the return.`
              : `The finder will receive the claimant's contact details for collection.`}
          </p>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Admin Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
              placeholder="Add pickup instructions or context…" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleApprove} loading={isPending} className="flex-1 font-bold">Confirm Approval</Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={modal === 'reject'} onClose={() => setModal(null)} title={`Reject ${termNoun}`}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">The {personNoun.toLowerCase()} will be notified with the reason.</p>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Reason <span className="text-red-400">*</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
              placeholder="e.g. answer doesn't match the private detail…" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={isPending} className="flex-1 font-bold">Confirm Rejection</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
