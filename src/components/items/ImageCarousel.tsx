'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Lightbox } from '@/components/ui/Lightbox'

interface ImageCarouselProps {
  images: string[]
  title: string
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] flex items-center justify-center text-6xl opacity-20">
        📦
      </div>
    )
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection
      if (nextIndex < 0) nextIndex = images.length - 1
      if (nextIndex >= images.length) nextIndex = 0
      return nextIndex
    })
  }

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            onClick={() => setShowLightbox(true)}
            className="absolute inset-0 cursor-zoom-in active:cursor-grabbing"
          >
            <Image
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              className="object-cover pointer-events-none"
              priority={currentIndex === 0}
              quality={100}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); paginate(-1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-accent)] hover:text-[#0D0F14]"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); paginate(1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-accent)] hover:text-[#0D0F14]"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Index Badge */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-10 px-2 py-1 rounded-md bg-black/40 text-white backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Lightbox for full screen */}
      <Lightbox
        open={showLightbox}
        onClose={() => setShowLightbox(false)}
        images={images}
        currentIndex={currentIndex}
        onNavigate={(idx) => {
          setDirection(idx > currentIndex ? 1 : -1)
          setCurrentIndex(idx)
        }}
      />

      {/* Thumbnails / Dots */}
      {images.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1)
                setCurrentIndex(i)
              }}
              className={`relative w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'bg-[var(--color-accent)] w-8' 
                  : 'bg-[var(--color-bg-border)] hover:bg-[var(--color-text-muted)]'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Optional: Small thumbnail strip below */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1)
                setCurrentIndex(i)
              }}
              className={`relative w-16 h-16 shrink-0 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-all ${
                i === currentIndex 
                  ? 'border-[var(--color-accent)] scale-95 shadow-lg' 
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
