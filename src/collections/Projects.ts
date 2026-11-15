import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'
import { revalidateCollection } from '../lib/revalidate'
import { PROJECT_CATEGORIES } from '../lib/constants'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', 'year', 'featured', 'updatedAt'],
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: '-year',
  hooks: revalidateCollection((doc) => ['/', '/projects', `/projects/${doc.slug}`]),
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'featured',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'Show on the home page.' },
    },
    { name: 'summary', type: 'textarea', required: true, maxLength: 240 },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'select', required: true, options: PROJECT_CATEGORIES },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'completed',
          options: [
            { label: 'Completed', value: 'completed' },
            { label: 'In construction', value: 'construction' },
            { label: 'In design', value: 'design' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'text' },
        { name: 'year', type: 'number', min: 1900, max: 2100 },
        { name: 'area', type: 'text', admin: { description: 'e.g. 1,250 m²' } },
        { name: 'client', type: 'text' },
      ],
    },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'body', type: 'richText' },
  ],
}
