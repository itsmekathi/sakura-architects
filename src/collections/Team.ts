import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateCollection } from '../lib/revalidate'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: { useAsTitle: 'name', group: 'Content', defaultColumns: ['name', 'role', 'order'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  hooks: revalidateCollection(() => ['/studio']),
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers show first.' },
    },
  ],
}
