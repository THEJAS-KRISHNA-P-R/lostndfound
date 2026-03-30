import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      auth: {
        // Bypass global navigator.locks on the Node server to prevent lock stealing 
        // during concurrent SSR hydration/Server Component rendering.
        lock: (name, timeout, fn) => fn()
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes — redirect to login if no session
  const protectedPaths = ['/post', '/claim', '/profile', '/notifications']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Onboarding enforcement — Redirect users with PENDING status to Home to complete modal
  if (user && isProtected && (request.nextUrl.pathname.startsWith('/post') || request.nextUrl.pathname.startsWith('/claim'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('uni_reg_no')
      .eq('id', user.id)
      .single()

    if (!profile || profile.uni_reg_no === 'PENDING') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Admin routes — check role from profiles
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/browse'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/browse'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
