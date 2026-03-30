'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { processAndUploadImage } from '@/actions/upload'
import { Lightbox } from '@/components/ui/Lightbox'

interface ImageUploadProps {
  maxFiles: number
  bucket: 'item-images' | 'proof-images'
  onComplete: (urls: string[]) => void
  onDeleteImage?: (url: string) => void
  initialImages?: string[]
  label?: string
}

type Preview = { id: string; localUrl: string; remoteUrl?: string; name: string; status: 'uploading' | 'success' | 'error'; error?: string }

export function ImageUpload({ maxFiles, bucket, onComplete, onDeleteImage, initialImages = [], label = 'Upload Images' }: ImageUploadProps) {
  const [previews, setPreviews] = useState<Preview[]>([])
  const [lightbox, setLightbox] = useState<{ open: boolean, index: number }>({ open: false, index: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize and sync previews from initialImages (e.g. after data fetch in edit mode)
  useEffect(() => {
    if (initialImages && initialImages.length > 0 && previews.length === 0) {
      setPreviews(initialImages.map(url => ({
        id: Math.random().toString(36).slice(2),
        localUrl: url,
        remoteUrl: url,
        name: url.split('/').pop() || 'Existing Image',
        status: 'success'
      })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages])

  // Sync successful URLs up to parent whenever previews change
  useEffect(() => {
    const successful = previews
      .filter(p => p.status === 'success' && p.remoteUrl)
      .map(p => p.remoteUrl!)
    
    onComplete(successful)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previews.map(p => p.remoteUrl).join(',')])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = maxFiles - previews.length
    if (remaining <= 0) return
    const toUpload = Array.from(files).slice(0, remaining)

    const newPreviews = toUpload.map(f => ({
      id: Math.random().toString(36).slice(2),
      localUrl: URL.createObjectURL(f),
      name: f.name,
      status: 'uploading' as const
    }))

    setPreviews(prev => [...prev, ...newPreviews])

    for (let i = 0; i < toUpload.length; i++) {
      const pId = newPreviews[i].id
      try {
        const formData = new FormData()
        formData.append('file', toUpload[i])
        formData.append('bucket', bucket)
        
        const res = await processAndUploadImage(formData)
        if (!res.success || !res.url) throw new Error(res.error || 'Upload failed')

        setPreviews(prev => prev.map(p => p.id === pId ? { ...p, remoteUrl: res.url, status: 'success' as const } : p))
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Upload failed'
        setPreviews(prev => prev.map(p => p.id === pId ? { ...p, status: 'error' as const, error: message } : p))
      }
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [bucket, maxFiles, previews.length])

  const removeFile = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    const removing = previews.find(p => p.id === id)
    
    setPreviews(prev => prev.filter(p => p.id !== id))

    if (removing?.remoteUrl && onDeleteImage) {
      onDeleteImage(removing.remoteUrl)
    }
  }

  const uploadingCount = previews.filter(p => p.status === 'uploading').length

  return (
    <div className="space-y-4">
      {previews.length < maxFiles && (
        <label
          className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-[var(--radius-md)] cursor-pointer transition-all ${isDragging ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]' : 'border-[var(--color-bg-border)] hover:border-[var(--color-text-muted)] bg-[var(--color-bg-elevated)]'}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
        >
          {uploadingCount > 0 ? (
            <Loader2 size={20} className="text-[var(--color-text-muted)] mb-1.5 animate-spin" />
          ) : (
            <Upload size={20} className="text-[var(--color-text-muted)] mb-1.5" />
          )}
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {uploadingCount > 0 ? `Processing & Uploading ${uploadingCount}...` : `${label} (${previews.length}/${maxFiles})`}
          </span>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="sr-only" onChange={e => handleFiles(e.target.files)} />
        </label>
      )}

      {previews.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {previews.map((p, i) => (
            <div 
              key={p.id} 
              onClick={() => p.status === 'success' && setLightbox({ open: true, index: i })}
              className={`relative shrink-0 w-12 h-12 rounded-[var(--radius-sm)] border overflow-hidden transition-all group/item cursor-zoom-in ${p.status === 'error' ? 'border-red-500' : 'border-[var(--color-bg-border)]'}`} 
              title={p.error || p.name}
            >
              <Image 
                src={p.localUrl} 
                alt={p.name} 
                fill 
                sizes="48px"
                className={`object-cover transition-opacity ${p.status === 'uploading' ? 'opacity-50 grayscale' : 'opacity-100'}`} 
              />
              
              {p.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 size={14} className="animate-spin text-white" />
                </div>
              )}

              {p.status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/80">
                  <AlertCircle size={14} className="text-white" />
                </div>
              )}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(p.id, e) }}
                className="absolute top-0.5 right-0.5 z-10 bg-black/80 rounded-full p-0.5 text-white hover:bg-red-600 transition-colors pointer-events-auto shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <X size={10} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Lightbox
        open={lightbox.open}
        onClose={() => setLightbox({ ...lightbox, open: false })}
        images={previews.map(p => p.localUrl)}
        currentIndex={lightbox.index}
        onNavigate={(idx) => setLightbox({ ...lightbox, index: idx })}
      />
    </div>
  )
}
