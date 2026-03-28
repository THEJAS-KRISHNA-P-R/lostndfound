'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { createClaim } from '@/actions/claims'
import { PageShell } from '@/components/layout/PageShell'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { TypeBadge } from '@/components/ui/Badge'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { PublicItem } from '@/types'

type FormData = {
  description: string
  proof_images: string[]
}

interface ClaimFormClientProps {
  item: PublicItem & { categories?: { name: string } | null }
}

export function ClaimFormClient({ item }: ClaimFormClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { proof_images: [] },
  })

  const descLength = watch('description')?.length ?? 0

  const onSubmit = (data: FormData) => {
    const fd = new FormData()
    fd.append('item_id', item.id)
    fd.append('description', data.description)
    data.proof_images.forEach(url => fd.append('proof_images', url))

    startTransition(async () => {
      const result = await createClaim(fd)
      if (result.success) {
        toast.success("Claim submitted! You'll be notified of the decision.")
        router.push('/profile?tab=claims')
      } else {
        toast.error(result.error ?? 'Claim submission failed.')
      }
    })
  }

  return (
    <PageShell>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24 md:pb-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)] mb-2">Submit a Claim</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">Prove ownership to reclaim your item.</p>

        {/* Item summary */}
        <div className="flex gap-3 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] p-3 mb-6">
          <div className="relative w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-elevated)] shrink-0">
            {item.images?.[0] ? <Image src={item.images[0]} alt={item.title} fill className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-2xl opacity-20">📦</span>}
          </div>
          <div className="min-w-0">
            <TypeBadge type={item.type} />
            <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-1 truncate">{item.title}</p>
            {item.categories?.name && <p className="text-xs text-[var(--color-text-muted)]">{item.categories.name}</p>}
          </div>
        </div>

        {/* Warning banner */}
        <div className="flex gap-3 bg-amber-950/40 border border-amber-800/50 rounded-[var(--radius-md)] p-4 mb-6">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300 leading-relaxed">
            Your submission will be reviewed by an admin. Do not include sensitive personal data in this form.
            The admin will contact you via notification if approved.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Describe why this item is yours <span className="text-red-400">*</span>
              </label>
              <span className={`text-xs ${descLength < 50 ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>{descLength}/50 min</span>
            </div>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 50, message: 'Please provide at least 50 characters' },
              })}
              rows={5}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              placeholder="Describe unique identifiers, when you last had it, any distinguishing features…"
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Upload Proof Images (optional, up to 3)</label>
            <Controller
              control={control}
              name="proof_images"
              render={({ field }) => (
                <ImageUpload
                  maxFiles={3}
                  bucket="proof-images"
                  onComplete={urls => field.onChange(urls)}
                  onError={msg => toast.error(msg)}
                  label="Add Proof"
                />
              )}
            />
          </div>

          <Button type="submit" fullWidth size="lg" loading={isPending}>
            Submit Claim
          </Button>
        </form>
      </main>
    </PageShell>
  )
}
