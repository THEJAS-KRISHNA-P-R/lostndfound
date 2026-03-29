'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { sendNotification } from '@/actions/notifications'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" fullWidth loading={pending}>
      Send Notification
    </Button>
  )
}

export default function AdminNotifyPage() {
  const [error, setError] = useState<string | null>(null)

  async function clientAction(formData: FormData) {
    setError(null)
    const result = await sendNotification(formData)
    if (result.success) {
      toast.success('Notification sent!')
      // Reset form natively
      const form = document.getElementById('notify-form') as HTMLFormElement
      form?.reset()
    } else {
      setError(result.error ?? 'Failed to send.')
      toast.error(result.error ?? 'Failed to send.')
    }
  }

  const inputClass = 'w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <Navbar />
      <div className="p-6 md:p-8 max-w-lg mx-auto">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)] mb-2">Send Notification</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">Broadcast to all users or target by Email, Uni ID, or UUID.</p>

        <form 
          id="notify-form"
          action={clientAction} 
          className="space-y-5 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] p-6"
        >
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-sm)] text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Recipient</label>
            <input 
              name="recipient_id" 
              className={inputClass} 
              placeholder="Email, Uni ID, or 'all'" 
              required 
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Supports <code className="text-[var(--color-accent)]">Email</code>, 
              <code className="text-[var(--color-accent)] ml-1">Uni ID</code>, or 
              <code className="text-[var(--color-accent)] ml-1">all</code>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Type</label>
            <select name="type" className={inputClass}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="contact_shared">Contact Shared</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Title</label>
            <input 
              name="title" 
              className={inputClass} 
              placeholder="Notification title" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Message</label>
            <textarea 
              name="message" 
              rows={4} 
              className={inputClass} 
              placeholder="Enter notification message…" 
              required 
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
