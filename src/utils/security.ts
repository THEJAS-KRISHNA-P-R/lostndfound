import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

/**
 * Ensures the user is authenticated and returns the User object.
 * Throws a redirect to /login if not authenticated.
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  return user
}

/**
 * Ensures the user has completed their profile (onboarded).
 * Throws an error or returns the profile.
 */
export async function requireOnboarded(userId: string): Promise<Profile> {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error || !profile || profile.uni_reg_no === 'PENDING') {
    throw new Error('Onboarding required')
  }
  
  return profile as Profile
}

/**
 * Ensures the user has an admin role.
 * Throws a redirect to 403 or error if not admin.
 */
export async function requireAdmin(userId: string): Promise<Profile> {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  
  return profile as Profile
}

/**
 * Verifies that the user owns the specified item.
 */
export async function verifyItemOwnership(itemId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from('items')
    .select('user_id')
    .eq('id', itemId)
    .single()
    
  if (error || !item || item.user_id !== userId) {
    throw new Error('Unauthorized: You do not own this item')
  }
}
