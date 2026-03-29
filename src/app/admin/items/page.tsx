import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'
import { TypeBadge, StatusBadge } from '@/components/ui/Badge'
import { formatRelative } from '@/utils/formatDate'
import { SecurityDeskAssign } from '@/components/admin/SecurityDeskAssign'
import { BulkArchiveButton } from '@/components/admin/BulkArchiveButton'
import type { Item, Profile, Category } from '@/types'

export const metadata: Metadata = { title: 'Admin — Items' }

type AdminItem = Item & {
  profiles?: Pick<Profile, 'id' | 'full_name'>
  categories?: Pick<Category, 'id' | 'name'>
  security_location?: string | null
}

export default async function AdminItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const filterStatus = sp.status

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Access Denied.</div>
  }

  // Use service role to see all items including private fields
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  let query = admin
    .from('items')
    .select(`*, profiles(id, full_name), categories(id, name), security_location`)
    .order('created_at', { ascending: false })

  if (filterStatus) query = query.eq('status', filterStatus)

  const { data } = await query.limit(100)
  const items = (data as AdminItem[]) ?? []
  const flagged = items.filter(i => i.status === 'flagged')
  const rest = items.filter(i => i.status !== 'flagged')

  const statuses = ['all', 'active', 'flagged', 'claimed', 'resolved', 'archived'] as const

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)]">
          All Items
        </h1>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <a key={s} href={s === 'all' ? '/admin/items' : `/admin/items?status=${s}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition-colors ${(!filterStatus && s === 'all') || filterStatus === s ? 'bg-[var(--color-accent)] text-[#0D0F14] border-[var(--color-accent)]' : s === 'flagged' ? 'border-amber-700 text-amber-400 hover:bg-amber-950/30' : 'border-[var(--color-bg-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
              {s}
            </a>
          ))}
        </div>
      </div>

      {/* Flagged — Needs Attention */}
      {!filterStatus && flagged.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-sm font-bold text-amber-400 uppercase tracking-wider flex-1">Needs Attention ({flagged.length})</p>
            <BulkArchiveButton count={flagged.length} />
          </div>
          <div className="space-y-2">
            {flagged.map(item => <ItemRow key={item.id} item={item} highlight />)}
          </div>
        </div>
      )}

      {/* All other items */}
      <div className="space-y-2">
        {(filterStatus ? items : rest).length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm py-10 text-center">No items found.</p>
        ) : (filterStatus ? items : rest).map(item => <ItemRow key={item.id} item={item} />)}
      </div>
    </div>
  )
}

function ItemRow({ item, highlight }: { item: AdminItem; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-3 bg-[var(--color-bg-surface)] border rounded-[var(--radius-md)] ${highlight ? 'border-amber-800/60 bg-amber-950/10' : 'border-[var(--color-bg-border)]'}`}>
      <div className="relative w-12 h-12 shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-elevated)]">
        {item.images?.[0]
          ? <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
          : <span className="absolute inset-0 flex items-center justify-center text-xl opacity-20">📦</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
          {item.categories && <span className="text-[10px] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)]">{item.categories.name}</span>}
          {item.security_location && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-800/50 text-blue-400">🏢 {item.security_location}</span>
          )}
        </div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate mt-1">{item.title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{item.profiles?.full_name} · {formatRelative(item.created_at)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {item.status === 'flagged' && <SecurityDeskAssign itemId={item.id} currentLocation={item.security_location} />}
        <Link href={`/items/${item.id}`} className="text-xs text-[var(--color-accent)] hover:underline px-2">View</Link>
      </div>
    </div>
  )
}
