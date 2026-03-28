'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ModeToggle } from './ModeToggle'
import { FilterChip } from '@/components/ui/FilterChip'
import { SearchBar } from '@/components/ui/SearchBar'
import { CATEGORIES } from '@/utils/constants'
import { Suspense, useState, useEffect } from 'react'

function ItemFiltersInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  const activeCategory = searchParams.get('category') ?? 'all'
  const activeSort = searchParams.get('sort') ?? 'latest'

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === 'latest' || !value) params.delete(key)
    else params.set(key, value)
    router.push(`/browse?${params.toString()}`, { scroll: false })
  }

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') update('q', search)
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <ModeToggle />
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search items..."
          className="flex-1 sm:max-w-xs"
        />
        <input
          className="sr-only"
          onKeyDown={handleSearchSubmit}
          value={search}
          onChange={() => {}}
        />
      </div>
      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <FilterChip label="All" active={activeCategory === 'all'} onClick={() => update('category', 'all')} />
        {CATEGORIES.map(cat => (
          <FilterChip
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => update('category', cat)}
          />
        ))}
      </div>
      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-muted)]">Sort:</span>
        <FilterChip label="Latest" active={activeSort === 'latest'} onClick={() => update('sort', 'latest')} />
        <FilterChip label="Oldest" active={activeSort === 'oldest'} onClick={() => update('sort', 'oldest')} />
      </div>
    </div>
  )
}

export function ItemFilters() {
  return (
    <Suspense fallback={null}>
      <ItemFiltersInner />
    </Suspense>
  )
}
