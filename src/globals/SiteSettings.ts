import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateEverything } from '../lib/revalidate'
import {
  DEFAULT_CONTACT_CONSENT_TEXT,
  DEFAULT_DATA_NOTICE_TEXT,
  DEFAULT_RETENTION_MONTHS,
} from '../lib/consent'

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
        {
          label: 'Enquiry consent',
          description:
            'Shown to visitors before they send an enquiry. The exact wording they agreed to is saved on each enquiry. The data notice also appears on the Privacy page.',
          fields: [
            {
              name: 'contactConsentText',
              type: 'textarea',
              defaultValue: DEFAULT_CONTACT_CONSENT_TEXT,
              admin: { description: 'Checkbox 1: permission to be contacted.' },
            },
            {
              name: 'dataNoticeText',
              type: 'textarea',
              defaultValue: DEFAULT_DATA_NOTICE_TEXT,
              admin: {
                rows: 14,
                description:
                  'Checkbox 2: how enquiry data is stored. Blank lines separate paragraphs; {months} is replaced with the retention period below.',
              },
            },
            {
              name: 'retentionMonths',
              type: 'number',
              min: 1,
              defaultValue: DEFAULT_RETENTION_MONTHS,
              admin: { description: 'How long enquiries are kept after the last contact.' },
            },
          ],
        },
      ],
    },
  ],
}
