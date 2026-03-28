'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '@/actions/auth'
import { LoginSchema, type LoginInput } from '@/lib/validations/auth'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    const fd = new FormData()
    fd.append('email', data.email)
    fd.append('password', data.password)
    startTransition(async () => {
      const result = await login(fd)
      if (result.success) {
        toast.success('Welcome back!')
        router.push('/browse')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Login failed.')
      }
    })
  }

  return (
    <PageShell className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)]">LOFO</Link>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)] mt-4 mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Sign in to your account</p>
        </div>

        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@university.edu"
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">Password</label>
                <button type="button" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-3 py-2.5 pr-10 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button type="submit" fullWidth loading={isPending} className="mt-2">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[var(--color-accent)] hover:underline">Create one</Link>
        </p>
      </div>
    </PageShell>
  )
}
