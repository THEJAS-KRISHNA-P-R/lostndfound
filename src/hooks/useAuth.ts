'use client'

import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { profile, session, initialized } = useAuthStore()
  return {
    profile,
    session,
    initialized,
    isAdmin: profile?.role === 'admin',
    isAuthed: !!session,
    userId: session?.user?.id ?? null,
  }
}
