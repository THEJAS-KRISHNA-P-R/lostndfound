'use client'

import dynamic from 'next/dynamic'
import type { MagicRingsProps } from './MagicRings'

// CSR-only: Three.js cannot run on the server
const MagicRings = dynamic(
  () => import('@/components/ui/MagicRings').then(m => m.MagicRings),
  { ssr: false, loading: () => null }
)

export function MagicRingsClient(props: MagicRingsProps) {
  return <MagicRings {...props} />
}
