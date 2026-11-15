import type { CollectionConfig } from 'payload'
import { authenticated, isAdmin } from '../access'
import { replyEmail, newInquiryEmail } from '../lib/email'
import { BUDGETS, PROJECT_TYPES } from '../lib/constants'

const visitorField = { admin: { readOnly: true } } as const

/**
 * Messages from the public contact form. Staff read them here and reply by typing into
 * "Compose reply" and saving: the reply is emailed to the visitor and logged in the thread.
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'name',
    group: 'Inbox',
    defaultColumns: ['name', 'projectType', 'status', 'createdAt'],
    listSearchableFields: ['name', 'email', 'message'],
    description: 'Messages sent through the website contact form.',
  },
  // Created only by the contact form server action, which uses the Local API.
  access: { read: authenticated, create: authenticated, update: authenticated, delete: isAdmin },
  defaultSort: '-createdAt',
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        const draft = typeof data.replyMessage === 'string' ? data.replyMessage.trim() : ''
        if (operation !== 'update' || !draft) return data

        const to = originalDoc?.email ?? data.email
        const name = originalDoc?.name ?? data.name
        // Throwing here aborts the save, so a failed email never looks like a sent reply.
        await req.payload.sendEmail(replyEmail({ to, name, reply: draft, original: originalDoc?.message }))

        data.replies = [
          ...(originalDoc?.replies ?? []),
          { message: draft, sentAt: new Date().toISOString(), sentBy: req.user?.id },
        ]
        data.replyMessage = ''
        data.status = 'replied'
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        try {
          const settings = await req.payload.findGlobal({ slug: 'site-settings', req })
          const inbox = process.env.STUDIO_INBOX_EMAIL || settings?.email
          if (inbox) await req.payload.sendEmail(newInquiryEmail({ to: inbox, inquiry: doc }))
        } catch (err) {
          req.payload.logger.error({ err, msg: 'Failed to send new-inquiry notification' })
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, ...visitorField },
        { name: 'email', type: 'email', required: true, ...visitorField },
        { name: 'phone', type: 'text', ...visitorField },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'projectType', type: 'select', options: PROJECT_TYPES, ...visitorField },
        { name: 'budget', type: 'select', options: BUDGETS, ...visitorField },
      ],
    },
    { name: 'message', type: 'textarea', required: true, ...visitorField },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Replied', value: 'replied' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    {
      name: 'replyMessage',
      label: 'Compose reply',
      type: 'textarea',
      admin: {
        description:
          'Type a reply and click Save. It is emailed to the visitor, added to the thread below, and the status becomes "Replied".',
      },
    },
    {
      name: 'replies',
      label: 'Reply thread',
      type: 'array',
      admin: { readOnly: true, initCollapsed: false },
      fields: [
        { name: 'message', type: 'textarea', required: true },
        {
          type: 'row',
          fields: [
            { name: 'sentAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
            { name: 'sentBy', type: 'relationship', relationTo: 'users' },
          ],
        },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Only visible to staff.' },
    },
    { name: 'source', type: 'text', defaultValue: 'contact-form', admin: { position: 'sidebar', readOnly: true } },
  ],
}
