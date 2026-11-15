import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateEverything } from '../lib/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Admin' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Home',
          fields: [
            { name: 'heroEyebrow', type: 'text', defaultValue: 'Architecture · Civil · Interiors' },
            { name: 'heroTitle', type: 'textarea', defaultValue: 'Quiet buildings,\nmade to last.' },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'intro', type: 'textarea' },
          ],
        },
        {
          label: 'Studio',
          fields: [
            { name: 'philosophy', type: 'richText' },
            {
              name: 'timeline',
              type: 'array',
              fields: [
                { name: 'year', type: 'text', required: true },
                { name: 'text', type: 'text', required: true },
              ],
            },
            {
              name: 'awards',
              type: 'array',
              fields: [
                { name: 'year', type: 'text', required: true },
                { name: 'title', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'email', type: 'email', admin: { description: 'Public email. New enquiries are also sent here.' } },
            { name: 'phone', type: 'text' },
            { name: 'address', type: 'textarea' },
            { name: 'hours', type: 'text', defaultValue: 'Mon – Fri, 9:00 – 18:00' },
            {
              name: 'socials',
              type: 'array',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: ['Instagram', 'LinkedIn', 'Pinterest', 'Behance', 'X', 'Facebook'].map((p) => ({
                    label: p,
                    value: p.toLowerCase(),
                  })),
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
