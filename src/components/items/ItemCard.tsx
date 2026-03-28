import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { TypeBadge, StatusBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelative } from '@/utils/formatDate'
import type { PublicItem, Profile, Category } from '@/types'

type ItemWithRelations = PublicItem & {
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  categories?: Pick<Category, 'id' | 'name'>
}

interface ItemCardProps {
  item: ItemWithRelations
}

export function ItemCard({ item }: ItemCardProps) {
  const thumbnail = item.images?.[0] ?? null
  const username = item.profiles?.full_name ?? 'Anonymous'

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] overflow-hidden transition-all duration-200 hover:border-[var(--color-accent)] hover:shadow-[0_4px_24px_rgba(245,166,35,0.10)] hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-[var(--color-bg-elevated)]">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20">📦</span>
          </div>
        )}
        {/* Type badge overlay */}
        <div className="absolute top-2 right-2">
          <TypeBadge type={item.type} />
        </div>
        {/* Status — only show if not active */}
        {item.status !== 'active' && (
          <div className="absolute top-2 left-2">
            <StatusBadge status={item.status} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* User */}
        <div className="flex items-center gap-1.5">
          <Avatar src={item.profiles?.avatar_url} fallback={username} size={24} />
          <span className="text-[11px] text-[var(--color-text-muted)] truncate">{username}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between pt-1">
          {item.categories && (
            <span className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-2 py-0.5 rounded-full">
              {item.categories.name}
            </span>
          )}
          <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] ml-auto">
            <Clock size={10} />
            {formatRelative(item.created_at)}
          </div>
        </div>
      </div>
    </Link>
  )
}
