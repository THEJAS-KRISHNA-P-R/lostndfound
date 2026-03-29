import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { InteractionForm } from '@/components/items/InteractionForm'
import type { PublicItem } from '@/types'

export const metadata: Metadata = { 
  title: 'Report Found Item | LOFO',
  description: 'Provide details and proof to help return this item to its owner.'
}

interface ReportFoundPageProps {
  params: Promise<{ itemId: string }>
}

export default async function ReportFoundPage({ params }: ReportFoundPageProps) {
  const { itemId } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('public_items')
    .select(`*, categories(name)`)
    .eq('id', itemId)
    .eq('status', 'active')
    .single()

  if (!item || item.type !== 'lost') notFound()

  return <InteractionForm item={item as PublicItem & { categories?: { name: string } | null }} />
}
