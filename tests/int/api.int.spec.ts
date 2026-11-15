import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: number[] = []

describe('API', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of created) await payload.delete({ collection: 'inquiries', id })
  })

  it('fetches users', async () => {
    const users = await payload.find({ collection: 'users' })
    expect(users).toBeDefined()
  })

  it('hides inquiries from anonymous visitors', async () => {
    await expect(payload.find({ collection: 'inquiries', overrideAccess: false })).rejects.toThrow()
  })

  it('records a reply in the thread and marks the inquiry replied', async () => {
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: { name: 'Test Visitor', email: 'visitor@example.com', message: 'We would like to build a small house.', status: 'new' },
    })
    created.push(inquiry.id)
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
})
