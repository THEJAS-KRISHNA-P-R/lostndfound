import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ItemGrid } from '@/components/items/ItemGrid'
import type { PublicItem, Profile, Category } from '@/types'

async function getRecentItems(): Promise<(PublicItem & { profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>; categories?: Pick<Category, 'id' | 'name'> })[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('public_items')
    .select(`*, profiles(id, full_name, avatar_url), categories(id, name)`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)
  return (data as (PublicItem & { profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>; categories?: Pick<Category, 'id' | 'name'> })[]) ?? []
}

export async function RecentItemsSection() {
  const recentItems = await getRecentItems()

  if (recentItems.length === 0) return null

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)]">Recently Posted</h2>
          <Link href="/browse" className="text-sm text-[var(--color-accent)] hover:underline inline-flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ItemGrid items={recentItems} />
      </div>
    </section>
  )
}
