'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'
import { createItem } from '@/actions/items'
import { CATEGORIES } from '@/utils/constants'
import { PageShell } from '@/components/layout/PageShell'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'

type FormData = {
  title: string
  category_id: string
  description?: string
  location: string
  date_occurred: string
  time_occurred?: string
  private_details?: string
  images: string[]
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

const inputClass = 'w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'

export default function PostItemPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [itemType, setItemType] = useState<'found' | 'lost'>('found')

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: { images: [] },
  })

  const onSubmit = (data: FormData) => {
    if (!data.category_id) { toast.error('Please select a category.'); return }
    if (!data.location.trim()) { toast.error('Please enter a location.'); return }
    if (!data.date_occurred) { toast.error('Please enter the date.'); return }

    const fd = new FormData()
    fd.append('type', itemType)
    fd.append('title', data.title)
    fd.append('category_id', data.category_id)
    if (data.description) fd.append('description', data.description)
    fd.append('location', data.location)
    fd.append('date_occurred', data.date_occurred)
    if (data.time_occurred) fd.append('time_occurred', data.time_occurred)
    if (data.private_details) fd.append('private_details', data.private_details)
    data.images.forEach(url => fd.append('images', url))

    startTransition(async () => {
      const result = await createItem(fd)
      if (result.success && result.data?.id) {
        toast.success('Item posted successfully!')
        router.push(`/items/${result.data.id}`)
      } else {
        toast.error(result.error ?? 'Failed to post item.')
      }
    })
  }

  return (
    <PageShell>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)] mb-2">Post an Item</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">Share a lost or found item with your campus community.</p>

        {/* Type Toggle */}
        <div className="flex bg-[var(--color-bg-elevated)] rounded-[var(--radius-xl)] p-1 border border-[var(--color-bg-border)] mb-8">
          {(['found', 'lost'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setItemType(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-[calc(var(--radius-xl)-4px)] transition-all duration-200 ${itemType === t ? 'bg-[var(--color-accent)] text-[#0D0F14] font-semibold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              {t === 'found' ? 'I Found Something' : 'I Lost Something'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field label="Title" error={errors.title?.message} required>
            <input {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } })} className={inputClass} placeholder="e.g. Black leather wallet" />
          </Field>

          <Field label="Category" error={errors.category_id?.message} required>
            <select {...register('category_id', { required: 'Please select a category' })} className={inputClass}>
              <option value="">Select a category</option>
              {CATEGORIES.map((cat, i) => <option key={cat} value={i + 1}>{cat}</option>)}
            </select>
          </Field>

          <Field label="Description">
            <textarea {...register('description')} rows={3} className={inputClass} placeholder="Describe the item — color, brand, condition…" />
          </Field>

          <Field label="Photos (up to 4)">
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUpload
                  maxFiles={4}
                  bucket="item-images"
                  onComplete={urls => field.onChange(urls)}
                  label="Upload Photos"
                />
              )}
            />
          </Field>

          <Field label="Location where found/lost" error={errors.location?.message} required>
            <input {...register('location', { required: 'Location is required' })} className={inputClass} placeholder="e.g. Library, 2nd floor" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" error={errors.date_occurred?.message} required>
              <input {...register('date_occurred', { required: 'Date is required' })} type="date" className={inputClass} />
            </Field>
            <Field label="Time (optional)">
              <input {...register('time_occurred')} type="time" className={inputClass} />
            </Field>
          </div>

          {/* Private Details */}
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-[var(--color-accent)]" />
              <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wide">Private Details</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">
              Secret details only you would know — e.g. &quot;has a crack on back left corner&quot;. Admins use this to verify claims. <strong className="text-[var(--color-text-secondary)]">Never shown publicly.</strong>
            </p>
            <textarea
              {...register('private_details')}
              rows={2}
              className={inputClass}
              placeholder="e.g. sticker on back, custom engraving, broken zipper…"
            />
          </div>

          <Button type="submit" fullWidth size="lg" loading={isPending}>
            Post Item
          </Button>
        </form>
      </main>
    </PageShell>
  )
}
