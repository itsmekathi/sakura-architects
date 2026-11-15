import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateCollection } from '../lib/revalidate'

/** Short client feedback quotes, shown on the Success stories page and on linked project pages. */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'role', 'rating', 'project', 'order'],
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  hooks: revalidateCollection(() => ['/stories', '/projects/[slug]']),
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', admin: { description: 'e.g. "Homeowner" or "Director, Kura Holdings"' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'rating', type: 'number', min: 1, max: 5, admin: { description: 'Optional, 1–5.' } },
        { name: 'project', type: 'relationship', relationTo: 'projects' },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers show first.' },
    },
  ],
}
