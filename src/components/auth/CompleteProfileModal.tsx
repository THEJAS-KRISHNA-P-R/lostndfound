'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CompleteProfileSchema, type CompleteProfileInput } from '@/lib/validations/auth'
import { updateProfile } from '@/actions/auth'

export function CompleteProfileModal() {
  const { profile, isAuthed, initialized } = useAuth()
  const [isPending, startTransition] = useTransition()

  // Only show if user is authenticated and UNI Reg No is missing or 'PENDING'
  const isMissingData = isAuthed && (!profile?.uni_reg_no || profile?.uni_reg_no === 'PENDING')
  
  const { register, handleSubmit, formState: { errors } } = useForm<CompleteProfileInput>({
    resolver: zodResolver(CompleteProfileSchema),
    defaultValues: {
      uni_reg_no: profile?.uni_reg_no === 'PENDING' ? '' : profile?.uni_reg_no,
      phone: profile?.phone ?? '',
    }
  })

  const onSubmit = (data: CompleteProfileInput) => {
    const fd = new FormData()
    fd.append('uni_reg_no', data.uni_reg_no)
    fd.append('phone', data.phone ?? '')

    startTransition(async () => {
      const result = await updateProfile(fd)
      if (result.success) {
        toast.success('Profile completed! Welcome aboard.')
      } else {
        toast.error(result.error ?? 'Something went wrong.')
      }
    })
  }

  if (!initialized || !isMissingData) return null

  return (
    <Modal
      open={true}
      onClose={() => {}} // Unused since closable={false}
      closable={false}
      title="Complete your profile"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Welcome! Before you can browse or post items, we need a few more details to ensure campus security.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              University Registration Number <span className="text-red-400">*</span>
            </label>
            <input
              {...register('uni_reg_no')}
              type="text"
              placeholder="e.g. 20B-1234-CS"
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            {errors.uni_reg_no && <p className="mt-1 text-xs text-red-400">{errors.uni_reg_no.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Phone Number (Optional)
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+92 300 0000000"
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
          </div>

          <Button type="submit" fullWidth loading={isPending} className="mt-2">
            Finish Setup
          </Button>
        </form>
      </div>
    </Modal>
  )
}
