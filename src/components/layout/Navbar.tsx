'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { Home, Search, Plus, User, Bell, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { logout } from '@/actions/auth'
import { Avatar } from '@/components/ui/Avatar'
import { NotifBell } from '@/components/ui/NotifBell'
import { OnboardingGuard } from '@/components/auth/OnboardingGuard'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse', label: 'Browse', icon: Search },
  { href: '/post', label: 'Post', icon: Plus },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Navbar() {
  const { isAuthed, isAdmin, profile, session, initialized } = useAuth()
  const { unreadCount } = useNotifications(profile?.id)
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav className="sticky top-0 z-40 h-[60px] flex items-center px-4 md:px-8 border-b border-[var(--color-bg-border)] backdrop-blur-xl bg-[var(--color-bg-surface)]/90">
        {/* Logo */}
        <Logo className="mr-6" />

        {/* Center search — desktop only */}
        <div className="hidden md:flex flex-1 max-w-[480px] mx-auto">
          <input
            type="text"
            placeholder="Search items, locations..."
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const q = (e.currentTarget as HTMLInputElement).value.trim()
                if (q) router.push(`/browse?q=${encodeURIComponent(q)}`)
              }
            }}
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] px-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Right actions */}
        <div className="ml-auto min-h-[40px] flex items-center gap-2">
          {/* Prevent showing old buttons during initialization/hydration */}
          {initialized ? (
            isAuthed ? (
              <>
                {/* Post Item button — desktop */}
                <OnboardingGuard>
                  <Link
                    href="/post"
                    className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#0D0F14] text-sm font-semibold transition-colors active:scale-95"
                  >
                    <Plus size={16} /> Post Item
                  </Link>
                </OnboardingGuard>
                {isAdmin && (
                  <Link href="/admin" className="hidden md:block text-xs text-[var(--color-accent)] hover:underline px-2">
                    Admin
                  </Link>
                )}
                <NotifBell count={unreadCount} />
                {/* Avatar dropdown trigger */}
                <div className="relative">
                  <button onClick={() => setMenuOpen(v => !v)} className="rounded-full focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]">
                    <Avatar src={profile?.avatar_url} fallback={profile?.email ?? session?.user?.email ?? 'U'} size={32} />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] shadow-xl z-20 py-1">
                        <div className="px-4 py-2 border-b border-[var(--color-bg-border)]">
                           <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{profile?.full_name ?? 'User'}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">{profile?.email ?? session?.user?.email}</p>
                        </div>
                        <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-border)]">
                          <Settings size={14} /> Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[var(--color-bg-border)] hover:text-red-300"
                        >
                          <LogOut size={14} /> {loggingOut ? 'Signing out…' : 'Sign out'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in duration-300">
                <Link href="/login" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hidden md:block px-3">
                  Sign in
                </Link>
                <Link href="/register" className="px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#0D0F14] text-sm font-semibold transition-colors">
                  Get Started
                </Link>
              </div>
            )
          ) : (
            <div className="w-20" /> // Transparent placeholder during load
          )}
        </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      {isAuthed && (
        <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border-t border-[var(--color-bg-border)]">
          <div className="flex h-16">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              
              const linkNode = (
                <Link
                  href={href}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                  {label}
                </Link>
              )

              if (href === '/post') {
                return (
                  <OnboardingGuard key={href}>
                    {linkNode}
                  </OnboardingGuard>
                )
              }

              return <div key={href} className="flex flex-1 contents">{linkNode}</div>
            })}
            <Link
              href="/notifications"
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors relative ${pathname === '/notifications' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
            >
              <Bell size={20} strokeWidth={pathname === '/notifications' ? 2.5 : 1.5} />
              {unreadCount > 0 && (
                <span 
                  className="absolute -top-1 right-[calc(50%-20px)] min-w-[1.1rem] h-4.5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-50 pointer-events-none" 
                  style={{ 
                    background: '#EF4444', 
                    boxShadow: '0 0 14px rgba(239, 68, 68, 0.6)',
                    border: '1.5px solid var(--color-bg-surface)',
                    transform: 'translate(25%, -25%)'
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              Notifs
            </Link>
          </div>
        </nav>
      )}
    </>
  )
}
