'use client'

import { create } from 'zustand'
import type { Profile } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  profile: Profile | null
  session: Session | null
  initialized: boolean
  onboardingOpen: boolean
  setProfile: (profile: Profile | null) => void
  setSession: (session: Session | null) => void
  setInitialized: (initialized: boolean) => void
  setOnboardingOpen: (open: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  session: null,
  initialized: false,
  onboardingOpen: false,
  setProfile: (profile) => set({ profile }),
  setSession: (session) => set({ session }),
  setInitialized: (initialized) => set({ initialized }),
  setOnboardingOpen: (onboardingOpen) => set({ onboardingOpen }),
  clear: () => set({ profile: null, session: null, onboardingOpen: false }),
}))
