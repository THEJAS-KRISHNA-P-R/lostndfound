import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ClaimReviewCard } from '@/components/admin/ClaimReviewCard'
import type { Claim, Profile, Item } from '@/types'

export const metadata: Metadata = { title: 'Admin — Claims' }

type FullClaim = Claim & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone' | 'uni_reg_no' | 'avatar_url'>
  items: Pick<Item, 'id' | 'title' | 'type' | 'images' | 'status'>
}

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const filterStatus = sp.status ?? 'pending'

  const supabase = await createClient()
  let query = supabase
    .from('claims')
    .select(`*, profiles(id, full_name, email, phone, uni_reg_no, avatar_url), items(id, title, type, images, status)`)
    .order('created_at', { ascending: false })

  if (filterStatus !== 'all') query = query.eq('status', filterStatus)

  const { data } = await query.limit(50)
  const claims = (data as FullClaim[]) ?? []

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)]">
          Claims
        </h1>
        <div className="flex gap-1.5">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(s => (
            <a
              key={s}
              href={`/admin/claims?status=${s}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border capitalize ${filterStatus === s ? 'bg-[var(--color-accent)] text-[#0D0F14] border-[var(--color-accent)]' : 'border-[var(--color-bg-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <span className="text-4xl opacity-20">✅</span>
          <p className="text-sm text-[var(--color-text-muted)]">No {filterStatus === 'all' ? '' : filterStatus} claims.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {claims.map(claim => <ClaimReviewCard key={claim.id} claim={claim} />)}
        </div>
      )}
    </div>
  )
}
