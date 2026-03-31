'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ClaimSchema } from '@/lib/validations/claim'
import { requireAuth, requireOnboarded, requireAdmin } from '@/utils/security'
import { sanitize } from '@/utils/sanitize'
import type { ActionResult } from '@/types'

export async function createClaim(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth()
  await requireOnboarded(user.id)

  const supabase = await createClient()

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
    description: sanitize(formData.get('description') as string),
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
  const admin = await requireAuth()
  await requireAdmin(admin.id)

  const supabase = await createClient()

  // High-privilege client to fetch private contact info for coordination
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => { } } }
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

  const claimItem = claim.items as unknown as { id: string; title: string; user_id: string; type: string }
  const founderId = claimItem.user_id
  const itemTitle = claimItem.title
  const itemType = claimItem.type
  const claimee = claim.profiles as unknown as { full_name: string; email: string; phone: string }

  // 2. Execute existing RPC for database consistency
  const { error: rpcError } = await supabase.rpc('approve_claim', {
    p_claim_id: claimId,
    p_admin_id: admin.id,
    p_admin_note: adminNote,
  })

  if (rpcError) return { success: false, error: rpcError.message }

  // 3. Automated Messaging / Notifications
  try {
    const isLostItem = itemType === 'lost'

    // Poster Notification (The person who originally created the item post)
    await adminSupabase.from('notifications').insert({
      user_id: founderId, // Actually the posterId
      sender_id: admin.id,
      title: isLostItem
        ? 'Your Lost Item was Found!'
        : 'Owner Verified for Found Item',
      message: isLostItem
        ? `Great news! ${claimee.full_name} has reported finding your lost item: "${itemTitle}". Please reach out to them using the provided contact details to coordinate the return.`
        : `We've successfully verified the owner for the item you found: "${itemTitle}". Please coordinate the safe return with ${claimee.full_name} using the provided contact details.`,
      type: 'contact_shared',
      metadata: {
        name: claimee.full_name,
        email: claimee.email,
        phone: claimee.phone,
        admin_note: adminNote
      }
    })

    // Submitter Notification (The person who clicked "Claim" or "I found this")
    await adminSupabase.from('notifications').insert({
      user_id: claim.claimer_id,
      sender_id: admin.id,
      title: isLostItem
        ? 'Found Report Approved'
        : 'Your Claim was Approved!',
      message: isLostItem
        ? `Thank you! Your report for finding "${itemTitle}" has been verified. The owner has been securely sent your contact details and will reach out to you soon.`
        : `Great news! Your ownership claim for "${itemTitle}" has been fully verified. The finder has been notified and provided with your contact details so you can coordinate the return.`,
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
  const user = await requireAuth()
  await requireAdmin(user.id)

  const supabase = await createClient()

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

export async function confirmHandover(
  claimId: string,
  role: 'poster' | 'claimer'
): Promise<ActionResult> {
  const user = await requireAuth()

  const supabase = await createClient()

  const col = role === 'poster' ? 'poster_confirmed_at' : 'claimer_confirmed_at'
  const { error } = await supabase
    .from('claims')
    .update({ [col]: new Date().toISOString() })
    .eq('id', claimId)
    .eq(role === 'poster' ? 'items(user_id)' : 'claimer_id', user.id) // Verify role matches user
  if (error) return { success: false, error: error.message }

  // Auto-resolve when both sides confirm
  const { data: updated } = await supabase
    .from('claims')
    .select('poster_confirmed_at, claimer_confirmed_at, item_id')
    .eq('id', claimId)
    .single()

  if (updated?.poster_confirmed_at && updated?.claimer_confirmed_at) {
    await supabase.from('items').update({ status: 'resolved' }).eq('id', updated.item_id)
    revalidatePath(`/items/${updated.item_id}`)
  }
  revalidatePath(`/items/${updated?.item_id}`)
  return { success: true }
}

export async function assignToSecurityDesk(
  itemId: string,
  location: string
): Promise<ActionResult> {
  const user = await requireAuth()
  await requireAdmin(user.id)

  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .update({ security_location: location })
    .eq('id', itemId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/items')
  revalidatePath('/admin')
  return { success: true }
}
