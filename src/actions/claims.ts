'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ClaimSchema } from '@/lib/validations/claim'
import type { ActionResult } from '@/types'

export async function createClaim(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in to submit a claim.' }

  const itemId = formData.get('item_id') as string
  if (!itemId) return { success: false, error: 'Item ID is required.' }

  // Ensure user isn't claiming their own item
  const { data: item } = await supabase
    .from('items')
    .select('user_id')
    .eq('id', itemId)
    .single()

  if (item?.user_id === user.id) {
    return { success: false, error: 'You cannot claim your own item.' }
  }

  const raw = {
    description: formData.get('description'),
    proof_images: formData.getAll('proof_images').filter(Boolean) as string[],
  }

  const parsed = ClaimSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { error } = await supabase.from('claims').insert({
    item_id: itemId,
    claimer_id: user.id,
    description: parsed.data.description,
    proof_images: parsed.data.proof_images,
  })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You have already submitted a claim for this item.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath(`/items/${itemId}`)
  return { success: true }
}

export async function approveClaim(claimId: string, adminNote: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  // High-privilege client to fetch private contact info for coordination
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // 1. Fetch Claim, Item, and Profiles
  const { data: claim } = await adminSupabase
    .from('claims')
    .select(`*, items(id, title, user_id, type), profiles:claimer_id(id, full_name, email, phone)`)
    .eq('id', claimId)
    .single()

  if (!claim || !claim.items || !claim.profiles) {
    return { success: false, error: 'Claim or Item details not found.' }
  }

  const claimItem = claim.items as any
  const founderId = claimItem.user_id
  const itemTitle = claimItem.title
  const itemType = claimItem.type
  const claimee = claim.profiles as any

  // 2. Execute existing RPC for database consistency
  const { error: rpcError } = await supabase.rpc('approve_claim', {
    p_claim_id: claimId,
    p_admin_id: admin.id,
    p_admin_note: adminNote,
  })

  if (rpcError) return { success: false, error: rpcError.message }

  // 3. Automated Messaging / Notifications
  try {
    const isReturningLost = itemType === 'lost'

    // Notify the Poster (The person who needs the item back OR the person who found it)
    await adminSupabase.from('notifications').insert({
      user_id: founderId,
      sender_id: admin.id,
      title: isReturningLost ? 'Item Found — Action Required' : 'Claim Approved — Action Required',
      message: isReturningLost 
        ? `Great news! ${claimee.full_name} has found your "${itemTitle}." Please coordinate the return using their contact details.`
        : `Great news! The claim for "${itemTitle}" has been approved. Please coordinate the return with ${claimee.full_name}.`,
      type: 'contact_shared',
      metadata: {
        name: claimee.full_name,
        email: claimee.email,
        phone: claimee.phone,
        admin_note: adminNote
      }
    })

    // Notify the Submitter
    await adminSupabase.from('notifications').insert({
      user_id: claim.claimer_id,
      sender_id: admin.id,
      title: isReturningLost ? 'Your Found Report was Approved! ✅' : 'Your Claim was Approved! ✅',
      message: isReturningLost
        ? `Your report for "${itemTitle}" has been verified. The owner has been notified and will reach out to you using your contact details soon.`
        : `Your claim for "${itemTitle}" has been approved by our team. The owner has been notified and will reach out to you via your contact details soon.`,
      type: 'claim_approved',
      metadata: { item_title: itemTitle, admin_note: adminNote }
    })
  } catch (notifWarn) {
    console.error('Notification Warning:', notifWarn)
  }

  revalidatePath('/admin/claims')
  revalidatePath('/notifications')
  revalidatePath(`/items/${claim.item_id}`)
  return { success: true }
}

export async function rejectClaim(claimId: string, reason: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Get claim details for notification
  const { data: claim } = await supabase
    .from('claims')
    .select('claimer_id, item_id')
    .eq('id', claimId)
    .single()

  if (!claim) return { success: false, error: 'Claim not found.' }

  const { error: updateError } = await supabase
    .from('claims')
    .update({ status: 'rejected', admin_note: reason, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq('id', claimId)

  if (updateError) return { success: false, error: updateError.message }

  // Send rejection notification
  await supabase.from('notifications').insert({
    user_id: claim.claimer_id,
    sender_id: user.id,
    title: 'Claim Rejected',
    message: `Your claim has been reviewed and rejected. Reason: ${reason}`,
    type: 'claim_rejected',
  })

  revalidatePath('/admin/claims')
  revalidatePath('/notifications')
  revalidatePath(`/items/${claim.item_id}`)
  return { success: true }
}
