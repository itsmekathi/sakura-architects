import type { SendEmailOptions } from 'payload'
import { SITE_URL } from './site-url'

const STUDIO_NAME = 'Sakura Architects'

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const paragraphs = (s: string) =>
  escape(s)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

const layout = (body: string) => `
<div style="background:#F7F3EE;padding:32px 16px;font-family:Georgia,serif;color:#1F1D1B">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border-top:2px solid #E8B4B8">
    ${body}
    <p style="margin:32px 0 0;font-size:13px;color:#8A847C">${STUDIO_NAME}</p>
  </div>
</div>`

export function replyEmail(args: {
  to: string
  name: string
  reply: string
  original?: string
  /** The enquiry belongs to a site account: link to the conversation in /account. */
  hasAccount?: boolean
}): SendEmailOptions {
  const quote = args.original
    ? `<blockquote style="margin:24px 0 0;padding-left:12px;border-left:2px solid #E8B4B8;color:#8A847C;font-size:14px">${paragraphs(args.original)}</blockquote>`
    : ''
  const accountUrl = `${SITE_URL}/account`
  const accountLink = args.hasAccount
    ? `<p style="margin:24px 0 0;font-size:14px"><a href="${accountUrl}" style="color:#1F1D1B">View this conversation in your account →</a></p>`
    : ''
  return {
    to: args.to,
    subject: `Re: your enquiry to ${STUDIO_NAME}`,
    text: `${args.reply}\n\n— ${STUDIO_NAME}${args.hasAccount ? `\n\nView this conversation in your account: ${accountUrl}` : ''}${args.original ? `\n\n> ${args.original.replace(/\n/g, '\n> ')}` : ''}`,
    html: layout(
      `<p style="margin:0 0 16px">Dear ${escape(args.name)},</p>${paragraphs(args.reply)}${accountLink}${quote}`,
    ),
  }
}

export function passwordResetEmailHTML({ token }: { token: string }) {
  const url = `${SITE_URL}/account/reset-password?token=${encodeURIComponent(token)}`
  return layout(
    `<p style="margin:0 0 16px">Someone (hopefully you) asked to reset the password for your ${STUDIO_NAME} account.</p>` +
      `<p style="margin:0 0 16px"><a href="${url}" style="color:#1F1D1B">Choose a new password →</a></p>` +
      `<p style="margin:0;font-size:13px;color:#8A847C">The link is valid for one hour. If you didn't ask for this, you can ignore this email.</p>`,
  )
}

export function newInquiryEmail(args: {
  to: string
  inquiry: { id: number | string; name: string; email: string; phone?: string | null; message: string }
}): SendEmailOptions {
  const { inquiry } = args
  const adminUrl = `${SITE_URL}/admin/collections/inquiries/${inquiry.id}`
  return {
    to: args.to,
    replyTo: inquiry.email,
    subject: `New website enquiry from ${inquiry.name}`,
    text: `${inquiry.name} <${inquiry.email}> ${inquiry.phone ?? ''}\n\n${inquiry.message}\n\nReply from the admin: ${adminUrl}`,
    html: layout(
      `<p style="margin:0 0 8px"><strong>${escape(inquiry.name)}</strong> &lt;${escape(inquiry.email)}&gt; ${escape(inquiry.phone ?? '')}</p>${paragraphs(inquiry.message)}<p><a href="${adminUrl}" style="color:#1F1D1B">Open in admin →</a></p>`,
    ),
  }
}
