'use client'

import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { profile, session, initialized, onboardingOpen, setOnboardingOpen, setProfile } = useAuthStore()
  
  const isOnboarded = !!profile?.uni_reg_no && !profile.uni_reg_no.toUpperCase().startsWith('PENDING')

  return {
    profile,
    session,
    initialized,
    onboardingOpen,
    setOnboardingOpen,
    setProfile,
    isAdmin: profile?.role === 'admin',
    isAuthed: !!session,
    userId: session?.user?.id ?? null,
    isOnboarded: initialized ? isOnboarded : false, // Guard against early true/false before load
    withOnboarding: (action: () => void) => {
      if (!isOnboarded) {
        setOnboardingOpen(true)
        return
      }
      action()
    }
  }
}
