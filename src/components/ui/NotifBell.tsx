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
          className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center text-[11px] font-bold text-white z-50 pointer-events-none"
          style={{ 
            background: '#EF4444', 
            boxShadow: '0 0 16px rgba(239, 68, 68, 0.6)',
            border: '1.5px solid var(--color-bg-base)',
            transform: 'translate(25%, -25%)'
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
