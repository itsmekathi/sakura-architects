import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'
import { slugField } from '../fields/slug'
import { revalidateCollection } from '../lib/revalidate'

/** Success stories: client case studies told around a project, with measurable outcomes. */
export const Stories: CollectionConfig = {
  slug: 'stories',
  labels: { singular: 'Success story', plural: 'Success stories' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'client', 'project', 'publishedAt'],
  },
  access: {
    read: ({ req: { user } }) =>
      user ? true : { publishedAt: { less_than_equal: new Date().toISOString() } },
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultSort: '-publishedAt',
  hooks: revalidateCollection((doc) => ['/stories', `/stories/${doc.slug}`, '/projects/[slug]']),
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'e.g. "A home that grew with the family"' } },
    slugField(),
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'Show first on the Success stories page.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'client', type: 'text', required: true, admin: { description: 'e.g. "The Ito family" or "Kura Holdings"' } },
        {
          name: 'project',
          type: 'relationship',
          relationTo: 'projects',
          admin: { description: 'The project this story is about (links both pages together).' },
        },
      ],
    },
    { name: 'excerpt', type: 'textarea', required: true, maxLength: 280 },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. Falls back to the linked project’s cover image.' },
    },
    {
      name: 'outcomes',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Outcome', plural: 'Outcomes' },
      admin: { description: 'Headline results, e.g. "40%" / "lower energy use".' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'quote',
      label: 'Client quote',
      fields: [
        { name: 'text', type: 'textarea' },
        { name: 'author', type: 'text', admin: { description: 'e.g. "Yuki Ito, homeowner"' } },
      ],
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      admin: { description: 'Tip: use headings like The challenge / Our approach / The result.' },
    },
  ],
}
