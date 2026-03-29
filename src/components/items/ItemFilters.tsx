'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ModeToggle } from './ModeToggle'
import { SearchBar } from '@/components/ui/SearchBar'
import { Dropdown } from '@/components/ui/Dropdown'
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
    <div className="space-y-6">
      {/* Tier 1: Primary Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
        <div className="flex-none">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 ml-1">Type</span>
          <ModeToggle />
        </div>
        
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 ml-1">Search Database</span>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search titles, descriptions, IDs..."
            className="w-full"
          />
        </div>
        <input
          className="sr-only"
          onKeyDown={handleSearchSubmit}
          value={search}
          onChange={() => {}}
        />
      </div>

      {/* Tier 2: Refined Filters (Dropdowns) */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--color-bg-border)]/50">
        <Dropdown
          label="Category"
          value={activeCategory}
          onChange={(val) => update('category', val)}
          options={[
            { label: 'All Categories', value: 'all' },
            ...CATEGORIES.map(c => ({ label: c, value: c }))
          ]}
          className="w-full sm:w-[200px]"
        />
        
        <Dropdown
          label="Sort Order"
          value={activeSort}
          onChange={(val) => update('sort', val)}
          options={[
            { label: 'Latest First', value: 'latest' },
            { label: 'Oldest First', value: 'oldest' },
          ]}
          className="w-full sm:w-[160px]"
        />

        {/* Active Filter Indicators (Optional cleanup button) */}
        {(activeCategory !== 'all' || activeSort !== 'latest' || search) && (
          <button 
            onClick={() => {
              setSearch('')
              const params = new URLSearchParams()
              router.push('/browse', { scroll: false })
            }}
            className="mt-4 sm:mt-0 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            Clear all filters
          </button>
        )}
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
