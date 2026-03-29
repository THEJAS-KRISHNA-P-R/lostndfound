import Link from 'next/link'
import { Package, FileCheck, Users, CheckSquare, ArrowRight, Timer, TrendingUp, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  
  const [items, pending, users, resolved, stale, flagged] = await Promise.all([
    supabase.from('items').select('*', { count: 'exact', head: true }),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending').lt('created_at', fortyEightHoursAgo),
    supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'flagged'),
  ])

  const total = (items.count ?? 0)
  const resolvedCount = resolved.count ?? 0
  const returnRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0

  return {
    totalItems: total,
    pendingClaims: pending.count ?? 0,
    totalUsers: users.count ?? 0,
    resolvedCount,
    staleClaims: stale.count ?? 0,
    flaggedItems: flagged.count ?? 0,
    returnRate
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total Items',    value: stats.totalItems,   icon: Package,    href: '/admin/items',    color: 'text-blue-400',  bg: 'bg-blue-950/50' },
    { label: 'Pending Claims', value: stats.pendingClaims,icon: FileCheck,   href: '/admin/claims',   color: 'text-purple-400', bg: 'bg-purple-950/50', urgent: stats.pendingClaims > 0 },
    { label: 'Total Users',    value: stats.totalUsers,   icon: Users,       href: '/admin/users',    color: 'text-cyan-400',bg: 'bg-cyan-950/50' },
    { label: 'Resolved',       value: stats.resolvedCount,icon: CheckSquare, href: '/admin/resolved', color: 'text-green-400', bg: 'bg-green-950/50' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-10">
      <div>
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)] mb-1">Command Center</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Operations overview for LOFO Campus.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, href, color, bg, urgent }) => (
          <Link
            key={label}
            href={href}
            className={`group bg-[var(--color-bg-surface)] border rounded-[var(--radius-lg)] p-5 transition-all hover:shadow-xl hover:-translate-y-1 ${urgent ? 'border-purple-600/30 ring-1 ring-purple-600/10' : 'border-[var(--color-bg-border)] hover:border-[var(--color-accent)]'}`}
          >
            <div className={`w-10 h-10 ${bg} rounded-[var(--radius-sm)] flex items-center justify-center mb-3 border border-white/5`}>
              <Icon size={20} className={color} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
              </div>
              <ArrowRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* Metrics Row — Secondary Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--color-bg-surface)] border border-amber-500/20 rounded-[var(--radius-lg)] p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          <div className="w-12 h-12 bg-amber-950/40 rounded-full flex items-center justify-center border border-amber-800/30 text-amber-400">
            <Timer size={24} />
          </div>
          <div>
             <p className="text-xl font-bold text-amber-400">{stats.staleClaims}</p>
             <p className="text-xs text-[var(--color-text-muted)] font-medium">Stale Claims (&gt;48h)</p>
          </div>
        </div>

        <div className="bg-[var(--color-bg-surface)] border border-green-500/20 rounded-[var(--radius-lg)] p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-green-500/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          <div className="w-12 h-12 bg-green-950/40 rounded-full flex items-center justify-center border border-green-800/30 text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
             <p className="text-xl font-bold text-green-400">{stats.returnRate}%</p>
             <p className="text-xs text-[var(--color-text-muted)] font-medium">Resolution Efficiency</p>
          </div>
        </div>

        <div className="bg-[var(--color-bg-surface)] border border-blue-500/20 rounded-[var(--radius-lg)] p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          <div className="w-12 h-12 bg-blue-950/40 rounded-full flex items-center justify-center border border-blue-800/30 text-blue-400">
            <AlertTriangle size={24} />
          </div>
          <div>
             <p className="text-xl font-bold text-blue-400">{stats.flaggedItems}</p>
             <p className="text-xs text-[var(--color-text-muted)] font-medium">Flagged for Escalation</p>
          </div>
        </div>
      </div>

      {/* Advanced Control Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Flags */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Urgent Escalations
               </h2>
               <Link href="/admin/items?status=flagged" className="text-xs text-[var(--color-accent)] font-medium hover:underline">View All</Link>
            </div>
            {stats.flaggedItems === 0 ? (
               <div className="py-8 text-center bg-[var(--color-bg-surface)] border border-dashed border-[var(--color-bg-border)] rounded-[var(--radius-lg)]">
                  <p className="text-xs text-[var(--color-text-muted)]">No items currently flagged for escalation.</p>
               </div>
            ) : (
               <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] overflow-hidden">
                  <Link href="/admin/items?status=flagged" className="block p-4 hover:bg-[var(--color-bg-elevated)] transition-colors group">
                     <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Escalation Queue active</p>
                     <p className="text-xs text-[var(--color-text-muted)]">{stats.flaggedItems} items require security desk assignment or review.</p>
                  </Link>
               </div>
            )}
         </div>

         {/* Quick Actions */}
         <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Priority Controls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {[
                  { href: '/admin/claims', label: 'Review Claims', sub: `${stats.pendingClaims} pending` },
                  { href: '/admin/items', label: 'Inventory', sub: 'Manage all posts' },
                  { href: '/admin/users', label: 'Access Control', sub: 'Manage profiles' },
                  { href: '/admin/notify', label: 'Broadcast', sub: 'System alerts' },
               ].map(({ href, label, sub }) => (
                  <Link
                  key={href}
                  href={href}
                  className="p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] group hover:border-[var(--color-accent)] transition-all flex flex-col justify-between h-24"
                  >
                  <p className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">{label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-tight">{sub}</p>
                    <div className="bg-[var(--color-bg-surface)] p-1 rounded-full border border-[var(--color-bg-border)] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:border-[var(--color-accent)] transition-all">
                       <ArrowRight size={12} />
                    </div>
                  </div>
                  </Link>
               ))}
            </div>
         </div>
      </div>
    </div>
  )
}
