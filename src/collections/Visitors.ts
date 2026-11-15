import type { CollectionConfig } from 'payload'
import { isStaff, isStaffOrSelfVisitor, isStaffField } from '../access'
import { passwordResetEmailHTML } from '../lib/email'

/**
 * Public site accounts (separate from staff `users`). Visitors can sign in with email + password
 * or Google, and see their own enquiries at /account. They can never use the admin panel.
 *
 * useSessions is off on purpose: Google sign-in mints the JWT itself (jwtSign), and Payload's
 * session list is only written by its own login operation. See src/lib/visitor-session.ts.
 */
export const Visitors: CollectionConfig = {
  slug: 'visitors',
  labels: { singular: 'Site visitor', plural: 'Site visitors' },
  admin: {
    useAsTitle: 'email',
    group: 'Inbox',
    defaultColumns: ['email', 'name', 'provider', 'createdAt'],
    description: 'People who created an account on the website to send and track enquiries.',
  },
  auth: {
    useSessions: false,
    tokenExpiration: 60 * 60 * 24 * 14, // 14 days
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
    forgotPassword: {
      expiration: 60 * 60 * 1000, // 1 hour
      generateEmailSubject: () => 'Reset your Sakura Architects password',
      generateEmailHTML: (args) => passwordResetEmailHTML({ token: args?.token ?? '' }),
    },
  },
  access: {
    admin: () => false,
    read: isStaffOrSelfVisitor,
    update: isStaffOrSelfVisitor,
    // Sign-up goes through a server action (Local API) with validation and rate limiting.
    create: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'phone', type: 'text' },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'password',
      options: [
        { label: 'Email & password', value: 'password' },
        { label: 'Google', value: 'google' },
      ],
      access: { update: isStaffField },
      admin: { position: 'sidebar', readOnly: true, description: 'How the account was first created.' },
    },
    {
      name: 'googleSub',
      type: 'text',
      unique: true,
      index: true,
      access: { read: isStaffField, update: () => false, create: () => false },
      admin: { hidden: true },
    },
  ],
}
