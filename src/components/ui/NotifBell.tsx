'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'

interface NotifBellProps {
  count: number
}

export function NotifBell({ count }: NotifBellProps) {
  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
    >
      <Bell size={20} />
      {count > 0 && (
        <span 
          className="absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse z-50 pointer-events-none"
          style={{ 
            background: '#FF9800', 
            boxShadow: '0 0 14px rgba(255, 152, 0, 0.7)',
            border: '2px solid var(--color-bg-base)'
          }}
        />
      )}
    </Link>
  )
}
