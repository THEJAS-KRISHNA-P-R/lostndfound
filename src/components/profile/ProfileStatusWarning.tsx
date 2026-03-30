'use client'

import { AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export function ProfileStatusWarning() {
  const { profile } = useAuth()
  
  if (!profile || profile.uni_reg_no !== 'PENDING') return null

  return (
    <div className="relative overflow-hidden bg-amber-500/10 border border-amber-500/20 rounded-[var(--radius-lg)] p-5 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <AlertCircle size={80} />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">Action Required: Complete Your Profile</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-md">
              Your profile is currently missing a valid University Registration Number. 
              You won&apos;t be able to post items or submit claims until this is resolved.
            </p>
          </div>
        </div>
        
        <Button 
          variant="primary" 
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-black border-none whitespace-nowrap shadow-lg shadow-amber-500/20"
          onClick={() => {
            // The global modal will pick this up automatically if we're signed in
            // but we can also trigger a refresh or state change if needed.
            // For now, let's just toast a reminder.
            window.location.reload()
          }}
        >
          Check Details <ArrowRight size={14} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}
