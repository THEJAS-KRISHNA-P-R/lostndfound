import type { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'
import { ClaimReviewCard } from '@/components/admin/ClaimReviewCard'
import type { Claim, Profile, Item } from '@/types'

export const metadata: Metadata = { title: 'Admin — Interaction Reviews' }

type FullClaim = Claim & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone' | 'uni_reg_no' | 'avatar_url'>
  items: Pick<Item, 'id' | 'title' | 'type' | 'images' | 'status' | 'private_details'>
}

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const filterStatus = sp.status ?? 'pending'

  // Auth check via regular client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-medium">Access Denied: Admin privileges required.</div>
  }

  // Service-role client — bypasses RLS to access private_details
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  let query = admin
    .from('claims')
    .select(`*, profiles:claimer_id(id, full_name, email, phone, uni_reg_no, avatar_url), items(id, title, type, images, status, private_details)`)
    .order('created_at', { ascending: false })

  if (filterStatus !== 'all') query = query.eq('status', filterStatus)

  const { data, error } = await query.limit(50)
  if (error) console.error('Admin Claims Fetch Error:', error)

  // Generate signed URLs for proof images
  const rawClaims = (data as FullClaim[]) ?? []
  const claims = await Promise.all(rawClaims.map(async (claim) => {
    if (claim.proof_images && claim.proof_images.length > 0) {
      const { data: signed } = await admin.storage
        .from('proof-images')
        .createSignedUrls(claim.proof_images, 3600)
      return {
        ...claim,
        proof_images: signed?.map(d => d.signedUrl).filter(Boolean) as string[] ?? []
      }
    }
    return claim
  }))

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)]">
          Interaction Reviews
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
          <p className="text-sm text-[var(--color-text-muted)]">No {filterStatus === 'all' ? '' : filterStatus} submissions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {claims.map(claim => (
            <ClaimReviewCard
              key={claim.id}
              claim={claim}
              privateDetails={claim.items?.private_details}
            />
          ))}
        </div>
      )}
    </div>
  )
}
