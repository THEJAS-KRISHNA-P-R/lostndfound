'use client'

import { useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/types'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { CompleteProfileModal } from '@/components/auth/CompleteProfileModal'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setProfile, setSession, setInitialized, clear } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true
    let hasInitialized = false

    async function handleSession(session: Session | null) {
      if (!isMounted) return

      if (!session?.user) {
        clear()
        if (!hasInitialized) {
          hasInitialized = true
          setInitialized(true)
        }
        return
      }

      // 1. Always set the session first so isAuthed is true immediately
      setSession(session)
      
      // 2. Persistent Profile Fetch with Retry
      let retries = 3
      let profileData = null
      let success = false

      while (retries > 0 && isMounted) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (error) throw error
          
          if (data) {
            profileData = data
            success = true
            break
          }
        } catch (err) {
          console.error(`AuthProvider: Fetch trial ${4 - retries} failed:`, err)
          retries--
          if (retries > 0) await new Promise(r => setTimeout(r, 1000 / retries))
        }
      }

      if (isMounted) {
        if (success && profileData) {
          setProfile(profileData as Profile)
        }
        
        // Only mark as initialized once we've definitively tried to fetch the profile
        if (!hasInitialized) {
          hasInitialized = true
          setInitialized(true)
        }
      }
    }

    // onAuthStateChange fires INITIAL_SESSION on mount.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT') {
        clear()
        setInitialized(true)
      } else {
        await handleSession(session)
      }
    })

    // Safety fallback — if Supabase never fires an event (network down, etc.)
    const timeout = setTimeout(() => {
      if (isMounted && !hasInitialized) {
        hasInitialized = true
        setInitialized(true)
      }
    }, 3000)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [setProfile, setSession, setInitialized, clear])

  return (
    <>
      <Suspense fallback={null}>
        <CompleteProfileModal />
      </Suspense>
      {children}
    </>
  )
}

