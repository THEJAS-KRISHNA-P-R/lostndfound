'use server'

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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.rpc('approve_claim', {
    p_claim_id: claimId,
    p_admin_id: user.id,
    p_admin_note: adminNote,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/claims')
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
  return { success: true }
}
