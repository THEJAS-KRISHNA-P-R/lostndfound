'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNotifications(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    let channel: any = null
    let authListener: any = null
    let interval: any = null

    const fetchCount = async (targetId: string) => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetId)
        .eq('is_read', false)
      
      if (error) {
        console.error('🔔 [Notifications] Fetch error:', error)
        return
      }

      console.log('🔔 [BADGE_CHECK] Unread count:', count)
      setUnreadCount(count ?? 0)
      
      // Global diagnostic for F12 console
      if (typeof window !== 'undefined') {
        ;(window as any).__LOFO_UNREAD_COUNT = count ?? 0
      }
    }

    const onFocus = () => {
      const activeId = userId 
      if (activeId) {
        console.log('🔔 [Notifications] Window focus sync...')
        fetchCount(activeId)
      }
    }

    async function setupRealtime(targetId: string) {
      if (channel) await supabase.removeChannel(channel)
      console.log('🔔 [Notifications] Realtime sync for:', targetId)

      await fetchCount(targetId)

      channel = supabase
        .channel(`notifs:${targetId}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${targetId}` 
          },
          (payload: any) => {
            console.log('🔔 [Notifications] Event received:', payload.eventType)
            fetchCount(targetId)
          }
        )
        .subscribe((status: string) => {
          console.log('🔔 [Notifications] Channel status:', status)
        })

      // Setup polling fallback (30s)
      if (interval) clearInterval(interval)
      interval = setInterval(() => fetchCount(targetId), 30000)
    }

    // Window focus listener
    window.addEventListener('focus', onFocus)

    // Setup logic
    if (userId) {
      setupRealtime(userId)
    } else {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
        if (session?.user) setupRealtime(session.user.id)
        else setUnreadCount(0)
      })
      authListener = { subscription }
      
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
        if (user) setupRealtime(user.id)
      })
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
      if (authListener?.subscription) authListener.subscription.unsubscribe()
      if (interval) clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [userId])

  return { unreadCount }
}
