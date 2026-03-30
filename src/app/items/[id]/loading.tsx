import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { Navbar } from '@/components/layout/Navbar'

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500">
      <Navbar />
      <main className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 pb-24 md:pb-8 flex-1">
        {/* Back link skeleton */}
        <div className="flex items-center gap-1.5 mb-6">
          <ArrowLeft size={14} className="text-[var(--color-text-muted)] opacity-50" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-[var(--radius-lg)]" />
            <div className="flex gap-2">
              <Skeleton className="h-16 w-16 rounded-[var(--radius-md)]" />
              <Skeleton className="h-16 w-16 rounded-[var(--radius-md)]" />
              <Skeleton className="h-16 w-16 rounded-[var(--radius-md)]" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            
            <Skeleton className="h-10 w-3/4" />
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="flex items-center gap-3 py-4 border-y border-[var(--color-bg-border)]">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <Skeleton className="h-12 w-full rounded-[var(--radius-md)]" />
          </div>
        </div>
      </main>
    </div>
  )
}
