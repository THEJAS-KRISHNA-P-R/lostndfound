'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  const showInstallToast = useCallback((promptEvent: BeforeInstallPromptEvent) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--color-accent)] rounded-full text-black">
          <Monitor size={16} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">Install LOFO App</p>
          <p className="text-xs text-[var(--color-text-muted)]">Add to home screen for the best experience.</p>
        </div>
        <button
          onClick={() => {
            promptEvent.prompt()
            toast.dismiss(t.id)
            setDeferredPrompt(null)
          }}
          className="px-3 py-1 bg-[var(--color-accent)] text-black text-[10px] font-bold rounded uppercase tracking-wider hover:brightness-110 transition-all"
        >
          Install
        </button>
      </div>
    ), {
      duration: 10000,
      position: 'bottom-center',
      id: 'install-prompt',
    })
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered: ', registration)
          },
          (registrationError) => {
            console.log('SW registration failed: ', registrationError)
          }
        )
      })
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      showInstallToast(promptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [showInstallToast])

  // Explicitly log or use deferredPrompt if needed for extra logic
  useEffect(() => {
    if (deferredPrompt) {
      console.log('Install prompt is ready')
    }
  }, [deferredPrompt])

  return null
}
