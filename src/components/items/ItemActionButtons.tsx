'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { OnboardingGuard } from '@/components/auth/OnboardingGuard'

interface ItemActionButtonsProps {
  itemId: string
  itemType: 'lost' | 'found'
}

export function ItemActionButtons({ itemId, itemType }: ItemActionButtonsProps) {
  return (
    <OnboardingGuard>
      <Link href={itemType === 'found' ? `/claim/${itemId}` : `/report-found/${itemId}`}>
        <Button fullWidth size="lg">
          {itemType === 'found' ? 'Submit a Claim' : "I've Found This"}
        </Button>
      </Link>
    </OnboardingGuard>
  )
}
