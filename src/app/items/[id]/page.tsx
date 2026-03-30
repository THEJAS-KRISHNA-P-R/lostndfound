import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { TypeBadge, StatusBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatFull, formatRelative } from '@/utils/formatDate'
import type { Item, Profile, Category, Claim } from '@/types'
import { ImageCarousel } from '@/components/items/ImageCarousel'
import { HandoverPanel } from '@/components/items/HandoverPanel'
import { AdminActions } from '@/components/items/AdminActions'
import { DeleteItemButton } from '@/components/items/DeleteItemButton'
import { ItemActionButtons } from '@/components/items/ItemActionButtons'

type FullItem = Item & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email'>
  categories?: Pick<Category, 'id' | 'name'>
}
type ClaimWithProfile = Claim & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'uni_reg_no' | 'avatar_url'>
}

interface ItemDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ItemDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('items').select('title, description').eq('id', id).single()
  if (!data) return { title: 'Item Not Found' }
  return {
    title: data.title,
    description: data.description ?? `View this ${data.title} on LOFO`,
    openGraph: { title: data.title, description: data.description ?? '' },
  }
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get profile for role check
  let userProfile: { id: string; role: string } | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
    userProfile = data
  }

  const { data: item } = await supabase
    .from('items')
    .select(`*, profiles(id, full_name, avatar_url, email), categories(id, name)`)
    .eq('id', id)
    .single()

  if (!item) notFound()

  const typedItem = item as FullItem
  const isOwner = user?.id === typedItem.user_id
  const isAdmin = userProfile?.role === 'admin'
  const canSeePrivate = isOwner || isAdmin
  const canClaim = !!user && !isOwner && !isAdmin && typedItem.status === 'active'

  // Get claims for owner/admin view
  let claims: ClaimWithProfile[] = []
  if (isOwner || isAdmin) {
    const { data } = await supabase
      .from('claims')
      .select(`*, profiles(id, full_name, uni_reg_no, avatar_url)`)
      .eq('item_id', id)
      .order('created_at', { ascending: false })
    claims = (data as ClaimWithProfile[]) ?? []
  }

  // Get approved claim for handover panel (shown to both parties)
  let approvedClaim: { id: string; poster_confirmed_at: string | null; claimer_confirmed_at: string | null; claimer_id: string } | null = null
  if (user && typedItem.status === 'claimed') {
    const { data } = await supabase
      .from('claims')
      .select('id, poster_confirmed_at, claimer_confirmed_at, claimer_id')
      .eq('item_id', id)
      .eq('status', 'approved')
      .maybeSingle()
    approvedClaim = data
  }

  return (
    <PageShell>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-24 md:pb-8">
        {/* Back */}
        <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Browse
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ── Images ── */}
          <ImageCarousel images={typedItem.images ?? []} title={typedItem.title} />

          {/* ── Details ── */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={typedItem.type} />
              <StatusBadge status={typedItem.status} />
              {typedItem.categories && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] text-[var(--color-text-muted)]">
                  {typedItem.categories.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)] leading-tight">
              {typedItem.title}
            </h1>

            {/* Description */}
            {typedItem.description && (
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">
                {typedItem.description}
              </p>
            )}

            {/* Posted by */}
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-bg-border)]">
              <Avatar src={typedItem.profiles?.avatar_url} fallback={typedItem.profiles?.full_name ?? 'U'} size={40} />
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{typedItem.profiles?.full_name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Posted {formatRelative(typedItem.created_at)}</p>
              </div>
            </div>

            {/* Private box */}
            {canSeePrivate && (
              <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-accent)] border-opacity-30 rounded-[var(--radius-md)] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[var(--color-accent)]" />
                  <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wide">Private Details</span>
                  {isAdmin && <span className="text-[10px] text-[var(--color-text-muted)] ml-1">(Admin view)</span>}
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {typedItem.location && (
                    <div className="flex items-start gap-2 text-[var(--color-text-secondary)]">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
                      <span>{typedItem.location}</span>
                    </div>
                  )}
                  {typedItem.date_occurred && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <Calendar size={14} className="text-[var(--color-text-muted)]" />
                      <span>{formatFull(typedItem.date_occurred)}{typedItem.time_occurred && ` at ${typedItem.time_occurred.slice(0, 5)}`}</span>
                    </div>
                  )}
                  {typedItem.private_details && (
                    <div className="mt-2 p-3 bg-[var(--color-bg-surface)] rounded-[var(--radius-sm)] text-xs text-[var(--color-text-secondary)] leading-relaxed border border-[var(--color-bg-border)]">
                       {typedItem.private_details}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edit / Claim button */}
            {isOwner && typedItem.status === 'active' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link href={`/edit/${typedItem.id}`} className="w-full">
                  <Button fullWidth size="lg">Edit Post</Button>
                </Link>
                <DeleteItemButton itemId={typedItem.id} title={typedItem.title} />
              </div>
            )}
            
            {/* Admin Command Center */}
            {!isOwner && isAdmin && (
              <AdminActions itemId={typedItem.id} itemTitle={typedItem.title} />
            )}
            {canClaim && (
              <ItemActionButtons itemId={typedItem.id} itemType={typedItem.type as 'lost' | 'found'} />
            )}
            {typedItem.status !== 'active' && !isOwner && !isAdmin && (
              <div className="text-center text-sm text-[var(--color-text-muted)] py-3 border border-[var(--color-bg-border)] rounded-[var(--radius-md)]">
                This item is no longer available for claims.
              </div>
            )}
            {!user && typedItem.status === 'active' && (
              <Link href={`/login?next=/items/${id}`}>
                <Button variant="outline" fullWidth>
                  {typedItem.type === 'found' ? 'Sign in to claim this item' : "Sign in: I've found this"}
                </Button>
              </Link>
            )}

            {/* Handover confirmation — shown after admin approval to both parties */}
            {approvedClaim && (isOwner || user?.id === approvedClaim.claimer_id) && (
              <HandoverPanel
                claimId={approvedClaim.id}
                isItemOwner={isOwner}
                posterConfirmed={!!approvedClaim.poster_confirmed_at}
                claimerConfirmed={!!approvedClaim.claimer_confirmed_at}
              />
            )}
          </div>
        </div>

        {/* ── Claims section (owner/admin read-only) ── */}
        {(isOwner || isAdmin) && claims.length > 0 && (
          <div className="mt-12">
            <h2 className="font-[var(--font-display)] text-xl text-[var(--color-text-primary)] mb-4">
              Claim Requests ({claims.length})
            </h2>
            <div className="space-y-3">
              {claims.map(claim => (
                <div key={claim.id} className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <Image 
                        src={claim.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${claim.profiles?.full_name}`} 
                        alt="Avatar" 
                        width={40}
                        height={40}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">{claim.profiles?.full_name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">·</span>
                        <span className="text-xs text-[var(--color-text-muted)] font-mono">{claim.profiles?.uni_reg_no}</span>
                        <StatusBadge status={claim.status} />
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{claim.description}</p>
                      {isAdmin && (
                        <Link href="/admin/claims" className="text-xs text-[var(--color-accent)] hover:underline mt-1 inline-block">
                          Review in Admin Panel →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </PageShell>
  )
}
