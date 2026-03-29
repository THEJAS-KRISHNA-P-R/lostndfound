'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostItemSchema } from '@/lib/validations/item'
import type { ActionResult } from '@/types'

export async function createItem(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in to post an item.' }

  const raw = {
    type: formData.get('type'),
    title: formData.get('title'),
    category_id: formData.get('category_id') ? Number(formData.get('category_id')) : undefined,
    description: formData.get('description') || undefined,
    location: formData.get('location'),
    date_occurred: formData.get('date_occurred'),
    time_occurred: formData.get('time_occurred') || undefined,
    private_details: formData.get('private_details') || undefined,
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const raw = {
    type: formData.get('type'),
    title: formData.get('title'),
    category_id: formData.get('category_id') ? Number(formData.get('category_id')) : undefined,
    description: formData.get('description') || undefined,
    location: formData.get('location'),
    date_occurred: formData.get('date_occurred'),
    time_occurred: formData.get('time_occurred') || undefined,
    private_details: formData.get('private_details') || undefined,
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/browse')
  revalidatePath('/admin/items')
  redirect('/browse')
}
