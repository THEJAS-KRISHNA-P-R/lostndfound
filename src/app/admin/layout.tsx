import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { count: pendingCount } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)]">
      <AdminSidebar pendingClaimsCount={pendingCount ?? 0} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
