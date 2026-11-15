'use client'

import { useActionState } from 'react'
import { submitInquiry, type ContactState } from '@/app/(frontend)/contact/actions'
import { BUDGETS, PROJECT_TYPES } from '@/lib/constants'

const initial: ContactState = { status: 'idle' }

const inputCls =
  'w-full border-0 border-b border-line bg-transparent px-0 py-3 text-base text-ink placeholder:text-stone/70 focus:border-ink focus:ring-0 focus:outline-none aria-[invalid=true]:border-sakura-ink'

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string
  name: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow block">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm text-sakura-ink">
          {error}
        </p>
      )}
    </div>
  )
}

export function ContactForm() {
  const [state, action, pending] = useActionState(submitInquiry, initial)
  const e = state.errors ?? {}
  const aria = (name: string) => ({
    'aria-invalid': e[name] ? true : undefined,
    'aria-describedby': e[name] ? `${name}-error` : undefined,
  })

  if (state.status === 'success') {
    return (
      <div role="status" className="border-t border-sakura pt-8">
        <p className="font-serif text-3xl">Message received.</p>
        <p className="mt-3 text-ink-soft">{state.message ?? 'Thank you, we will be in touch soon.'}</p>
      </div>
    )
  }

  return (
    <form action={action} noValidate className="grid gap-8 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Name" name="name" error={e.name}>
          <input id="name" name="name" autoComplete="name" required className={inputCls} {...aria('name')} />
        </Field>
      </div>
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} {...aria('email')} />
      </Field>
      <Field label="Phone (optional)" name="phone" error={e.phone}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputCls} {...aria('phone')} />
      </Field>
      <Field label="Project type" name="projectType" error={e.projectType}>
        <select id="projectType" name="projectType" defaultValue="" className={inputCls}>
          <option value="">Select…</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Budget" name="budget" error={e.budget}>
        <select id="budget" name="budget" defaultValue="" className={inputCls}>
          <option value="">Select…</option>
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Tell us about your project" name="message" error={e.message}>
          <textarea id="message" name="message" rows={5} required className={`${inputCls} resize-y`} {...aria('message')} />
        </Field>
      </div>

      {/* Honeypot for bots: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-8 py-4 text-sm tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send enquiry'}
        </button>
        {state.status === 'error' && state.message && (
          <p role="alert" className="text-sm text-sakura-ink">
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
