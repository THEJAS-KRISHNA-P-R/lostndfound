'use client'

import { useEffect } from 'react'
import { markAllRead } from '@/actions/notifications'

export function MarkReadOnMount() {
  useEffect(() => {
    // We call the server action to mark all notifications as read for the current user.
    // This is triggered once when the notifications page component is mounted.
    try {
      markAllRead()
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
    }
  }, [])

  return null
}
