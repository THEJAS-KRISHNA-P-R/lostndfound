import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--color-bg-border)] mt-auto py-12 bg-[var(--color-bg-base)]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
          
          {/* Brand & Slogan */}
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-3">
              <Logo scale={0.8} />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-dm-sans">
              The official digital hub for lost &apos;n found items at your campus. 
              Fast, secure, and verification-first.
            </p>
          </div>

          {/* Navigation & Legal */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium">
            <Link href="/browse" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              Browse Items
            </Link>
            <Link href="/post" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              Post Found Item
            </Link>
            <Link href="/notifications" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              Alerts
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-[var(--color-text-muted)] text-xs font-mono opacity-60">
            © {new Date().getFullYear()} LOFO. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  )
}
