'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function sendNotification(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const recipientId = formData.get('recipient_id') as string | null
  const title = formData.get('title') as string
  const message = formData.get('message') as string
  const type = (formData.get('type') as string) || 'info'

  if (!title || !message) return { success: false, error: 'Title and message are required.' }

  if (recipientId === 'all') {
    // Get all user IDs
    const { data: profiles } = await supabase.from('profiles').select('id')
    if (!profiles?.length) return { success: false, error: 'No users found.' }

    const notifications = profiles.map(p => ({
      user_id: p.id, sender_id: user.id, title, message, type,
    }))

    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) return { success: false, error: error.message }
  } else {
    if (!recipientId) return { success: false, error: 'Recipient is required.' }
    const { error } = await supabase.from('notifications').insert({
      user_id: recipientId, sender_id: user.id, title, message, type,
    })
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/admin/notify')
  return { success: true }
}

export async function markAllRead(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  revalidatePath('/notifications')
}
