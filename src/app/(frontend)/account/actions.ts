'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getPayloadClient } from '@/lib/payload'
import { clientIp, rateLimited } from '@/lib/rate-limit'
import { clearSessionCookie, getVisitor, safeNext, setSessionCookie } from '@/lib/visitor-session'
import { parseIndianPhone, PHONE_ERROR } from '@/lib/phone'

const phone = z
  .string()
  .trim()
  .max(40)
  .optional()
  .refine((v) => !v || parseIndianPhone(v), PHONE_ERROR)

export type FormState = {
  status: 'idle' | 'error' | 'success'
  message?: string
  errors?: Partial<Record<string, string>>
}

const fieldErrors = (issues: z.ZodIssue[]) => {
  const errors: Record<string, string> = {}
  for (const i of issues) errors[String(i.path[0])] ||= i.message
  return errors
}

const email = z.string().trim().toLowerCase().email('Please enter a valid email address.')
const password = z.string().min(8, 'Use at least 8 characters.').max(200)

async function limited(action: string, max = 10) {
  return rateLimited(`${action}:${await clientIp()}`, max, 10 * 60 * 1000)
}

// ── Sign up ─────────────────────────────────────────────────────────────

const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Please tell us your name.').max(120),
    email,
    phone,
    password,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'The passwords do not match.' })

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  if (await limited('signup', 5)) return { status: 'error', message: 'Too many attempts. Please try again later.' }
  const parsed = signupSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: 'error', message: 'Please check the highlighted fields.', errors: fieldErrors(parsed.error.issues) }
  const { name, email, password } = parsed.data
  const phoneDisplay = parseIndianPhone(parsed.data.phone)?.display

  const payload = await getPayloadClient()
  const existing = await payload.find({ collection: 'visitors', where: { email: { equals: email } }, limit: 1 })
  if (existing.docs[0]) {
    return {
      status: 'error',
      errors: { email: 'An account with this email already exists. Sign in instead, or use “Forgot password”.' },
    }
  }
  await payload.create({ collection: 'visitors', data: { name, email, phone: phoneDisplay, password, provider: 'password' } })
  const { token, exp } = await payload.login({ collection: 'visitors', data: { email, password } })
  if (token) await setSessionCookie(token, exp)
  redirect(safeNext(formData.get('next')))
}

// ── Sign in / out ───────────────────────────────────────────────────────

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (await limited('login')) return { status: 'error', message: 'Too many attempts. Please try again later.' }
  const parsed = z.object({ email, password: z.string().min(1, 'Enter your password.') }).safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: 'error', errors: fieldErrors(parsed.error.issues) }

  const payload = await getPayloadClient()
  try {
    const { token, exp } = await payload.login({ collection: 'visitors', data: parsed.data })
    if (!token) throw new Error('No token')
    await setSessionCookie(token, exp)
  } catch (err) {
    const locked = err instanceof Error && /lock/i.test(err.message)
    return {
      status: 'error',
      message: locked
        ? 'This account is temporarily locked after too many attempts. Try again in 10 minutes.'
        : 'Incorrect email or password. If you signed up with Google, use “Continue with Google”.',
    }
  }
  redirect(safeNext(formData.get('next')))
}

export async function logout(formData: FormData) {
  await clearSessionCookie()
  redirect(safeNext(formData.get('next'), '/'))
}

// ── Password reset ──────────────────────────────────────────────────────

export async function forgotPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  if (await limited('forgot', 5)) return { status: 'error', message: 'Too many attempts. Please try again later.' }
  const parsed = z.object({ email }).safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: 'error', errors: fieldErrors(parsed.error.issues) }
  const payload = await getPayloadClient()
  try {
    await payload.forgotPassword({ collection: 'visitors', data: { email: parsed.data.email } })
  } catch (err) {
    payload.logger.error({ err, msg: 'forgotPassword failed' })
  }
  // Same answer whether or not the account exists, so emails can't be probed.
  return { status: 'success', message: 'If an account exists for that email, we’ve sent a link to reset the password.' }
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ token: z.string().min(1), password, confirm: z.string() })
    .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'The passwords do not match.' })
    .safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: 'error', errors: fieldErrors(parsed.error.issues) }
  const payload = await getPayloadClient()
  try {
    const result = await payload.resetPassword({
      collection: 'visitors',
      data: { token: parsed.data.token, password: parsed.data.password },
      overrideAccess: true,
    })
    if (result.token) await setSessionCookie(result.token)
  } catch {
    return { status: 'error', message: 'This reset link is invalid or has expired. Please request a new one.' }
  }
  redirect('/account')
}

// ── Profile & deletion ──────────────────────────────────────────────────

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const visitor = await getVisitor()
  if (!visitor) redirect('/account/login')
  const parsed = z
    .object({ name: z.string().trim().min(2, 'Please enter your name.').max(120), phone })
    .safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: 'error', errors: fieldErrors(parsed.error.issues) }
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'visitors',
    id: visitor.id,
    data: { name: parsed.data.name, phone: parseIndianPhone(parsed.data.phone)?.display ?? null },
    overrideAccess: false,
    user: visitor,
  })
  return { status: 'success', message: 'Saved.' }
}

/** Deletes the account and all its enquiries, as promised in the data notice. */
export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const visitor = await getVisitor()
  if (!visitor) redirect('/account/login')
  if (String(formData.get('confirm') ?? '').trim().toLowerCase() !== 'delete') {
    return { status: 'error', errors: { confirm: 'Type DELETE to confirm.' } }
  }
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'inquiries', where: { visitor: { equals: visitor.id } } })
  await payload.delete({ collection: 'visitors', id: visitor.id })
  await clearSessionCookie()
  redirect('/?account=deleted')
}
