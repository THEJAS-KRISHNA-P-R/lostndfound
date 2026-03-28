'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, FileCheck, Users, Archive, Send, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'

const navItems = [
  { href: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/admin/items',    label: 'Items',       icon: Package },
  { href: '/admin/claims',   label: 'Claims',      icon: FileCheck },
  { href: '/admin/users',    label: 'Users',       icon: Users },
  { href: '/admin/resolved', label: 'Resolved',    icon: Archive },
  { href: '/admin/notify',   label: 'Send Message',icon: Send },
]

export function AdminSidebar({ pendingClaimsCount }: { pendingClaimsCount: number }) {
  const pathname = usePathname()
  const { profile } = useAuth()

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col shrink-0 h-screen sticky top-0 bg-[var(--color-bg-surface)] border-r border-[var(--color-bg-border)] overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[var(--color-bg-border)]">
          <Link href="/" className="font-[var(--font-display)] text-xl text-[var(--color-text-primary)]">LOFO</Link>
          <p className="text-[10px] text-[var(--color-accent)] uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm transition-colors ${
                  active
                    ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 1.5} />
                {label}
                {label === 'Claims' && pendingClaimsCount > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1 rounded-full bg-[var(--color-accent)] text-[#0D0F14] text-[10px] font-bold flex items-center justify-center">
                    {pendingClaimsCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom — profile + logout */}
        <div className="p-3 border-t border-[var(--color-bg-border)]">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <Avatar src={profile?.avatar_url} fallback={profile?.full_name ?? 'A'} size={32} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{profile?.email}</p>
            </div>
          </div>
          <form action={logout}>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[var(--color-bg-elevated)] rounded-[var(--radius-sm)] transition-colors">
              <LogOut size={14} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden flex items-center bg-[var(--color-bg-surface)] border-b border-[var(--color-bg-border)] px-4 h-14 gap-4 overflow-x-auto">
        <Link href="/" className="font-[var(--font-display)] text-lg text-[var(--color-text-primary)] shrink-0">LOFO</Link>
        {navItems.map(({ href, icon: Icon }) => (
          <Link key={href} href={href} className={`p-2 rounded transition-colors ${pathname.startsWith(href) ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
            <Icon size={18} />
          </Link>
        ))}
      </div>
    </>
  )
}
