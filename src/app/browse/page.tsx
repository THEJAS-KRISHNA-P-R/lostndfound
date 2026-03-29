import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ItemGrid } from '@/components/items/ItemGrid'
import { ItemFilters } from '@/components/items/ItemFilters'
import { PageShell } from '@/components/layout/PageShell'
import type { PublicItem, Profile, Category, ItemFilters as Filters } from '@/types'

export const metadata: Metadata = {
  title: 'Browse Items',
  description: 'Browse all lost and found items on LOFO. Filter by type, category, and more.',
}

async function getItems(filters: Filters): Promise<(PublicItem & { profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>; categories?: Pick<Category, 'id' | 'name'> })[]> {
  const supabase = await createClient()

  let query = supabase
    .from('public_items')
    .select(`*, profiles(id, full_name, avatar_url), categories(id, name)`)

  if (filters.type) query = query.eq('type', filters.type)
  
  // Handle Status Gallery
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

interface BrowsePageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const filters: Filters = {
    type: (params.type as 'lost' | 'found') || undefined,
    category: params.category || undefined,
    status: (params.status as 'active' | 'claimed') || 'active',
    q: params.q || undefined,
    sort: (params.sort as 'latest' | 'oldest') || 'latest',
  }

  const items = await getItems(filters)

  return (
    <PageShell>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-12 pb-24 md:pb-12">
          <div className="mb-12 text-center">
            <h1 className="font-[var(--font-display)] text-4xl md:text-5xl text-[var(--color-text-primary)] mb-3 tracking-tight">
              Browse <span className="text-[var(--color-accent)]">Database</span>
            </h1>
            <div className="h-1 w-24 bg-[var(--color-accent)] mx-auto rounded-full mb-4 opacity-80" />
            <p className="text-[var(--color-text-muted)] text-sm font-medium tracking-wide uppercase">
              {items.length} item{items.length !== 1 ? 's' : ''} discovered
            </p>
          </div>
          {/* Filters — Client Component */}
          <div className="mb-12">
            <ItemFilters />
          </div>
          {/* Grid — Server Component data */}
          <ItemGrid
            items={items}
            emptyMessage="No items match your filters. Try adjusting your search."
          />
        </main>
        <Footer />
      </div>
    </PageShell>
  )
}
