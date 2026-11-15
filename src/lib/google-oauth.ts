import { createHash, randomBytes } from 'crypto'
import { decodeJwt } from 'jose'
import { SITE_URL } from './site-url'

// Google sign-in with the OAuth 2.0 Authorization Code flow + PKCE.
// Setup: README → "Google sign-in". Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.

export const GOOGLE_STATE_COOKIE = 'g_oauth'
export const redirectUri = () => `${SITE_URL}/auth/google/callback`

const b64url = (buf: Buffer) => buf.toString('base64url')

export function createAuthRequest() {
  const state = b64url(randomBytes(24))
  const verifier = b64url(randomBytes(32))
  const challenge = b64url(createHash('sha256').update(verifier).digest())
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString()
  return { url: url.toString(), state, verifier }
}

export type GoogleProfile = { sub: string; email: string; name?: string }

/**
 * Exchanges the authorization code for tokens and returns the verified profile.
 * The ID token comes straight from Google's token endpoint over TLS, so per OpenID Connect
 * its signature need not be re-checked, but issuer, audience, expiry and email verification are.
 */
export async function exchangeCode(code: string, verifier: string): Promise<GoogleProfile> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`)
  const { id_token } = (await res.json()) as { id_token?: string }
  if (!id_token) throw new Error('Google returned no ID token')

  const claims = decodeJwt(id_token)
  const issOk = claims.iss === 'https://accounts.google.com' || claims.iss === 'accounts.google.com'
  const audOk = Array.isArray(claims.aud)
    ? claims.aud.includes(process.env.GOOGLE_CLIENT_ID!)
    : claims.aud === process.env.GOOGLE_CLIENT_ID
  const notExpired = typeof claims.exp === 'number' && claims.exp * 1000 > Date.now()
  if (!issOk || !audOk || !notExpired) throw new Error('Invalid Google ID token')
  if (claims.email_verified !== true || typeof claims.email !== 'string' || typeof claims.sub !== 'string') {
    throw new Error('Google account email is not verified')
  }
  return { sub: claims.sub, email: claims.email.toLowerCase(), name: typeof claims.name === 'string' ? claims.name : undefined }
}
