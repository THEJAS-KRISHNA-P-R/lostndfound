import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ClaimFormClient } from './ClaimFormClient'
import type { PublicItem, Category } from '@/types'

export const metadata: Metadata = { title: 'Submit a Claim' }

interface ClaimPageProps {
  params: Promise<{ itemId: string }>
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { itemId } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('public_items')
    .select(`*, categories(name)`)
    .eq('id', itemId)
    .eq('status', 'active')
    .single()

  if (!item) notFound()

  return <ClaimFormClient item={item as PublicItem & { categories?: { name: string } | null }} />
}
