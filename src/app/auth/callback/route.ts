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
      // Small delay or explicit await can help in some server environments to ensure cookies are flushed
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Handle errors or missing code
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
