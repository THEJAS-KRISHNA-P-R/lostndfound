import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // Check if this is a new user (profile is PENDING-*)
      const { data: profile } = await supabase
        .from('profiles')
        .select('uni_reg_no')
        .eq('id', data.session.user.id)
        .single()
        
      const isNew = !profile?.uni_reg_no || profile.uni_reg_no.startsWith('PENDING')
      const redirectUrl = isNew ? `${origin}${next}?signup=true` : `${origin}${next}`
      
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle errors or missing code
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
