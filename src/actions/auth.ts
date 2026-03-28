'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginSchema, RegisterSchema } from '@/lib/validations/auth'
import type { ActionResult } from '@/types'

export async function login(formData: FormData): Promise<ActionResult<{ role: string }>> {
  const raw = { email: formData.get('email'), password: formData.get('password') }
  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { success: false, error: 'Invalid email or password.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  revalidatePath('/', 'layout')
  return { success: true, data: { role: profile?.role || 'user' } }
}

export async function register(formData: FormData): Promise<ActionResult> {
  const raw = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    uni_reg_no: formData.get('uni_reg_no'),
    phone: formData.get('phone') || '',
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { full_name, email, uni_reg_no, phone, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, uni_reg_no, phone: phone || null },
    },
  })

  if (error) return { success: false, error: error.message }

  return { success: true, data: undefined }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
