import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('Auth callback - URL:', requestUrl.toString())
  console.log('Auth callback - Code present:', !!code)
  console.log('Auth callback - Origin:', origin)

  if (code) {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Supabase auth error:', error)
        return NextResponse.redirect(`${origin}/login?error=supabase_error`)
      }

      if (data.user) {
        console.log('User authenticated:', data.user.email)

        // Redirect to studio with a success flag to prevent loops
        return NextResponse.redirect(`${origin}/studio?auth=success`)
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/login?error=callback_exception`)
    }
  }

  // No code or auth failed
  console.log('No code found, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=no_auth_code`)
}
