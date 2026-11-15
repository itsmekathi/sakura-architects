import { randomBytes } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import type { Visitor } from '@/payload-types'
import { exchangeCode, GOOGLE_STATE_COOKIE } from '@/lib/google-oauth'
import { getPayloadClient } from '@/lib/payload'
import { createVisitorToken, safeNext, sessionCookieOptions, tokenCookieName } from '@/lib/visitor-session'
import { SITE_URL } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

const fail = (reason: string) => {
  const res = NextResponse.redirect(new URL(`/account/login?error=${reason}`, SITE_URL))
  res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: '/auth/google' })
  return res
}

/** Google redirects here after sign-in. Finds or creates the visitor account and starts a session. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  if (params.get('error')) return fail('google-cancelled')

  let saved: { state?: string; verifier?: string; next?: string } = {}
  try {
    saved = JSON.parse(req.cookies.get(GOOGLE_STATE_COOKIE)?.value ?? '{}')
  } catch {}
  const code = params.get('code')
  if (!code || !saved.state || !saved.verifier || params.get('state') !== saved.state) return fail('google-state')

  const payload = await getPayloadClient()
  let visitor: Visitor
  try {
    const profile = await exchangeCode(code, saved.verifier)

    const bySub = await payload.find({ collection: 'visitors', where: { googleSub: { equals: profile.sub } }, limit: 1 })
    if (bySub.docs[0]) {
      visitor = bySub.docs[0]
    } else {
      // Google verified this email, so it is safe to link an existing email/password account.
      const byEmail = await payload.find({ collection: 'visitors', where: { email: { equals: profile.email } }, limit: 1 })
      visitor = byEmail.docs[0]
        ? await payload.update({ collection: 'visitors', id: byEmail.docs[0].id, data: { googleSub: profile.sub } })
        : await payload.create({
            collection: 'visitors',
            data: {
              email: profile.email,
              name: profile.name,
              provider: 'google',
              googleSub: profile.sub,
              // Required by Payload's auth; never shown. The visitor can set one via "Forgot password".
              password: randomBytes(32).toString('base64url'),
            },
          })
    }
  } catch (err) {
    payload.logger.error({ err, msg: 'Google sign-in failed' })
    return fail('google')
  }

  const { token, maxAge } = await createVisitorToken(visitor)
  const res = NextResponse.redirect(new URL(safeNext(saved.next), SITE_URL))
  res.cookies.set(await tokenCookieName(), token, sessionCookieOptions(maxAge))
  res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: '/auth/google' })
  return res
}
