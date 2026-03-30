'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostItemSchema } from '@/lib/validations/item'
import { requireAuth, requireOnboarded, requireAdmin, verifyItemOwnership } from '@/utils/security'
import { sanitize } from '@/utils/sanitize'
import type { ActionResult } from '@/types'

export async function createItem(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth()
  await requireOnboarded(user.id)
  
  const supabase = await createClient()

  const raw = {
    type: formData.get('type'),
    title: sanitize(formData.get('title') as string),
    category_id: formData.get('category_id') ? Number(formData.get('category_id')) : undefined,
    description: sanitize(formData.get('description') as string) || undefined,
    location: sanitize(formData.get('location') as string),
    date_occurred: formData.get('date_occurred'),
    time_occurred: formData.get('time_occurred') || undefined,
    private_details: sanitize(formData.get('private_details') as string) || undefined,
    images: formData.getAll('images').filter(Boolean) as string[],
  }

  const parsed = PostItemSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { data, error } = await supabase
    .from('items')
    .insert({ ...parsed.data, user_id: user.id })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/browse')
  return { success: true, data: { id: data.id } }
}

export async function updateItem(id: string, formData: FormData): Promise<ActionResult> {
  const user = await requireAuth()
  await requireOnboarded(user.id)
  await verifyItemOwnership(id, user.id)

  const supabase = await createClient()

  const raw = {
    type: formData.get('type'),
    title: sanitize(formData.get('title') as string),
    category_id: formData.get('category_id') ? Number(formData.get('category_id')) : undefined,
    description: sanitize(formData.get('description') as string) || undefined,
    location: sanitize(formData.get('location') as string),
    date_occurred: formData.get('date_occurred'),
    time_occurred: formData.get('time_occurred') || undefined,
    private_details: sanitize(formData.get('private_details') as string) || undefined,
    images: formData.getAll('images').filter(Boolean) as string[],
  }

  const parsed = PostItemSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  // Handle physical deletion of removed images from bucket on SAVE
  const deletedImages = formData.getAll('deleted_images').filter(Boolean) as string[]
  if (deletedImages.length > 0) {
    const pathsToRemove = deletedImages.map(url => {
      // url format: .../object/public/item-images/path/to/img.webp
      if (url.includes('/item-images/')) {
        return url.split('/item-images/').pop()
      }
      return null
    }).filter(Boolean) as string[]

    if (pathsToRemove.length > 0) {
      await supabase.storage.from('item-images').remove(pathsToRemove)
    }
  }

  const { error, count } = await supabase
    .from('items')
    .update(parsed.data, { count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .select()

  if (error) return { success: false, error: error.message }
  if (count === 0) return { success: false, error: 'Cannot edit an item that is already claimed or not owned by you.' }

  revalidatePath('/browse')
  revalidatePath(`/items/${id}`)
  revalidatePath('/profile')
  return { success: true }
}

export async function updateItemStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  const user = await requireAuth()
  await requireAdmin(user.id)

  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/items')
  revalidatePath(`/items/${id}`)
  return { success: true }
}

export async function deleteItem(id: string): Promise<ActionResult> {
  const user = await requireAuth()
  await verifyItemOwnership(id, user.id)

  const supabase = await createClient()
  const { error } = await supabase.from('items').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/browse')
  revalidatePath(`/items/${id}`)
  redirect('/browse')
}

export async function bulkArchiveFlaggedItems(): Promise<ActionResult> {
  const user = await requireAuth()
  await requireAdmin(user.id)

  const supabase = await createClient()

  // 2. Perform bulk update: set status 'archived' for all 'flagged' items
  const { error } = await supabase
    .from('items')
    .update({ status: 'archived' })
    .eq('status', 'flagged')

  if (error) {
    console.error('Bulk Archival Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/items')
  return { success: true }
}
