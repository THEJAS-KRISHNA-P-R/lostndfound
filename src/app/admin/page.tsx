import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, FileCheck, Users, CheckSquare, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Admin Dashboard' }

async function getStats() {
  const supabase = await createClient()
  const [items, pending, users, resolved] = await Promise.all([
    supabase.from('items').select('*', { count: 'exact', head: true }),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('resolved_items').select('*', { count: 'exact', head: true }),
  ])
  return {
    totalItems: items.count ?? 0,
    pendingClaims: pending.count ?? 0,
    totalUsers: users.count ?? 0,
    resolvedCount: resolved.count ?? 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total Items',    value: stats.totalItems,   icon: Package,    href: '/admin/items',    color: 'text-blue-400',  bg: 'bg-blue-950' },
    { label: 'Pending Claims', value: stats.pendingClaims,icon: FileCheck,   href: '/admin/claims',   color: 'text-amber-400', bg: 'bg-amber-950', urgent: stats.pendingClaims > 0 },
    { label: 'Total Users',    value: stats.totalUsers,   icon: Users,       href: '/admin/users',    color: 'text-purple-400',bg: 'bg-purple-950' },
    { label: 'Resolved',       value: stats.resolvedCount,icon: CheckSquare, href: '/admin/resolved', color: 'text-green-400', bg: 'bg-green-950' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)] mb-2">Dashboard</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Welcome back, admin.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, href, color, bg, urgent }) => (
          <Link
            key={label}
            href={href}
            className={`group bg-[var(--color-bg-surface)] border rounded-[var(--radius-lg)] p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 ${urgent ? 'border-amber-700' : 'border-[var(--color-bg-border)] hover:border-[var(--color-accent)]'}`}
          >
            <div className={`w-10 h-10 ${bg} rounded-[var(--radius-sm)] flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
            {urgent && <p className="text-xs text-amber-400 mt-1 font-medium">Needs review</p>}
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/admin/claims', label: 'Review Pending Claims', desc: `${stats.pendingClaims} awaiting review` },
            { href: '/admin/items', label: 'Manage All Items', desc: `${stats.totalItems} items posted` },
            { href: '/admin/users', label: 'View All Users', desc: `${stats.totalUsers} registered` },
            { href: '/admin/notify', label: 'Send Notification', desc: 'Broadcast to users' },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] group hover:border-[var(--color-accent)] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">{label}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
