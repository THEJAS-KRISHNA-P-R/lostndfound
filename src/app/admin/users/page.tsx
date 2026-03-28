import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { formatRelative } from '@/utils/formatDate'
import type { Profile } from '@/types'

export const metadata: Metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const users = (data as Profile[]) ?? []

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-text-primary)] mb-6">Users ({users.length})</h1>
      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="flex items-center gap-3 p-3 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)]">
            <Avatar src={user.avatar_url} fallback={user.full_name} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user.full_name}</p>
                {user.role === 'admin' && <StatusBadge status="active" label="Admin" />}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
              <p className="text-xs text-[var(--color-text-muted)] font-mono">{user.uni_reg_no}</p>
            </div>
            <span className="text-xs text-[var(--color-text-muted)] shrink-0">{formatRelative(user.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
