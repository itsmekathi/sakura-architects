// Indian phone numbers only. Shared by the browser (live validation) and the server (enforcement).
//
// Accepts common ways of writing a number: "98765 43210", "+91 98765 43210", "+91-98765-43210",
// "(+91) 98765-43210", "09876543210", "919876543210", and landlines with their STD code such as
// "011 2345 6789" or "080-2345-6789". What remains after removing the +91 / 0 prefix must be the
// 10-digit national number, which never starts with 0. Mobile vs landline can't be told apart
// reliably from the digits (e.g. Bangalore landlines start with 80), so both are simply accepted.

export const PHONE_HINT = '10-digit Indian mobile, or landline with STD code, e.g. 98765 43210'
export const PHONE_ERROR = 'Enter a valid Indian phone number, e.g. 98765 43210 or +91 98765 43210.'

export type IndianPhone = { national: string; e164: string; display: string }

export function parseIndianPhone(raw: unknown): IndianPhone | null {
  if (typeof raw !== 'string') return null
  // Brackets are just decoration, e.g. "(+91) 98765-43210" or "(011) 2345 6789".
  const trimmed = raw.replace(/[()]/g, '').trim()
  // Only digits, spaces, dashes, dots and a single leading + are allowed.
  if (!/^\+?[\d\s\-.]+$/.test(trimmed)) return null
  let digits = trimmed.replace(/\D/g, '')

  if (trimmed.startsWith('+')) {
    if (!digits.startsWith('91')) return null // another country code
    digits = digits.slice(2)
  } else if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2)
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  if (!/^[1-9]\d{9}$/.test(digits)) return null
  return { national: digits, e164: `+91${digits}`, display: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` }
}

export const isIndianPhone = (raw: unknown) => parseIndianPhone(raw) !== null

/** Payload field validator: empty is allowed (use `required` for that); otherwise must be Indian. */
export const validateIndianPhoneField = (value: unknown) =>
  value === null || value === undefined || value === '' || isIndianPhone(value) ? true : PHONE_ERROR
