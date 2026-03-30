import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { ItemFilters } from '@/components/items/ItemFilters'
import { PageShell } from '@/components/layout/PageShell'
import { BrowseItemsGrid } from '@/components/browse/BrowseItemsGrid'
import { ItemGridSkeleton } from '@/components/ui/Skeleton'
import type { ItemFilters as Filters } from '@/types'

// Lazy load footer
const Footer = dynamic(() => import('@/components/layout/Footer').then(mod => mod.Footer))

export const metadata: Metadata = {
  title: 'Browse Items',
  description: 'Browse all lost and found items on LOFO. Filter by type, category, and more.',
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

  // Key is required to re-trigger Suspense on filter change
  const gridKey = JSON.stringify(filters)

  return (
    <PageShell>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-12 pb-24 md:pb-12">
          <div className="mb-12 text-center">
            <h1 className="font-[var(--font-display)] text-4xl md:text-5xl text-[var(--color-text-primary)] mb-3 tracking-tight">
              Browse <span className="text-[var(--color-accent)]">Database</span>
            </h1>
            <div className="h-1 w-24 bg-[var(--color-accent)] mx-auto rounded-full mb-8 opacity-80" />
          </div>

          <div className="mb-12">
            <ItemFilters />
          </div>

          <Suspense key={gridKey} fallback={<ItemGridSkeleton count={9} />}>
            <BrowseItemsGrid filters={filters} />
          </Suspense>
        </main>
        <Footer />
      </div>
    </PageShell>
  )
}

