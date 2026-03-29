'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function sendNotification(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser) return { success: false, error: 'Unauthorized' }

  const recipient_id = (formData.get('recipient_id') as string || '').trim()
  const title = (formData.get('title') as string || '').trim()
  const message = (formData.get('message') as string || '').trim()
  const type = (formData.get('type') as string) || 'info'

  console.log('🔔 [Admin Notify] Incoming Payload:', { recipient_id, title, message, type })

  if (!title || !message) {
    return { success: false, error: 'Title and message are required.' }
  }

  let targetUserId: string | null = null

  if (recipient_id === 'all') {
    // Broadcast logic
    const { data: profiles } = await supabase.from('profiles').select('id')
    if (!profiles?.length) return { success: false, error: 'No users found.' }
    
    const notifications = profiles.map(p => ({
      user_id: p.id, sender_id: adminUser.id, title, message, type,
    }))

    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) return { success: false, error: error.message }
    
    revalidatePath('/admin/notify')
    return { success: true }
  }

  // Determine targetUserId based on identifier type
  if (recipient_id.includes('@')) {
    // Lookup by Email
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', recipient_id)
      .single()
    
    if (error || !profile) return { success: false, error: `User with email "${recipient_id}" not found.` }
    targetUserId = profile.id
  } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipient_id)) {
    // Direct UUID
    targetUserId = recipient_id
  } else {
    // Lookup by Uni ID (uni_reg_no)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('uni_reg_no', recipient_id)
      .single()
    
    if (error || !profile) return { success: false, error: `User with Uni ID "${recipient_id}" not found.` }
    targetUserId = profile.id
  }

  // Insert single notification
  const { error } = await supabase.from('notifications').insert({
    user_id: targetUserId,
    sender_id: adminUser.id,
    title,
    message,
    type,
  })

  if (error) return { success: false, error: error.message }

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
