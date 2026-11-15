import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const createdInquiries: number[] = []
const createdVisitors: number[] = []
const createdPosts: number[] = []

const consent = { contact: true, dataNotice: true, text: 'test wording' }
const asVisitor = (v: { id: number; email: string }) => ({ ...v, collection: 'visitors' }) as any

async function makeVisitor(email: string) {
  await payload.delete({ collection: 'visitors', where: { email: { equals: email } } })
  const v = await payload.create({ collection: 'visitors', data: { email, password: 'test-password-123', name: 'Test' } })
  createdVisitors.push(v.id)
  return v
}

async function makeInquiry(data: Record<string, unknown>) {
  const doc = await payload.create({
    collection: 'inquiries',
    data: { email: 'visitor@example.com', message: 'We would like to build a small house.', status: 'new', consent, ...data } as any,
  })
  createdInquiries.push(doc.id)
  return doc
}

describe('API', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of createdInquiries) await payload.delete({ collection: 'inquiries', id }).catch(() => {})
    for (const id of createdPosts) await payload.delete({ collection: 'posts', id }).catch(() => {})
    for (const id of createdVisitors) await payload.delete({ collection: 'visitors', id }).catch(() => {})
  })

  it('fetches users', async () => {
    const users = await payload.find({ collection: 'users' })
    expect(users).toBeDefined()
  })

  it('hides inquiries from anonymous visitors', async () => {
    await expect(payload.find({ collection: 'inquiries', overrideAccess: false })).rejects.toThrow()
  })

  it('rejects an inquiry without consent', async () => {
    await expect(
      payload.create({
        collection: 'inquiries',
        data: { email: 'x@example.com', message: 'No consent given here.', status: 'new' } as any,
      }),
    ).rejects.toThrow()
  })

  it('records anonymous submissions with a default name and consent timestamp', async () => {
    const doc = await makeInquiry({})
    expect(doc.name).toBe('Anonymous visitor')
    expect(doc.submittedAs).toBe('anonymous')
    expect(doc.consent?.consentedAt).toBeTruthy()
  })

  it('records a reply in the thread and marks the inquiry replied', async () => {
    const inquiry = await makeInquiry({ name: 'Test Visitor' })
    expect(inquiry.status).toBe('new')

    const updated = await payload.update({
      collection: 'inquiries',
      id: inquiry.id,
      data: { replyMessage: 'Thanks, we would love to help. When can we visit the site?' },
    })

    expect(updated.status).toBe('replied')
    expect(updated.replyMessage).toBeFalsy()
    expect(updated.replies).toHaveLength(1)
    expect(updated.replies?.[0]?.message).toContain('visit the site')
  })

  describe('site visitor accounts', () => {
    it('a visitor sees only their own inquiries, without staff-only fields', async () => {
      const alice = await makeVisitor('alice-test@example.com')
      const bob = await makeVisitor('bob-test@example.com')
      const mine = await makeInquiry({ visitor: alice.id, email: alice.email, internalNotes: 'secret staff note' })
      await makeInquiry({ visitor: bob.id, email: bob.email })

      const res = await payload.find({ collection: 'inquiries', overrideAccess: false, user: asVisitor(alice) })
      expect(res.docs.map((d) => d.id)).toEqual([mine.id])
      expect(res.docs[0].submittedAs).toBe('account')
      expect(res.docs[0].internalNotes).toBeUndefined()
    })

    it('a visitor cannot change content or read staff users', async () => {
      const v = await makeVisitor('mallory-test@example.com')
      const user = asVisitor(v)
      await expect(
        payload.create({ collection: 'jobs', data: { title: 'Hacked', description: 'x' }, overrideAccess: false, user }),
      ).rejects.toThrow()
      await expect(payload.find({ collection: 'users', overrideAccess: false, user })).rejects.toThrow()
      await expect(
        payload.update({ collection: 'site-settings' as any, id: 1, data: {}, overrideAccess: false, user }),
      ).rejects.toThrow()
    })

    it('a visitor cannot see scheduled journal posts', async () => {
      const v = await makeVisitor('eve-test@example.com')
      const future = await payload.create({
        collection: 'posts',
        data: {
          title: 'Scheduled post test',
          excerpt: 'Not yet',
          publishedAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          body: {
            root: {
              type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
              children: [{ type: 'paragraph', direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '',
                children: [{ type: 'text', text: 'Soon.', format: 0, detail: 0, mode: 'normal', style: '', version: 1 }] }],
            },
          } as any,
        },
        context: { disableRevalidate: true },
      })
      createdPosts.push(future.id)
      const res = await payload.find({ collection: 'posts', overrideAccess: false, user: asVisitor(v), limit: 100 })
      expect(res.docs.some((p) => p.id === future.id)).toBe(false)
    })

    it('a visitor can read their own account but not other visitors', async () => {
      const a = await makeVisitor('carol-test@example.com')
      const b = await makeVisitor('dave-test@example.com')
      const res = await payload.find({ collection: 'visitors', overrideAccess: false, user: asVisitor(a) })
      expect(res.docs.map((d) => d.id)).toEqual([a.id])
      expect(res.docs.some((d) => d.id === b.id)).toBe(false)
    })
  })
})
