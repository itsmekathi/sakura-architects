import type { CollectionConfig } from 'payload'
import { authenticated, isStaffUser } from '../access'
import { slugField } from '../fields/slug'
import { revalidateCollection } from '../lib/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Journal post', plural: 'Journal' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'publishedAt', 'updatedAt'],
  },
  access: {
    // Visitors only see posts whose publish date has passed.
    read: ({ req: { user } }) =>
      isStaffUser(user) ? true : { publishedAt: { less_than_equal: new Date().toISOString() } },
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultSort: '-publishedAt',
  hooks: revalidateCollection((doc) => ['/', '/journal', `/journal/${doc.slug}`]),
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'excerpt', type: 'textarea', required: true, maxLength: 280 },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText', required: true },
  ],
}
