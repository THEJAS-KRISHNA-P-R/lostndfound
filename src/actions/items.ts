'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { PostItemSchema } from '@/lib/validations/item'
import { requireAuth, requireOnboarded, requireAdmin, verifyItemOwnership } from '@/utils/security'
import { sanitize } from '@/utils/sanitize'
import { findMatchingLostItems, findMatchingFoundItems } from '@/utils/matchItems'
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

  // Auto-match: check for similar items in the opposite category
  try {
    const matchInput = {
      title: parsed.data.title,
      description: parsed.data.description,
      category_id: parsed.data.category_id,
      location: parsed.data.location,
    }

    const matches = parsed.data.type === 'found'
      ? await findMatchingLostItems(matchInput, user.id)
      : await findMatchingFoundItems(matchInput, user.id)

    if (matches.length > 0) {
      const isFoundPost = parsed.data.type === 'found'
      const notifications = matches.map(match => ({
        user_id: match.user_id,
        sender_id: user.id,
        title: isFoundPost ? '🔍 Possible Match Found!' : '🔍 Someone may have lost this!',
        message: isFoundPost
          ? `A found item "${parsed.data.title}" may match your lost "${match.title}". Check it out!`
          : `A lost item "${parsed.data.title}" may match your found "${match.title}". Can you help?`,
        type: 'match_found',
        metadata: {
          item_id: data.id,
          item_title: parsed.data.title,
          lost_item_title: match.title,
        },
      }))

      await supabase.from('notifications').insert(notifications)
      revalidatePath('/notifications')
    }
  } catch (matchError) {
    // Never let matching errors block item creation
    console.error('🔍 [Match] Error during auto-matching:', matchError)
  }

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

  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    await verifyItemOwnership(id, user.id)
  }

  let query = supabase.from('items').delete().eq('id', id)
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { error } = await query
  if (error) return { success: false, error: error.message }

  revalidatePath('/browse')
  revalidatePath(`/items/${id}`)
  return { success: true }
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
