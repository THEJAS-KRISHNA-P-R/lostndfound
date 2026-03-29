'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { createClaim } from '@/actions/claims'
import { PageShell } from '@/components/layout/PageShell'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { TypeBadge } from '@/components/ui/Badge'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { PublicItem } from '@/types'

// Wait, Lucide icon is ArrowLeft, but it should be from lucide-react. I see a typo in my previous thought or context.

type FormData = {
  description: string
  proof_images: string[]
}

interface InteractionFormProps {
  item: PublicItem & { categories?: { name: string } | null }
}

export function InteractionForm({ item }: InteractionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isLostItem = item.type === 'lost'

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: { proof_images: [] },
  })

  const description = useWatch({ control, name: 'description' })
  const images = useWatch({ control, name: 'proof_images' }) || []
  const descLength = description?.length ?? 0

  const onSubmit = (data: FormData) => {
    // Security Check: Photo is MANDATORY for returning a lost item
    if (isLostItem && (!data.proof_images || data.proof_images.length === 0)) {
      toast.error("Please upload at least one photo of the item you found.")
      return
    }

    const fd = new FormData()
    fd.append('item_id', item.id)
    fd.append('description', data.description)
    data.proof_images.forEach(url => fd.append('proof_images', url))

    startTransition(async () => {
      const result = await createClaim(fd)
      if (result.success) {
        toast.success(isLostItem ? "Report submitted! The owner will be notified." : "Claim submitted! Admin will review.")
        router.push('/profile?tab=claims')
      } else {
        toast.error(result.error ?? 'Submission failed.')
      }
    })
  }

  return (
    <PageShell>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24 md:pb-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-6 transition-colors font-medium">
          {/* Using Lucide React icons */}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back
        </button>
        
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)] mb-2">
          {isLostItem ? 'Report Found Item' : 'Submit a Claim'}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          {isLostItem 
            ? 'Provide details to help return this item to its owner.' 
            : 'Prove ownership to reclaim your item.'}
        </p>

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
          {/* Lucide AlertTriangle equivalent */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle text-amber-400 shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <p className="text-xs text-amber-300 leading-relaxed">
            {isLostItem 
              ? "Your report will be reviewed by an admin. Once approved, the owner will receive your contact details to coordinate the return."
              : "Your submission will be reviewed by an admin. Do not include sensitive personal data. Admin will contact you via notification if approved."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                {isLostItem ? 'Describe where and when you found it' : 'Describe details only the true owner would know'} <span className="text-red-400">*</span>
              </label>
              <span className={`text-xs ${descLength < 50 ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>{descLength}/50 min</span>
            </div>
            {!isLostItem && (
              <p className="text-[11px] text-amber-400/80 mb-2 italic">Do not describe what&apos;s visible in the photos. Describe hidden details — a scratch, engraving, sticker, damage, or anything only the owner would know.</p>
            )}
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 50, message: 'Please provide at least 50 characters' },
              })}
              rows={5}
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
              placeholder={isLostItem ? "e.g. I found it at the Library 3rd floor cafeteria at 2 PM..." : "e.g. has a crack on the back-left corner, custom red sticker on the spine, broken clasp..."}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 font-semibold">
              {isLostItem ? 'Upload Photo of the Item (Mandatory)' : 'Upload Proof Images (optional, up to 3)'}
              {isLostItem && <span className="text-red-400 ml-1">*</span>}
            </label>
            <Controller
              control={control}
              name="proof_images"
              render={({ field }) => (
                <ImageUpload
                  maxFiles={3}
                  bucket="proof-images"
                  onComplete={urls => field.onChange(urls)}
                  label={isLostItem ? "Add Photo of Item" : "Add Proof"}
                />
              )}
            />
            {isLostItem && images.length === 0 && <p className="mt-1 text-xs text-red-500 font-medium">Please upload at least one photo to verify you have the item.</p>}
          </div>

          <Button type="submit" fullWidth size="lg" loading={isPending} className="shadow-[var(--shadow-lg)]">
            {isLostItem ? 'Notify Owner' : 'Submit Claim'}
          </Button>
        </form>
      </main>
    </PageShell>
  )
}
