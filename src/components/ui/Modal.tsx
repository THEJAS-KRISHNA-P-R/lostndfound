'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
  closable?: boolean
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md', closable = true }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !closable) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose, closable])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closable ? onClose : undefined}
        aria-hidden
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal
        aria-label={title}
        className={`relative z-10 w-full ${maxWidth} bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-lg)] shadow-2xl modal-enter`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-bg-border)]">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)] font-[var(--font-display)]">
              {title}
            </h2>
            {closable && (
              <button
                onClick={onClose}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded p-1"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
