'use client'

import { useFormStatus } from 'react-dom'
import { parseIndianPhone, PHONE_ERROR } from '@/lib/phone'

// Underlined fields. Focus is shown three ways (none of which shift layout): a soft background tint,
// a 2px rose underline drawn with an inset shadow, and the label turning rose (see Field).
export const inputCls =
  'w-full rounded-none border-0 border-b border-line bg-transparent px-3 py-3 text-base text-ink transition-[background-color,box-shadow,border-color] duration-200 placeholder:text-stone/70 hover:border-stone focus:border-transparent focus:bg-paper-2 focus:shadow-[inset_0_-2px_0_var(--sakura-ink)] focus:ring-0 focus:outline-none aria-[invalid=true]:border-sakura-ink aria-[invalid=true]:shadow-[inset_0_-2px_0_var(--sakura-ink)] disabled:opacity-60 read-only:focus:bg-transparent read-only:focus:shadow-none'

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string
  name: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="group">
      <label htmlFor={name} className="eyebrow block px-3 transition-colors group-focus-within:text-sakura-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-2 px-3 text-xs text-stone">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="mt-2 px-3 text-sm text-sakura-ink">
          {error}
        </p>
      )}
    </div>
  )
}

/** aria props for an input given a field-error map. */
export const ariaFor = (errors: Partial<Record<string, string>> | undefined, name: string) => ({
  'aria-invalid': errors?.[name] ? true : undefined,
  'aria-describedby': errors?.[name] ? `${name}-error` : undefined,
})

/**
 * Indian phone input. Validates as you type (native validity, so `form.reportValidity()` and the
 * browser bubble work) and tidies a valid number to "+91 98765 43210" when the field loses focus.
 */
export function PhoneInput({
  required = false,
  defaultValue,
  errors,
  className = '',
}: {
  required?: boolean
  defaultValue?: string | null
  errors?: Partial<Record<string, string>>
  className?: string
}) {
  const check = (el: HTMLInputElement) => {
    const v = el.value.trim()
    el.setCustomValidity(!v || parseIndianPhone(v) ? '' : PHONE_ERROR)
  }
  return (
    <input
      id="phone"
      name="phone"
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="98765 43210"
      required={required}
      defaultValue={defaultValue ?? ''}
      onChange={(e) => check(e.currentTarget)}
      onBlur={(e) => {
        const parsed = parseIndianPhone(e.currentTarget.value)
        if (parsed) e.currentTarget.value = parsed.display
        check(e.currentTarget)
      }}
      className={`${inputCls} ${className}`}
      {...ariaFor(errors, 'phone')}
    />
  )
}

export const buttonCls =
  'inline-flex items-center justify-center bg-ink px-8 py-4 text-sm tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40'

export const ghostButtonCls =
  'inline-flex items-center justify-center border border-line px-6 py-3.5 text-sm tracking-[0.14em] uppercase transition-colors hover:border-ink disabled:opacity-40'

export function SubmitButton({ children, pendingText, className = '' }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${buttonCls} ${className}`}>
      {pending ? (pendingText ?? 'Please wait…') : children}
    </button>
  )
}

export function FormMessage({ state }: { state: { status: string; message?: string } }) {
  if (!state.message) return null
  return (
    <p role={state.status === 'error' ? 'alert' : 'status'} className={`text-sm ${state.status === 'error' ? 'text-sakura-ink' : 'text-ink-soft'}`}>
      {state.message}
    </p>
  )
}

/** "Continue with Google" button (a plain link to the OAuth start route). */
export function GoogleButton({ next, label = 'Continue with Google' }: { next: string; label?: string }) {
  return (
    <a
      href={`/auth/google?next=${encodeURIComponent(next)}`}
      className="flex w-full items-center justify-center gap-3 border border-line bg-paper px-6 py-3.5 text-[0.95rem] transition-colors hover:border-ink"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      {label}
    </a>
  )
}

export function OrDivider() {
  return (
    <div className="my-8 flex items-center gap-4 text-xs tracking-[0.2em] text-stone uppercase">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
