import Link from 'next/link'
import { ArrowRight, MapPin, Shield, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ItemGrid } from '@/components/items/ItemGrid'
import type { PublicItem, Profile, Category } from '@/types'
import type { Metadata } from 'next'
import { MagicRingsClient } from '@/components/ui/MagicRingsClient'

export const metadata: Metadata = {
  title: "LOFO — Find What's Yours",
  description: 'A university campus lost and found platform. Post lost or found items, connect with your community.',
}

const features = [
  { icon: MapPin, title: 'Location-Based', desc: 'Items tagged to specific campus locations for faster recovery.' },
  { icon: Shield, title: 'Verified Claims', desc: 'Admins verify every claim using private details only the owner would know.' },
  { icon: Zap, title: 'Post in Seconds', desc: 'Snap a photo, add a description, and post instantly from any device.' },
]

async function getRecentItems(): Promise<(PublicItem & { profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>; categories?: Pick<Category, 'id' | 'name'> })[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('public_items')
    .select(`*, profiles(id, full_name, avatar_url), categories(id, name)`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)
  return (data as (PublicItem & { profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>; categories?: Pick<Category, 'id' | 'name'> })[]) ?? []
}

export default async function LandingPage() {
  const recentItems = await getRecentItems()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100dvh-60px)] flex items-center justify-center overflow-hidden">
        {/* MagicRings background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <MagicRingsClient
            color="#ffbb00ff"
            colorTwo="#ff8400ff"
            ringCount={6}
            speed={0.6}
            attenuation={10}
            lineThickness={2}
            baseRadius={0.56}
            radiusStep={0.18}
            scaleRate={0.08}
            opacity={1}
            blur={0}
            ringGap={1.8}
            fadeIn={0.7}
            fadeOut={0.5}
            followMouse={false}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          <h1 className="font-[var(--font-display)] text-5xl md:text-7xl text-[var(--color-text-primary)] leading-tight mb-6">
            Lost something?
            <br />
            <span className="text-[var(--color-accent)]">We&apos;ll find it.</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg md:text-xl mb-10 leading-relaxed">
            LOFO is your campus lost &amp; found — post items you&apos;ve found, report what you&apos;ve lost,
            and let your community help reunite people with their belongings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/browse"
              className="px-8 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#0D0F14] text-base font-semibold transition-all active:scale-95 inline-flex items-center gap-2"
            >
              Browse Items <ArrowRight size={18} />
            </Link>
            <Link
              href="/post"
              className="px-8 py-3 rounded-[var(--radius-md)] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] text-base font-semibold transition-all active:scale-95"
            >
              Post Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 md:px-8 bg-[var(--color-bg-surface)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[var(--font-display)] text-3xl text-center text-[var(--color-text-primary)] mb-12">
            How LOFO works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] p-6 hover:border-[var(--color-accent)] transition-colors group"
              >
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-accent-dim)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent-glow)] transition-colors">
                  <Icon size={20} className="text-[var(--color-accent)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Items ── */}
      {recentItems.length > 0 && (
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)]">Recently Posted</h2>
              <Link href="/browse" className="text-sm text-[var(--color-accent)] hover:underline inline-flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <ItemGrid items={recentItems} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
