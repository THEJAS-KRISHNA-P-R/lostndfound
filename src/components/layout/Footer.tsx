import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-bg-border)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo scale={0.8} />
          <span className="text-[var(--color-text-muted)] text-sm">—</span>
          <p className="text-xs text-[var(--color-text-muted)] text-center max-w-md mx-auto leading-relaxed">
          The official digital hub for lost &apos;n found items at your campus. Fast, secure, and verification-first.
        </p>
          <Link href="/browse" className="hover:text-[var(--color-text-secondary)] transition-colors">Browse</Link>
          <Link href="/post" className="hover:text-[var(--color-text-secondary)] transition-colors">Post Item</Link>
          <span>© {new Date().getFullYear()} LOFO</span>
        </div>
      </div>
    </footer>
  )
}
