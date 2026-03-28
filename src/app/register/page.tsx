'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { register as registerAction } from '@/actions/auth'
import { RegisterSchema, type RegisterInput } from '@/lib/validations/auth'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] ${className}`}
      {...props}
    />
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  const onSubmit = (data: RegisterInput) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v ?? ''))
    startTransition(async () => {
      const result = await registerAction(fd)
      if (result.success) {
        toast.success('Account created! Check your email to verify.')
        router.push('/login')
      } else {
        toast.error(result.error ?? 'Registration failed.')
      }
    })
  }

  return (
    <PageShell className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo className="mb-4 justify-center" scale={1.15} />
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)] mt-4 mb-1">Create account</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Join your campus community</p>
        </div>

        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Field label="Full Name" error={errors.full_name?.message}>
                <Input {...register('full_name')} type="text" placeholder="Your full name" />
              </Field>
              <Field label="University Email" error={errors.email?.message}>
                <Input {...register('email')} type="email" placeholder="you@university.edu" />
              </Field>
              <Field label="University Registration No." error={errors.uni_reg_no?.message}>
                <Input {...register('uni_reg_no')} type="text" placeholder="e.g. 20B-1234-CS" />
              </Field>
              <Field label="Phone (optional)" error={errors.phone?.message}>
                <Input {...register('phone')} type="tel" placeholder="+92 300 0000000" />
              </Field>
              <Field label="Password" error={errors.password?.message}>
                <div className="relative">
                  <Input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="pr-10" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password" error={errors.confirmPassword?.message}>
                <Input {...register('confirmPassword')} type="password" placeholder="••••••••" />
              </Field>
            </div>
            
            <Button type="submit" fullWidth loading={isPending}>
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-accent)] hover:underline">Sign in</Link>
        </p>
      </div>
    </PageShell>
  )
}
