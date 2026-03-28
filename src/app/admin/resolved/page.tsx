import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRelative } from '@/utils/formatDate'

export const metadata: Metadata = { title: 'Admin — Resolved Items' }

export default async function AdminResolvedPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('resolved_items')
    .select(`*,
      items:item_id(id, title, type),
      finder:finder_id(id, full_name, email),
      claimer:claimer_id(id, full_name, email)
    `)
    .order('resolved_at', { ascending: false })
    .limit(50)

  const resolved = data ?? []

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)] mb-6">Resolved Items ({resolved.length})</h1>
      <div className="space-y-2">
        {resolved.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] py-10 text-center">No resolved items yet.</p>
        ) : resolved.map((r: Record<string, unknown>) => (
          <div key={r.id as string} className="flex items-center gap-4 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)]">
            <div className="flex-1 min-w-0">
              <Link href={`/items/${(r.items as Record<string, unknown>)?.id as string}`} className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] truncate block transition-colors">
                {(r.items as Record<string, unknown>)?.title as string}
              </Link>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                <span>🙌 Finder: <span className="text-[var(--color-text-secondary)]">{(r.finder as Record<string, unknown>)?.full_name as string}</span></span>
                <span>→</span>
                <span>😊 Claimer: <span className="text-[var(--color-text-secondary)]">{(r.claimer as Record<string, unknown>)?.full_name as string}</span></span>
              </div>
            </div>
            <span className="text-xs text-green-400 shrink-0">{formatRelative(r.resolved_at as string)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
