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

      try {
        // Set session first so isAuthed is true immediately in the Navbar
        setSession(session)

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (isMounted && profile) {
          setProfile(profile as Profile)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        if (isMounted && !hasInitialized) {
          hasInitialized = true
          setInitialized(true)
        }
      }
    }

    // onAuthStateChange fires INITIAL_SESSION on mount (guaranteed by Supabase),
    // so we do NOT need a separate getSession() call. This prevents double-init.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT') {
        clear()
        setInitialized(true)
      } else {
        // Handles INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
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

