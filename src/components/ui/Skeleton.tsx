type SkeletonVariant = 'card' | 'text' | 'avatar' | 'row'

interface SkeletonProps {
  variant?: SkeletonVariant
  count?: number
  className?: string
}

function SkeletonItem({ variant, className }: { variant: SkeletonVariant; className?: string }) {
  if (variant === 'card') {
    return (
      <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-bg-border)]">
        <div className="skeleton aspect-square w-full" />
        <div className="p-3 space-y-2">
          <div className="skeleton h-4 rounded-full w-3/4" />
          <div className="skeleton h-3 rounded-full w-full" />
          <div className="skeleton h-3 rounded-full w-1/2" />
        </div>
      </div>
    )
  }
  if (variant === 'avatar') {
    return <div className={`skeleton rounded-full w-8 h-8 ${className}`} />
  }
  if (variant === 'row') {
    return (
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-bg-border)]">
        <div className="skeleton rounded-full w-10 h-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 rounded-full w-1/3" />
          <div className="skeleton h-3 rounded-full w-2/3" />
        </div>
        <div className="skeleton h-6 rounded-full w-16" />
      </div>
    )
  }
  return <div className={`skeleton h-4 rounded-full w-full ${className}`} />
}

export function Skeleton({ variant = 'text', count = 1, className }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} variant={variant} className={className} />
      ))}
    </>
  )
}
