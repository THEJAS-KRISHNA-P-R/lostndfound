'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Pencil } from 'lucide-react'
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
  editable?: boolean
}

export function ItemCard({ item, editable }: ItemCardProps) {
  const thumbnail = item.images?.[0] ?? null
  const username = item.profiles?.full_name ?? 'Anonymous'

  return (
    <div className="group/card flex flex-col h-full bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-[0_8px_32px_rgba(245,166,35,0.15),0_0_12px_rgba(245,166,35,0.1)] hover:-translate-y-1">
      {/* Image Area - Link to Detail */}
      <Link href={`/items/${item.id}`} className="aspect-square relative overflow-hidden bg-[var(--color-bg-elevated)] block">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20">📦</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <TypeBadge type={item.type} />
        </div>
        {item.status !== 'active' && (
          <div className="absolute top-2 left-2">
            <StatusBadge status={item.status} />
          </div>
        )}
      </Link>

      {/* Edit Button - Dedicated space between Image and Content if editable */}
      {editable && item.status === 'active' && (
        <div className="px-3 pt-3">
          <Link 
            href={`/edit/${item.id}`}
            className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-sm)] text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-primary)] hover:bg-[var(--color-accent)] hover:text-[#0D0F14] hover:border-[var(--color-accent)] transition-all shadow-sm"
          >
            <Pencil size={12} />
            Edit Post
          </Link>
        </div>
      )}

      {/* Content Area - Link to Detail */}
      <Link href={`/items/${item.id}`} className="p-3 space-y-2 flex-1 block">
        {/* User */}
        <div className="flex items-center gap-1.5">
          <Avatar src={item.profiles?.avatar_url} fallback={username} size={24} />
          <span className="text-[11px] text-[var(--color-text-muted)] truncate">{username}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-2 group-hover/card:text-[var(--color-accent)] transition-colors">
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
      </Link>
    </div>
  )
}
