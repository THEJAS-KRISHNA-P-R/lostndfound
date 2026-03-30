import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { ItemGrid } from '@/components/items/ItemGrid'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge, TypeBadge } from '@/components/ui/Badge'
import { formatRelative } from '@/utils/formatDate'
import type { Profile, PublicItem, Claim, Category } from '@/types'

export const metadata: Metadata = { title: 'My Profile' }

type ClaimWithItem = Claim & {
  items: PublicItem & { categories?: Pick<Category, 'id' | 'name'> }
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')

  const sp = await searchParams
  const tab = sp.tab === 'claims' ? 'claims' : 'posts'

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch my items
  const { data: myItemsRaw } = await supabase
    .from('public_items')
    .select(`*, profiles(id, full_name, avatar_url), categories(id, name)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const myItems = (myItemsRaw as (PublicItem & { profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>; categories?: Pick<Category, 'id' | 'name'> })[]) ?? []

  // Fetch my claims
  const { data: myClaims } = await supabase
    .from('claims')
    .select(`*, items(id, title, type, images, status, categories(id, name))`)
    .eq('claimer_id', user.id)
    .order('created_at', { ascending: false })

  const typedClaims = (myClaims as ClaimWithItem[]) ?? []

  return (
    <PageShell>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 pb-24 md:pb-8">
          {/* Profile header */}
          <div className="flex items-start gap-4 mb-8 p-5 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)]">
            <Avatar src={(profile as Profile).avatar_url} fallback={(profile as Profile).email} size={64} />
            <div className="flex-1 min-w-0">
              <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)]">{(profile as Profile).full_name}</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{(profile as Profile).email}</p>
              <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">{(profile as Profile).uni_reg_no}</p>
            </div>
            <div className="text-right text-xs text-[var(--color-text-muted)]">
              <p>{myItems.length} posts</p>
              <p>{typedClaims.length} claims</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-[var(--color-bg-border)] mb-6">
            {(['posts', 'claims'] as const).map(t => (
              <Link
                key={t}
                href={`/profile?tab=${t}`}
                className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? 'text-[var(--color-accent)] border-[var(--color-accent)]' : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-secondary)]'}`}
              >
                {t === 'posts' ? `My Posts (${myItems.length})` : `My Claims (${typedClaims.length})`}
              </Link>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'posts' ? (
            <ItemGrid
              items={myItems}
              editable
              emptyMessage="You haven't posted any items yet."
              emptyCta={
                <Link href="/post" className="px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-[#0D0F14] text-sm font-semibold">
                  Post Your First Item
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {typedClaims.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <span className="text-4xl opacity-20">🔍</span>
                  <p className="text-sm text-[var(--color-text-muted)]">No claims submitted yet.</p>
                </div>
              ) : (
                typedClaims.map(claim => (
                  <Link
                    key={claim.id}
                    href={`/items/${claim.item_id}`}
                    className="flex items-center gap-4 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] hover:border-[var(--color-accent)] transition-colors group"
                  >
                    <div className="relative w-14 h-14 shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-elevated)]">
                      {claim.items?.images?.[0] ? (
                        <div className="w-full h-full relative">
                          <Image 
                            src={claim.items.images[0]} 
                            alt={claim.items.title} 
                            fill
                            className="object-cover" 
                          />
                        </div>
                      ) : <span className="absolute inset-0 flex items-center justify-center text-xl opacity-20">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">{claim.items?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {claim.items?.type && <TypeBadge type={claim.items.type} />}
                        <StatusBadge status={claim.status} />
                      </div>
                      {claim.admin_note && <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">Admin: {claim.admin_note}</p>}
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] shrink-0">{formatRelative(claim.created_at)}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PageShell>
  )
}
