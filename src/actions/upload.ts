'use server'

import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

export async function processAndUploadImage(formData: FormData): Promise<{ success: boolean, url?: string, error?: string }> {
  const file = formData.get('file') as File | null
  const bucketName = formData.get('bucket') as 'item-images' | 'proof-images'
  const folder = formData.get('folder') as string || 'uploads'
  
  if (!file) return { success: false, error: 'No file provided.' }
  if (file.size > MAX_FILE_SIZE) return { success: false, error: 'File size must be under 25MB.' }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed.' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized request.' }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer as ArrayBuffer)

    let bufferToUpload: Buffer = buffer
    let contentType = file.type
    let extension = file.type.split('/')[1] || 'bin'
    if (extension === 'jpeg') extension = 'jpg'

    // Only process with Sharp if file is > 500KB or if we want to standardize on WebP
    // User requested: "if < 500kb, don't compress. if > 500kb, compress to 500kb"
    if (file.size > 500 * 1024) {
      console.log(`Compressing large image: ${Math.round(file.size / 1024)}KB`)
      bufferToUpload = await sharp(buffer)
        .resize(2500, 2500, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 95, effort: 4 }) // Increased from 85 to 95 for near-lossless clarity
        .toBuffer()
      contentType = 'image/webp'
      extension = 'webp'
    } else {
      console.log(`Uploading original image: ${Math.round(file.size / 1024)}KB`)
    }

    const filename = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

    // Upload processed buffer via Server Client
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, bufferToUpload, {
        contentType,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    if (bucketName === 'proof-images') {
      return { success: true, url: filename }
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename)

    return { success: true, url: publicUrlData.publicUrl }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image processing failed.'
    console.error('Sharp/Upload Error:', error)
    return { success: false, error: message }
  }
}
