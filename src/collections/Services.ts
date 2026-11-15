import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateCollection } from '../lib/revalidate'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'order'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  hooks: revalidateCollection(() => ['/', '/services']),
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'textarea', required: true },
    {
      name: 'deliverables',
      type: 'array',
      labels: { singular: 'Item', plural: 'Deliverables' },
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
