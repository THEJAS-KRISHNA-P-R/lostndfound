'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  open: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  onNavigate?: (index: number) => void
}

export function Lightbox({ open, onClose, images, currentIndex, onNavigate }: LightboxProps) {
  // Handle escape key
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onNavigate) onNavigate(Math.max(0, currentIndex - 1))
      if (e.key === 'ArrowRight' && onNavigate) onNavigate(Math.min(images.length - 1, currentIndex + 1))
    }
    window.addEventListener('keydown', handleEsc)
    // Prevent scrolling
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose, currentIndex, onNavigate, images.length])

  if (!open) return null

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onNavigate && currentIndex > 0) onNavigate(currentIndex - 1)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onNavigate && currentIndex < images.length - 1) onNavigate(currentIndex + 1)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[110] p-2 rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all backdrop-blur-xl border border-white/10"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && onNavigate && (
            <>
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className={`absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full transition-all backdrop-blur-xl border border-white/10 ${
                  currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft size={32} />
              </button>
              <button
                disabled={currentIndex === images.length - 1}
                onClick={handleNext}
                className={`absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full transition-all backdrop-blur-xl border border-white/10 ${
                  currentIndex === images.length - 1 ? 'opacity-20 cursor-not-allowed' : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-7xl h-[85vh] flex items-center justify-center pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={images[currentIndex]}
              src={images[currentIndex]}
              alt={`Full-screen view ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
              quality={100}
              sizes="100vw"
            />
          </motion.div>

          {/* Pagination Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/5 text-white text-sm font-medium backdrop-blur-xl border border-white/10">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
