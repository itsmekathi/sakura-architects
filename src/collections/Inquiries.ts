import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff, isStaffField, isStaffUser, isVisitorUser } from '../access'
import { replyEmail, newInquiryEmail } from '../lib/email'
import { PROJECT_TYPES } from '../lib/constants'
import { BUDGET_RANGES, budgetSummary } from '../lib/budget'
import { isIndianPhone, PHONE_ERROR } from '../lib/phone'

const visitorField = { admin: { readOnly: true } } as const

const requiredOnCreate =
  (message: string) =>
  (value: unknown, { operation }: { operation?: string }) =>
    operation === 'create' && value !== true ? message : true

/**
 * Messages from the public contact form. Staff read them here and reply by typing into
 * "Compose reply" and saving: the reply is emailed to the visitor and logged in the thread.
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'name',
    group: 'Inbox',
    defaultColumns: ['name', 'budget', 'submittedAs', 'preferredContact', 'status', 'createdAt'],
    listSearchableFields: ['name', 'email', 'message'],
    description: 'Messages sent through the website contact form.',
  },
  access: {
    // Staff see everything; a signed-in visitor sees only their own enquiries (at /account).
    read: ({ req: { user } }) => {
      if (isStaffUser(user)) return true
      if (isVisitorUser(user)) return { visitor: { equals: user!.id } }
      return false
    },
    // Created only by the contact form server action, which uses the Local API.
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  defaultSort: '-createdAt',
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          data.submittedAs = data.visitor ? 'account' : 'anonymous'
          if (data.consent?.contact && data.consent?.dataNotice) data.consent.consentedAt = new Date().toISOString()
          // Presets carry their own bounds, so staff can sort and filter every enquiry by amount.
          const preset = BUDGET_RANGES.find((r) => r.value === data.budgetRange && r.value !== 'custom')
          if (preset) {
            data.budgetMin = preset.min ?? null
            data.budgetMax = preset.max ?? null
          }
          data.budget = budgetSummary(data.budgetRange, data.budgetMin, data.budgetMax) || undefined
        }
        return data
      },
      async ({ data, originalDoc, operation, req }) => {
        const draft = typeof data.replyMessage === 'string' ? data.replyMessage.trim() : ''
        if (operation !== 'update' || !draft) return data

        const to = originalDoc?.email ?? data.email
        const name = originalDoc?.name ?? data.name
        // Throwing here aborts the save, so a failed email never looks like a sent reply.
        const hasAccount = Boolean(originalDoc?.visitor ?? data.visitor)
        await req.payload.sendEmail(replyEmail({ to, name, reply: draft, original: originalDoc?.message, hasAccount }))

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
        {
          name: 'name',
          type: 'text',
          ...visitorField,
          // Required for new enquiries; enforced here (not as NOT NULL) so older rows stay valid.
          validate: (value: unknown, { operation }: { operation?: string }) =>
            operation === 'create' && !(typeof value === 'string' && value.trim()) ? 'Name is required.' : true,
        },
        { name: 'email', type: 'email', required: true, ...visitorField },
        {
          name: 'phone',
          type: 'text',
          ...visitorField,
          // Checked on create only, so staff can still save (reply to) older enquiries.
          validate: (value: unknown, { data, operation }: { data: any; operation?: string }) => {
            if (operation !== 'create') return true
            if (!value) {
              return ['phone', 'either'].includes(data?.preferredContact)
                ? 'A phone number is needed when phone is a preferred contact method.'
                : true
            }
            return isIndianPhone(value) ? true : PHONE_ERROR
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'projectType', type: 'select', options: PROJECT_TYPES, ...visitorField },
        {
          name: 'budgetRange',
          type: 'select',
          options: BUDGET_RANGES.map(({ value, label }) => ({ value, label })),
          ...visitorField,
        },
        {
          name: 'preferredContact',
          type: 'select',
          // Email by default: a missing phone number then never blocks a save made outside the form.
          defaultValue: 'email',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Either', value: 'either' },
          ],
          ...visitorField,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'budget',
          label: 'Budget (summary)',
          type: 'text',
          admin: { readOnly: true, description: 'Filled in automatically, e.g. “₹40 lakh – ₹60 lakh”.' },
        },
        { name: 'budgetMin', label: 'Budget from (₹)', type: 'number', min: 0, ...visitorField },
        { name: 'budgetMax', label: 'Budget up to (₹)', type: 'number', min: 0, ...visitorField },
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
      name: 'submittedAs',
      type: 'select',
      options: [
        { label: 'Anonymous', value: 'anonymous' },
        { label: 'Signed in', value: 'account' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'visitor',
      label: 'Site account',
      type: 'relationship',
      relationTo: 'visitors',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Set when the visitor was signed in.' },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      access: { read: isStaffField },
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
      access: { read: isStaffField },
      admin: { description: 'Only visible to staff.' },
    },
    {
      name: 'consent',
      type: 'group',
      label: 'Consent given by the visitor',
      admin: { readOnly: true, description: 'Recorded when the enquiry was sent.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'contact',
              label: 'May be contacted by phone or email',
              type: 'checkbox',
              validate: requiredOnCreate('Consent to be contacted is required.'),
            },
            {
              name: 'dataNotice',
              label: 'Accepted the data storage notice',
              type: 'checkbox',
              validate: requiredOnCreate('Accepting the data notice is required.'),
            },
            { name: 'consentedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
          ],
        },
        { name: 'text', label: 'Exact wording shown', type: 'textarea' },
      ],
    },
    { name: 'source', type: 'text', defaultValue: 'contact-form', admin: { position: 'sidebar', readOnly: true } },
  ],
}
