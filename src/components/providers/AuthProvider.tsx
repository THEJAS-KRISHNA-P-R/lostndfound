'use client'

import { useEffect, Suspense, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/types'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { CompleteProfileModal } from '@/components/auth/CompleteProfileModal'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setProfile, setSession, setInitialized, clear } = useAuthStore()
  const fetchLockRef = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true
    let hasInitialized = false

    async function handleSession(session: Session | null) {
      if (!isMounted || (fetchLockRef.current && session?.user?.id === useAuthStore.getState().session?.user?.id)) return
      
      if (!session?.user) {
        clear()
        setInitialized(true)
        return
      }

      fetchLockRef.current = true
      setSession(session)
      
      try {
        // 1. Check Metadata Fallback First (Immediate UI feedback)
        // If the profile fetch is slow, we use the session metadata as an interim truth
        const metaReg = session.user.user_metadata?.uni_reg_no
        const metaName = session.user.user_metadata?.full_name
        
        if (metaReg && !metaReg.toUpperCase().startsWith('PENDING')) {
          setProfile({
            id: session.user.id,
            email: session.user.email!,
            full_name: metaName || 'User',
            uni_reg_no: metaReg,
            role: 'user',
            created_at: new Date().toISOString()
          } as Profile)
        }

        // 2. Persistent Profile Fetch with retry
        let retries = 5
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
            console.error(`AuthProvider: Retry ${6 - retries}...`, err)
            retries--
            if (retries > 0) await new Promise(r => setTimeout(r, 800))
          }
        }

        if (isMounted) {
          if (success && profileData) {
            setProfile(profileData as Profile)
          } 
          // If fetch failed but we have metadata, we've already set a fallback.
          // If both fail, profile remains null or 'PENDING'.
          setInitialized(true)
        }
      } finally {
        fetchLockRef.current = false
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

