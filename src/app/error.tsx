'use client'

import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
      <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)]">Something went wrong</h1>
      <p className="text-sm text-[var(--color-text-muted)]">An unexpected error occurred. Please try again.</p>
      <Link href="/" className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#0D0F14] text-sm font-semibold transition-all mt-2">
        Return Home
      </Link>
    </div>
  )
}
