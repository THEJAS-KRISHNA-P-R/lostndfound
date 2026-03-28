'use client'

import { useState, useCallback } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { uploadImage, UploadError } from '@/utils/uploadImage'

interface ImageUploadProps {
  maxFiles: number
  bucket: 'item-images' | 'proof-images'
  onComplete: (urls: string[]) => void
  onError?: (msg: string) => void
  label?: string
}

export function ImageUpload({ maxFiles, bucket, onComplete, onError, label = 'Upload Images' }: ImageUploadProps) {
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = maxFiles - previews.length
    if (remaining <= 0) { setErrorMsg(`Maximum ${maxFiles} images allowed.`); return }
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true); setErrorMsg(null)
    const uploaded: string[] = []
    for (const file of toUpload) {
      try {
        const url = await uploadImage(file, bucket)
        uploaded.push(url)
        setPreviews(p => [...p, { url: bucket === 'item-images' ? url : URL.createObjectURL(file), name: file.name }])
      } catch (e) {
        const msg = e instanceof UploadError ? e.message : 'Upload failed.'
        setErrorMsg(msg); onError?.(msg)
      }
    }
    setUploading(false)
    onComplete([...previews.map(p => p.url), ...uploaded])
  }, [bucket, maxFiles, onComplete, onError, previews])

  const removeFile = (i: number) => {
    const next = previews.filter((_, idx) => idx !== i)
    setPreviews(next)
    onComplete(next.map(p => p.url))
  }

  return (
    <div className="space-y-3">
      {previews.length < maxFiles && (
        <label
          className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-[var(--radius-md)] cursor-pointer transition-colors ${isDragging ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]' : 'border-[var(--color-bg-border)] hover:border-[var(--color-text-muted)] bg-[var(--color-bg-elevated)]'}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
        >
          <Upload size={20} className="text-[var(--color-text-muted)] mb-1.5" />
          <span className="text-xs text-[var(--color-text-muted)]">
            {uploading ? 'Uploading…' : `${label} (${previews.length}/${maxFiles})`}
          </span>
          <input type="file" multiple accept="image/*" className="sr-only" onChange={e => handleFiles(e.target.files)} />
        </label>
      )}
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-bg-border)]">
              <Image src={p.url} alt={p.name} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 text-white hover:bg-red-600 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      {errorMsg && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {errorMsg}
        </p>
      )}
    </div>
  )
}
