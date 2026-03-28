import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { PageShell } from '@/components/layout/PageShell'
import { Footer } from '@/components/layout/Footer'
import { markAllRead } from '@/actions/notifications'
import { formatRelative } from '@/utils/formatDate'
import {
  Info, CheckCircle, AlertTriangle, XCircle, UserCheck, Copy
} from 'lucide-react'
import type { Notification } from '@/types'

export const metadata: Metadata = { title: 'Notifications' }

const typeIcons: Record<string, React.ReactNode> = {
  info:           <Info size={16} className="text-blue-400" />,
  success:        <CheckCircle size={16} className="text-green-400" />,
  warning:        <AlertTriangle size={16} className="text-amber-400" />,
  claim_approved: <CheckCircle size={16} className="text-green-400" />,
  claim_rejected: <XCircle size={16} className="text-red-400" />,
  contact_shared: <UserCheck size={16} className="text-[var(--color-accent)]" />,
}

function ContactCard({ metadata }: { metadata: Notification['metadata'] }) {
  if (!metadata) return null
  return (
    <div className="mt-3 bg-[var(--color-bg-surface)] border border-[var(--color-accent)] border-opacity-30 rounded-[var(--radius-sm)] p-4 space-y-2">
      <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wide mb-2">Contact Details</p>
      {metadata.name && <p className="text-sm text-[var(--color-text-primary)] font-medium">{metadata.name}</p>}
      {metadata.email && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-[var(--color-text-secondary)]">{metadata.email}</p>
          <button
            onClick={() => navigator.clipboard.writeText(metadata.email!)}
            className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] flex items-center gap-1 transition-colors"
          >
            <Copy size={10} /> Copy
          </button>
        </div>
      )}
      {metadata.phone && <p className="text-sm text-[var(--color-text-secondary)]">{metadata.phone}</p>}
      {metadata.admin_note && (
        <p className="text-xs text-[var(--color-text-muted)] italic border-t border-[var(--color-bg-border)] pt-2 mt-2">
          Admin note: {metadata.admin_note}
        </p>
      )}
    </div>
  )
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/notifications')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const notifs = (notifications as Notification[]) ?? []
  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <PageShell>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-8 py-8 pb-24 md:pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-text-primary)]">Notifications</h1>
              {unreadCount > 0 && <p className="text-sm text-[var(--color-text-muted)] mt-1">{unreadCount} unread</p>}
            </div>
            {unreadCount > 0 && (
              <form action={markAllRead}>
                <button type="submit" className="text-sm text-[var(--color-accent)] hover:underline px-1">Mark all as read</button>
              </form>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <span className="text-4xl opacity-20">🔔</span>
              <p className="text-sm text-[var(--color-text-muted)]">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifs.map(notif => (
                <div
                  key={notif.id}
                  className={`bg-[var(--color-bg-surface)] border rounded-[var(--radius-md)] p-4 transition-all ${
                    !notif.is_read
                      ? 'border-l-4 border-l-[var(--color-accent)] border-r border-t border-b border-[var(--color-bg-border)]'
                      : 'border-[var(--color-bg-border)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{typeIcons[notif.type] ?? typeIcons.info}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold ${!notif.is_read ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                          {notif.title}
                        </p>
                        <span className="text-xs text-[var(--color-text-muted)] shrink-0">{formatRelative(notif.created_at)}</span>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{notif.message}</p>
                      {notif.type === 'contact_shared' && <ContactCard metadata={notif.metadata} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PageShell>
  )
}
