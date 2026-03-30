import { createClient } from '@/lib/supabase/server'
import { ItemGrid } from '@/components/items/ItemGrid'
import type { PublicItem, Profile, Category, ItemFilters as Filters } from '@/types'

async function getItems(filters: Filters): Promise<(PublicItem & { profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>; categories?: Pick<Category, 'id' | 'name'> })[]> {
  const supabase = await createClient()

  let query = supabase
    .from('public_items')
    .select(`*, profiles(id, full_name, avatar_url), categories(id, name)`)

  if (filters.type) query = query.eq('type', filters.type)
  
  if (filters.status === 'claimed') {
    query = query.in('status', ['claimed', 'resolved'])
  } else {
    query = query.eq('status', 'active')
  }

  if (filters.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('name', filters.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (filters.q) query = query.ilike('title', `%${filters.q}%`)

  query = query.order('created_at', { ascending: filters.sort === 'oldest' }).limit(48)

  const { data } = await query
  return (data as (PublicItem & { profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>; categories?: Pick<Category, 'id' | 'name'> })[]) ?? []
}

export async function BrowseItemsGrid({ filters }: { filters: Filters }) {
  const items = await getItems(filters)

  return (
    <>
      <div className="mb-6">
        <p className="text-[var(--color-text-muted)] text-sm font-medium tracking-wide uppercase">
          {items.length} item{items.length !== 1 ? 's' : ''} discovered
        </p>
      </div>
      <ItemGrid
        items={items}
        emptyMessage="No items match your filters. Try adjusting your search."
      />
    </>
  )
}
