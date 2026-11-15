'use server'

import { z } from 'zod'
import { getPayloadClient } from '@/lib/payload'
import { BUDGETS, PROJECT_TYPES } from '@/lib/constants'
import { consentTextsFromSettings } from '@/lib/consent'
import { clientIp, rateLimited } from '@/lib/rate-limit'
import { getVisitor } from '@/lib/visitor-session'

export type ContactState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<string, string>>
}

const optionalEnum = (values: string[]) => z.enum(values as [string, ...string[]]).optional().or(z.literal(''))

const schema = z
  .object({
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
    phone: z.string().trim().max(40).optional(),
    preferredContact: z.enum(['email', 'phone', 'either'], { message: 'Choose how we should contact you.' }),
    projectType: optionalEnum(PROJECT_TYPES.map((t) => t.value)),
    budget: optionalEnum(BUDGETS.map((b) => b.value)),
    message: z.string().trim().min(10, 'A few more words would help us respond.').max(5000),
    consentContact: z.literal('on', { message: 'Please confirm we may contact you.' }),
    consentData: z.literal('on', { message: 'Please confirm you’ve read how we store your data.' }),
  })
  .refine((d) => d.preferredContact === 'email' || Boolean(d.phone), {
    path: ['phone'],
    message: 'Add a phone number so we can call you, or choose email.',
  })

export async function submitInquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get('company')) return { status: 'success' }

  if (rateLimited(`contact:${await clientIp()}`, 5, 10 * 60 * 1000)) {
    return { status: 'error', message: 'Too many messages in a short time. Please try again later or email us directly.' }
  }

  const visitor = await getVisitor()
  const input = Object.fromEntries(formData)
  // Signed-in visitors always send from their account email.
  if (visitor) input.email = visitor.email

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ||= issue.message
    const consentMissing = errors.consentContact || errors.consentData
    return {
      status: 'error',
      message: consentMissing && Object.keys(errors).length <= 2 ? consentMissing : 'Please check the highlighted fields.',
      errors,
    }
  }

  const d = parsed.data
  try {
    const payload = await getPayloadClient()
    // Snapshot the wording the visitor agreed to (from Site settings, never from the browser).
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    const texts = consentTextsFromSettings(settings)
    await payload.create({
      collection: 'inquiries',
      data: {
        name: d.name || visitor?.name || undefined,
        email: d.email,
        phone: d.phone || undefined,
        preferredContact: d.preferredContact,
        projectType: (d.projectType || undefined) as any,
        budget: (d.budget || undefined) as any,
        message: d.message,
        status: 'new',
        visitor: visitor?.id,
        consent: {
          contact: true,
          dataNotice: true,
          text: `${texts.contact}\n\n---\n\n${texts.dataNotice}`,
        },
      },
    })
  } catch (err) {
    console.error('Failed to save inquiry', err)
    return { status: 'error', message: 'Something went wrong on our side. Please email us directly.' }
  }

  return {
    status: 'success',
    message: visitor
      ? 'Thank you. You can follow this enquiry and our reply in My account.'
      : 'Thank you. We usually reply within two working days.',
  }
}
