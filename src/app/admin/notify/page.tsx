'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { sendNotification } from '@/actions/notifications'
import { Button } from '@/components/ui/Button'

type NotifForm = {
  recipient_id: string
  title: string
  message: string
  type: string
}

export default function AdminNotifyPage() {
  const [isPending, startTransition] = useTransition()
  const { register, handleSubmit, reset } = useForm<NotifForm>({
    defaultValues: { recipient_id: 'all', type: 'info' },
  })

  const onSubmit = (data: NotifForm) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v))
    startTransition(async () => {
      const result = await sendNotification(fd)
      if (result.success) {
        toast.success('Notification sent!')
        reset()
      } else {
        toast.error(result.error ?? 'Failed to send.')
      }
    })
  }

  const inputClass = 'w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'

  return (
    <div className="p-6 md:p-8 max-w-lg">
      <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)] mb-2">Send Notification</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Broadcast to all users or target a specific user by ID.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] p-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Recipient</label>
          <input {...register('recipient_id')} className={inputClass} placeholder="Enter user ID or 'all' for broadcast" />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Use <code className="text-[var(--color-accent)]">all</code> to send to all users.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Type</label>
          <select {...register('type')} className={inputClass}>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Title</label>
          <input {...register('title', { required: true })} className={inputClass} placeholder="Notification title" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Message</label>
          <textarea {...register('message', { required: true })} rows={4} className={inputClass} placeholder="Enter notification message…" />
        </div>
        <Button type="submit" fullWidth loading={isPending}>Send Notification</Button>
      </form>
    </div>
  )
}
