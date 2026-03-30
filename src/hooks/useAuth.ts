'use client'

import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { profile, session, initialized, onboardingOpen, setOnboardingOpen } = useAuthStore()
  
  const isOnboarded = !!profile?.uni_reg_no && !profile.uni_reg_no.startsWith('PENDING')

  return {
    profile,
    session,
    initialized,
    onboardingOpen,
    setOnboardingOpen,
    isAdmin: profile?.role === 'admin',
    isAuthed: !!session,
    userId: session?.user?.id ?? null,
    isOnboarded,
    // Helper to protect actions
    withOnboarding: (action: () => void) => {
      if (!isOnboarded) {
        setOnboardingOpen(true)
        return
      }
      action()
    }
  }
}
