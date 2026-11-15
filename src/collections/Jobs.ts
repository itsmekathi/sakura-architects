import type { CollectionConfig } from 'payload'
import { authenticated, isStaffUser } from '../access'
import { revalidateCollection } from '../lib/revalidate'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Job opening', plural: 'Careers' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'location', 'type', 'open'],
  },
  access: {
    read: ({ req: { user } }) => (isStaffUser(user) ? true : { open: { equals: true } }),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: revalidateCollection(() => ['/careers']),
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'open', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'text' },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'full-time',
          options: [
            { label: 'Full-time', value: 'full-time' },
            { label: 'Part-time', value: 'part-time' },
            { label: 'Contract', value: 'contract' },
            { label: 'Internship', value: 'internship' },
          ],
        },
      ],
    },
    { name: 'description', type: 'textarea', required: true },
  ],
}
