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

    async function fetchProfile(session: Session) {
      if (!session?.user || !isMounted) return
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (isMounted) {
          setProfile(profile as Profile)
          setSession(session)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        if (isMounted) setInitialized(true)
      }
    }

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchProfile(session)
        } else {
          if (isMounted) {
            clear()
            setInitialized(true)
          }
        }
      } catch (err) {
        console.error('Error in AuthProvider init:', err)
        if (isMounted) setInitialized(true)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session)
      } else if (event === 'SIGNED_OUT') {
        clear()
        setInitialized(true)
      } else if (session) {
        // Handle token refreshes etc.
        setSession(session)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
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

