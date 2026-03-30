'use client'

import { useTransition, useEffect } from 'react'
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

  // Only show if user is authenticated and UNI Reg No is missing or starts with 'PENDING'
  // We check 'initialized' to avoid flicker on first load
  const isMissingData = 
    isAuthed && 
    initialized && 
    (!profile?.uni_reg_no || profile?.uni_reg_no.startsWith('PENDING'))
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompleteProfileInput>({
    resolver: zodResolver(CompleteProfileSchema),
    defaultValues: {
      uni_reg_no: profile?.uni_reg_no?.startsWith('PENDING') ? '' : (profile?.uni_reg_no ?? ''),
      phone: profile?.phone ?? '',
    }
  })

  // Sync form defaults when profile loads (handles the jump after Google OAuth redirect)
  useEffect(() => {
    if (profile) {
      reset({
        uni_reg_no: profile.uni_reg_no === 'PENDING' ? '' : profile.uni_reg_no,
        phone: profile.phone ?? '',
      })
    }
  }, [profile, reset])

  const onSubmit = (data: CompleteProfileInput) => {
    const fd = new FormData()
    fd.append('uni_reg_no', data.uni_reg_no)
    fd.append('phone', data.phone ?? '')

    startTransition(async () => {
      try {
        const result = await updateProfile(fd)
        if (result.success) {
          toast.success('Profile completed! Welcome aboard.')
        } else {
          toast.error(result.error ?? 'Something went wrong.')
        }
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  if (!isMissingData) return null

  return (
    <Modal
      open={true}
      onClose={() => {}} 
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
              placeholder="CCE23CS123"
              autoFocus
              className={`w-full bg-[var(--color-bg-elevated)] border rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 transition-all ${
                errors.uni_reg_no 
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                  : 'border-[var(--color-bg-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]'
              }`}
            />
            <div className="flex justify-between items-start mt-1.5">
              <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">
                Format: <strong>CCE</strong> + Year (22-26) + Branch + ID (1-220)
              </p>
              {errors.uni_reg_no && (
                <p className="text-[10px] font-medium text-red-400 animate-in fade-in slide-in-from-top-1">
                  Required pattern: CCE[Year][Branch][ID]
                </p>
              )}
            </div>
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
