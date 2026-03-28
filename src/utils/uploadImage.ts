import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

export async function uploadImage(
  file: File,
  bucket: 'item-images' | 'proof-images',
  folder: string = 'uploads'
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('Only JPEG, PNG, WebP, and GIF images are allowed.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError('File size must be under 5MB.')
  }

  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new UploadError(error.message)

  if (bucket === 'proof-images') {
    // Private bucket — return path only; caller fetches signed URL when needed
    return filename
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export async function getSignedUrl(
  bucket: 'item-images' | 'proof-images',
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw new UploadError(error.message)
  return data.signedUrl
}
