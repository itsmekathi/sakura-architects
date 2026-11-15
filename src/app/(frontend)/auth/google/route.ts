import { NextResponse, type NextRequest } from 'next/server'
import { createAuthRequest, GOOGLE_STATE_COOKIE } from '@/lib/google-oauth'
import { googleEnabled, safeNext } from '@/lib/visitor-session'
import { SITE_URL } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

/** Starts Google sign-in: remembers state, PKCE verifier and where to return, then redirects to Google. */
export async function GET(req: NextRequest) {
  const next = safeNext(req.nextUrl.searchParams.get('next'))
  if (!googleEnabled()) {
    return NextResponse.redirect(new URL(`/account/login?error=google-disabled&next=${encodeURIComponent(next)}`, SITE_URL))
  }
  const { url, state, verifier } = createAuthRequest()
  const res = NextResponse.redirect(url)
  res.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, verifier, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // must survive the top-level redirect back from Google
    path: '/auth/google',
    maxAge: 600,
  })
  return res
}
