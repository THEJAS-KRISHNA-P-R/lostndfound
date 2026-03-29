'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUnreadCount as getUnreadCountAction } from '@/actions/notifications'

export function useNotifications(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0)
  const isMounted = useRef(true)
  const isFetching = useRef(false)

  useEffect(() => {
    isMounted.current = true
    const supabase = createClient()
    let channel: any = null
    let authListener: any = null
    let interval: any = null

    const fetchCount = async () => {
      if (!isMounted.current || isFetching.current) return
      
      try {
        isFetching.current = true
        // Use the Server Action instead of client-side RLS fetch
        const count = await getUnreadCountAction()
        
        if (isMounted.current) {
          console.log('🔔 [BADGE_CHECK] Server Action Count:', count)
          setUnreadCount(count)
          
          // Global diagnostic for F12 console
          if (typeof window !== 'undefined') {
            ;(window as any).__LOFO_UNREAD_COUNT = count
          }
        }
      } catch (err) {
        console.warn('🔔 [Notifications] Fetch failed (Hydration Race?):', err)
      } finally {
        isFetching.current = false
      }
    }

    const onFocus = () => {
      if (userId && isMounted.current) {
        console.log('🔔 [Notifications] Window focus sync...')
        fetchCount()
      }
    }

    async function setupRealtime(targetId: string) {
      if (channel) await supabase.removeChannel(channel)
      if (!isMounted.current) return

      console.log('🔔 [Notifications] Realtime sync for:', targetId)

      // Initial count from server action (with slight delay for hydration)
      setTimeout(() => {
        if (isMounted.current) fetchCount()
      }, 500)

      // Listen for changes but fetch from server action for the truth
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
            console.log('🔔 [Notifications] Realtime event received:', payload.eventType)
            fetchCount()
          }
        )
        .subscribe((status: string) => {
          console.log('🔔 [Notifications] Realtime status:', status)
        })

      // Setup polling fallback (60s - reduced frequency for stability)
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        if (isMounted.current) fetchCount()
      }, 60000)
    }

    // Window focus listener
    window.addEventListener('focus', onFocus)

    // Setup logic
    if (userId) {
      setupRealtime(userId)
    } else {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
        if (session?.user && isMounted.current) setupRealtime(session.user.id)
        else if (isMounted.current) setUnreadCount(0)
      })
      authListener = { subscription }
      
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
        if (user && isMounted.current) setupRealtime(user.id)
      })
    }

    return () => {
      isMounted.current = false
      if (channel) supabase.removeChannel(channel)
      if (authListener?.subscription) authListener.subscription.unsubscribe()
      if (interval) clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [userId])

  return { unreadCount }
}
