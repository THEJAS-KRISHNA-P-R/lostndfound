'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

import { updateItem } from '@/actions/items'
import { CATEGORIES } from '@/utils/constants'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { Item } from '@/types'

type FormData = {
  title: string
  category_id: string
  description?: string
  location: string
  date_occurred: string
  time_occurred?: string
  type: 'lost' | 'found'
  private_details?: string
  images: string[]
}

interface EditItemFormProps {
  item: Item
}

export function EditItemForm({ item }: EditItemFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletedImages, setDeletedImages] = useState<string[]>([])

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: item.title,
      type: item.type,
      category_id: String(item.category_id || ''),
      description: item.description || '',
      location: item.location,
      date_occurred: item.date_occurred,
      time_occurred: item.time_occurred || '',
      private_details: item.private_details || '',
      images: item.images || [],
    }
  })

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('type', data.type)
      formData.append('title', data.title)
      formData.append('category_id', data.category_id)
      if (data.description) formData.append('description', data.description)
      formData.append('location', data.location)
      formData.append('date_occurred', data.date_occurred)
      if (data.time_occurred) formData.append('time_occurred', data.time_occurred)
      if (data.private_details) formData.append('private_details', data.private_details)
      
      data.images.forEach(img => formData.append('images', img))
      deletedImages.forEach(img => formData.append('deleted_images', img))

      const res = await updateItem(item.id, formData)
      if (res.success) {
        toast.success('Item updated successfully')
        router.push(`/items/${item.id}`)
      } else {
        toast.error(res.error || 'Failed to update item')
      }
    })
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Profile
      </Link>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] p-6 md:p-8 shadow-sm">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)] mb-6">Edit Post</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-[var(--color-bg-elevated)] rounded-[var(--radius-md)] border border-[var(--color-bg-border)]">
            {(['lost', 'found'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('type', t)}
                className={`py-2 text-sm font-semibold rounded-[var(--radius-sm)] capitalize transition-all ${watch('type') === t ? 'bg-[var(--color-accent)] text-[#0D0F14]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
              >
                {t}
              </button>
            ))}
            <input type="hidden" {...register('type', { required: true })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Item Name</label>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Red iPhone 13, Blue Water Bottle"
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] outline-none transition-colors"
              />
              {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Category</label>
              <select
                {...register('category_id', { required: 'Please select a category' })}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] outline-none transition-colors appearance-none"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat, i) => <option key={cat} value={i + 1}>{cat}</option>)}
              </select>
              {errors.category_id && <p className="text-xs text-red-500 font-medium">{errors.category_id.message}</p>}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Location</label>
              <input
                {...register('location', { required: 'Location is required' })}
                placeholder="e.g. Science Block, Cafeteria"
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] outline-none transition-colors"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Date {watch('type') === 'lost' ? 'Lost' : 'Found'}</label>
              <input
                type="date"
                {...register('date_occurred', { required: 'Date is required' })}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] outline-none transition-colors color-scheme-dark"
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Approx. Time (Optional)</label>
              <input
                type="time"
                {...register('time_occurred')}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add any visible details about the item..."
              className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] outline-none transition-colors resize-none"
            />
          </div>

          {/* Photos */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Photos (up to 4)</label>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  bucket="item-images"
                  maxFiles={4}
                  initialImages={field.value}
                  onComplete={(urls) => field.onChange(urls)}
                  onDeleteImage={(url) => {
                    if (item.images?.includes(url)) {
                      setDeletedImages(prev => [...prev, url])
                    }
                  }}
                />
              )}
            />
          </div>

          {/* Private Details */}
          <div className="p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] space-y-3">
            <div className="flex items-center gap-2">
              <div className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold tracking-wider">Internal Use Only</div>
              <p className="text-[10px] text-[var(--color-text-muted)]">Only admins see this info to verify claims</p>
            </div>
            <textarea
              {...register('private_details')}
              rows={2}
              placeholder="e.g. Serial number, special marks, contents inside..."
              className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] outline-none transition-colors resize-none"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isPending}
          >
            {isPending ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </main>
  )
}
