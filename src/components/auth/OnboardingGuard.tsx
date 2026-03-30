'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'

interface OnboardingGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * A wrapper component that intercepts clicks on its children.
 * If the user is not onboarded, it prevents the action and opens the onboarding modal.
 */
export function OnboardingGuard({ children, fallback }: OnboardingGuardProps) {
  const { isOnboarded, isAuthed, setOnboardingOpen } = useAuth()

  const handleClick = (e: React.MouseEvent) => {
    // If not authenticated, let the natural link (e.g. /login) handle it
    if (!isAuthed) return

    // If not onboarded, intercept and show modal
    if (!isOnboarded) {
      e.preventDefault()
      e.stopPropagation()
      setOnboardingOpen(true)
    }
  }

  // If we want to hide certain things entirely for unonboarded users, 
  // though interception is usually better UX
  if (fallback && !isOnboarded && isAuthed) {
    return <>{fallback}</>
  }

  return (
    <div onClickCapture={handleClick} className="contents">
      {children}
    </div>
  )
}
