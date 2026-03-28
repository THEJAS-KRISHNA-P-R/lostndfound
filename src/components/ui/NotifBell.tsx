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
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[var(--color-accent)] text-[#0D0F14] text-[10px] font-bold flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
