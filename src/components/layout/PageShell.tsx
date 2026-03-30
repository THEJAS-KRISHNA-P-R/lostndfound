'use client'

import dynamic from 'next/dynamic'

const DotGrid = dynamic(() => import('@/components/ui/DotGrid').then(m => m.DotGrid), {
  ssr: false,
})

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <DotGrid className="w-full h-full" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
