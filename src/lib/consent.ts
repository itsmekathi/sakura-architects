// Default wording for the enquiry consent step. Staff can override both texts in
// Admin → Site settings → Enquiry consent. The exact text a visitor agreed to is saved on the enquiry.
// Placeholder copy: have it reviewed for your jurisdiction before launch.

export const DEFAULT_RETENTION_MONTHS = 24

export const DEFAULT_CONTACT_CONSENT_TEXT =
  'I agree that representatives of Sakura Architects may contact me by phone or email about this enquiry.'

export const DEFAULT_DATA_NOTICE_TEXT = `What we collect: the details you enter in this form (name, email, phone, project details and message) and, if you are signed in, a link to your account.

Why: only to respond to your enquiry and discuss your project. We do not use it for marketing unless you ask us to, and we never sell or share it with third parties.

Who can see it: Sakura Architects staff who handle enquiries. It is stored securely with our hosting providers.

How long: we keep enquiries for {months} months after our last contact, then delete them, unless they become a project, in which case they are kept with the project records.

Your rights: you can ask to see, correct or delete your information at any time by emailing the studio. If you have an account, you can delete it and your enquiries yourself from the My account page.`

export const renderDataNotice = (text: string | null | undefined, months: number | null | undefined) =>
  (text || DEFAULT_DATA_NOTICE_TEXT).replaceAll('{months}', String(months || DEFAULT_RETENTION_MONTHS))

export type ConsentTexts = { contact: string; dataNotice: string }

export function consentTextsFromSettings(settings: {
  contactConsentText?: string | null
  dataNoticeText?: string | null
  retentionMonths?: number | null
}): ConsentTexts {
  return {
    contact: settings.contactConsentText || DEFAULT_CONTACT_CONSENT_TEXT,
    dataNotice: renderDataNotice(settings.dataNoticeText, settings.retentionMonths),
  }
}
