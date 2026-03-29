'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setProfile, setSession, setInitialized, clear } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setSession(session)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile as Profile)
      }

      setInitialized(true)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: unknown, session: unknown) => {
      const s = session as { user: { id: string } } | null
      if (s?.user) {
        setSession(s as any) // Keep minimal cast to avoid store refactor now
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', s.user.id)
          .single()
        setProfile(profile as Profile)
      } else {
        clear()
        setInitialized(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [setProfile, setSession, setInitialized, clear])

  return <>{children}</>
}
