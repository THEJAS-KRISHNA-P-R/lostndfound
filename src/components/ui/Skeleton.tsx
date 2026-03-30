export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] ${className || ""}`}
      {...props}
    />
  )
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-bg-border)]">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ItemGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  )
}
