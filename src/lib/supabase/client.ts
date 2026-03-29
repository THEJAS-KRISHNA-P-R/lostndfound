import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { isSingleton: true }
    )
  }

  // @ts-expect-error - Attach strictly to window to survive Turbopack HMR re-evaluations
  if (!window.__supaClient) {
    // @ts-expect-error - Singleton pattern for browser client
    window.__supaClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        isSingleton: true,
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Bypass global navigator.locks in browser to prevent "Lock stolen" noise/interruption
          // in SSR hydration and development mode HMR.
          lock: async (name, timeout, fn) => {
            return await fn()
          }
        }
      }
    )
  }

  // @ts-expect-error - Return the global singleton client
  return window.__supaClient
}
