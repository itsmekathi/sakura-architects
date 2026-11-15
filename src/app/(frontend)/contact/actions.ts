'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { getPayloadClient } from '@/lib/payload'
import { BUDGETS, PROJECT_TYPES } from '@/lib/constants'

export type ContactState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<string, string>>
}

const schema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  projectType: z.enum(PROJECT_TYPES.map((t) => t.value) as [string, ...string[]]).optional().or(z.literal('')),
  budget: z.enum(BUDGETS.map((b) => b.value) as [string, ...string[]]).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'A few more words would help us respond.').max(5000),
})

// Simple in-memory limiter: fine for a single server. Use a shared store (e.g. Redis) if you scale out.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(key: string) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > MAX_PER_WINDOW
}

export async function submitInquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get('company')) return { status: 'success' }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) {
    return { status: 'error', message: 'Too many messages in a short time. Please try again later or email us directly.' }
  }

  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ||= issue.message
    return { status: 'error', message: 'Please check the highlighted fields.', errors }
  }

  const { phone, projectType, budget, ...rest } = parsed.data
  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'inquiries',
      data: {
        ...rest,
        phone: phone || undefined,
        projectType: (projectType || undefined) as any,
        budget: (budget || undefined) as any,
        status: 'new',
      },
    })
  } catch (err) {
    console.error('Failed to save inquiry', err)
    return { status: 'error', message: 'Something went wrong on our side. Please email us directly.' }
  }

  return { status: 'success', message: 'Thank you. We usually reply within two working days.' }
}
