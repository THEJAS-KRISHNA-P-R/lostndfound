import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TypeBadge, StatusBadge } from '@/components/ui/Badge'
import { formatRelative } from '@/utils/formatDate'
import type { Item, Profile, Category } from '@/types'

export const metadata: Metadata = { title: 'Admin — Items' }

type AdminItem = Item & {
  profiles?: Pick<Profile, 'id' | 'full_name'>
  categories?: Pick<Category, 'id' | 'name'>
}

export default async function AdminItemsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('items')
    .select(`*, profiles(id, full_name), categories(id, name)`)
    .order('created_at', { ascending: false })
    .limit(100)

  const items = (data as AdminItem[]) ?? []

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)]">All Items ({items.length})</h1>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm py-10 text-center">No items found.</p>
        ) : items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-3 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)]">
            <div className="relative w-12 h-12 shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-elevated)]">
              {item.images?.[0] ? <Image src={item.images[0]} alt={item.title} fill className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-xl opacity-20">📦</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={item.type} />
                <StatusBadge status={item.status} />
                {item.categories && <span className="text-[10px] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)]">{item.categories.name}</span>}
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate mt-1">{item.title}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{item.profiles?.full_name} · {formatRelative(item.created_at)}</p>
            </div>
            <Link href={`/items/${item.id}`} className="shrink-0 text-xs text-[var(--color-accent)] hover:underline px-3">View</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
