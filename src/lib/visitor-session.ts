import { cookies, headers } from 'next/headers'
import { getFieldsToSign, jwtSign } from 'payload'
import type { Visitor } from '@/payload-types'
import { getPayloadClient } from './payload'

/**
 * Session handling for public site accounts (`visitors`).
 *
 * Both sign-in methods end in the same place: a Payload JWT in the standard `<prefix>-token` cookie,
 * which `payload.auth()` (and Payload's REST API) understand. Password logins get the token from
 * `payload.login()`; Google logins mint it with `jwtSign`, which works because `visitors` has
 * `useSessions: false`.
 *
 * Staff (`users`) and visitors share that cookie name, so signing in as a visitor in the same browser
 * replaces a staff session.
 */

export async function tokenCookieName() {
  const payload = await getPayloadClient()
  return `${payload.config.cookiePrefix || 'payload'}-token`
}

/** The signed-in visitor, or null (also null when the cookie belongs to a staff user). */
export async function getVisitor(): Promise<(Visitor & { collection: 'visitors' }) | null> {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user?.collection === 'visitors' ? (user as Visitor & { collection: 'visitors' }) : null
}

export const sessionCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
})

const maxAgeFromExp = (exp: number | undefined, fallback: number) =>
  exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : fallback

/** For server actions: sets the session cookie via next/headers. */
export async function setSessionCookie(token: string, exp?: number) {
  const payload = await getPayloadClient()
  const maxAge = maxAgeFromExp(exp, payload.collections.visitors.config.auth.tokenExpiration)
  ;(await cookies()).set(await tokenCookieName(), token, sessionCookieOptions(maxAge))
}

export async function clearSessionCookie() {
  ;(await cookies()).delete(await tokenCookieName())
}

/** Mints a session token for a visitor without a password (used by Google sign-in). */
export async function createVisitorToken(visitor: Visitor) {
  const payload = await getPayloadClient()
  const collectionConfig = payload.collections.visitors.config
  const fieldsToSign = getFieldsToSign({
    collectionConfig,
    email: visitor.email,
    user: { ...visitor, collection: 'visitors' } as any,
  })
  const { token, exp } = await jwtSign({
    fieldsToSign,
    secret: payload.secret,
    tokenExpiration: collectionConfig.auth.tokenExpiration,
  })
  return { token, maxAge: maxAgeFromExp(exp, collectionConfig.auth.tokenExpiration) }
}

/** Only allow redirects to same-site paths (no open redirects). */
export function safeNext(next: unknown, fallback = '/account') {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}

export const googleEnabled = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
