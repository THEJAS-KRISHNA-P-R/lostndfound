import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
      <div className="font-[var(--font-display)] text-8xl text-[var(--color-accent)] opacity-40">404</div>
      <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)]">Page not found</h1>
      <p className="text-sm text-[var(--color-text-muted)] max-w-xs">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#0D0F14] text-sm font-semibold transition-all mt-2"
      >
        <Home size={16} /> Return Home
      </Link>
    </div>
  )
}
