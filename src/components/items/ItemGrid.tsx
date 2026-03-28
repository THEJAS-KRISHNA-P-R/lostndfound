import { PackageSearch } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { ItemCard } from './ItemCard'
import type { PublicItem, Profile, Category } from '@/types'

type ItemWithRelations = PublicItem & {
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  categories?: Pick<Category, 'id' | 'name'>
}

interface ItemGridProps {
  items: ItemWithRelations[]
  loading?: boolean
  emptyMessage?: string
  emptyCta?: React.ReactNode
}

export function ItemGrid({ items, loading, emptyMessage = 'No items found.', emptyCta }: ItemGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Skeleton variant="card" count={8} />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <PackageSearch size={48} className="text-[var(--color-text-muted)]" strokeWidth={1.2} />
        <p className="text-[var(--color-text-muted)] text-sm">{emptyMessage}</p>
        {emptyCta}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
