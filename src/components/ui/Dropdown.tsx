'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DropdownOption {
  label: string
  value: string
}

interface DropdownProps {
  label?: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function Dropdown({ label, options, value, onChange, className = '', placeholder = 'Select...' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const currentOption = options.find(o => o.value === value)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 ml-1">{label}</span>}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] text-sm text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:shadow-[0_0_12px_rgba(245,166,35,0.15)] transition-all outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] group"
      >
        <span className={!currentOption ? 'text-[var(--color-text-muted)]' : ''}>
          {currentOption ? currentOption.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-[var(--color-text-muted)] transition-transform duration-200 group-hover:text-[var(--color-accent)] ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-[100] top-full left-0 right-0 py-1 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-[var(--radius-md)] shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden min-w-[160px]"
            style={{ backdropFilter: 'blur(12px)' }}
          >
            <div className="max-h-[240px] overflow-y-auto scrollbar-none">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--color-bg-elevated)] group ${
                    value === option.value ? 'text-[var(--color-accent)] font-medium bg-[var(--color-bg-elevated)]/50' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  <span className="group-hover:text-[var(--color-text-primary)] transition-colors">{option.label}</span>
                  {value === option.value && <Check size={14} className="text-[var(--color-accent)]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
