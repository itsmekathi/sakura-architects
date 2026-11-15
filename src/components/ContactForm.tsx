'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { submitInquiry, type ContactState } from '@/app/(frontend)/contact/actions'
import { BUDGETS, PROJECT_TYPES } from '@/lib/constants'
import type { ConsentTexts } from '@/lib/consent'
import { ariaFor, buttonCls, Field, ghostButtonCls, GoogleButton, inputCls, OrDivider } from './forms'

type VisitorInfo = { name?: string | null; email: string; phone?: string | null } | null

const initial: ContactState = { status: 'idle' }
const CONTACT_LABEL = { email: 'Email', phone: 'Phone', either: 'Phone or email' } as const

/** Renders "Label: rest" paragraphs from the data notice, bolding the label. */
function Notice({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-ink-soft">
      {text.split(/\n{2,}/).map((p, i) => {
        const m = p.match(/^([^:\n]{2,40}):\s*([\s\S]*)$/)
        return (
          <p key={i}>
            {m ? (
              <>
                <strong className="font-medium text-ink">{m[1]}:</strong> {m[2]}
              </>
            ) : (
              p
            )}
          </p>
        )
      })}
    </div>
  )
}

export function ContactForm({
  visitor,
  googleEnabled,
  consent,
  startAsGuest = false,
}: {
  visitor: VisitorInfo
  googleEnabled: boolean
  consent: ConsentTexts
  startAsGuest?: boolean
}) {
  const [state, action, pending] = useActionState(submitInquiry, initial)
  const [mode, setMode] = useState<'choose' | 'form'>(visitor || startAsGuest ? 'form' : 'choose')
  const [preferred, setPreferred] = useState<'email' | 'phone' | 'either'>('either')
  const [agreeContact, setAgreeContact] = useState(false)
  const [agreeData, setAgreeData] = useState(false)
  const [summary, setSummary] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const e = state.errors ?? {}

  // If the server rejects the submission, close the dialog so field errors are visible.
  // Runs only when a new server response arrives (`state` changes identity per submission).
  useEffect(() => {
    if (state.status === 'error' && dialogRef.current?.open) {
      const onlyConsent = Object.keys(state.errors ?? {}).every((k) => k.startsWith('consent'))
      if (!onlyConsent) dialogRef.current.close()
    }
  }, [state])

  const review = () => {
    const form = formRef.current!
    if (!form.reportValidity()) return
    const fd = new FormData(form)
    setSummary({
      Name: String(fd.get('name') || visitor?.name || 'Not given'),
      Email: visitor?.email ?? String(fd.get('email')),
      Phone: String(fd.get('phone') || 'Not given'),
      'Contact me by': CONTACT_LABEL[preferred],
    })
    setAgreeContact(false)
    setAgreeData(false)
    dialogRef.current?.showModal()
  }

  if (state.status === 'success') {
    return (
      <div role="status" className="border-t border-sakura pt-8">
        <p className="font-serif text-3xl">Message received.</p>
        <p className="mt-3 text-ink-soft">{state.message}</p>
        {visitor && (
          <Link href="/account" className="link-underline mt-6 inline-block text-sm tracking-[0.12em] uppercase">
            Go to My account →
          </Link>
        )}
      </div>
    )
  }

  if (mode === 'choose') {
    return (
      <div className="max-w-xl">
        <h2 className="text-2xl">How would you like to continue?</h2>
        <p className="mt-3 text-ink-soft">
          With an account your details are filled in for you and you can follow our replies online. You can also send an
          enquiry without one.
        </p>
        <div className="mt-8 space-y-3">
          {googleEnabled && <GoogleButton next="/contact" />}
          <Link href="/account/login?next=/contact" className={`${ghostButtonCls} w-full`}>
            Sign in with email
          </Link>
          <p className="pt-1 text-center text-sm text-stone">
            New here?{' '}
            <Link href="/account/signup?next=/contact" className="link-underline text-ink">
              Create an account
            </Link>
          </p>
        </div>
        <OrDivider />
        <button type="button" onClick={() => setMode('form')} className={`${buttonCls} w-full`}>
          Continue without an account
        </button>
        <p className="mt-3 text-center text-xs text-stone">We’ll only use your details to reply to this enquiry.</p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={action} noValidate={false} className="grid gap-8 sm:grid-cols-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5 text-sm text-ink-soft sm:col-span-2">
        {visitor ? (
          <span>
            Signed in as <strong className="font-medium text-ink">{visitor.email}</strong> ·{' '}
            <Link href="/account" className="link-underline">My account</Link>
          </span>
        ) : (
          <span>
            Sending without an account ·{' '}
            <button type="button" onClick={() => setMode('choose')} className="link-underline">
              sign in instead
            </button>
          </span>
        )}
      </div>

      <div className="sm:col-span-2">
        <Field label={visitor ? 'Name' : 'Name (optional)'} name="name" error={e.name}>
          <input id="name" name="name" autoComplete="name" defaultValue={visitor?.name ?? ''} className={inputCls} {...ariaFor(e, 'name')} />
        </Field>
      </div>
      <Field label="Email" name="email" error={e.email} hint={visitor ? 'From your account.' : undefined}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={visitor?.email ?? ''}
          readOnly={Boolean(visitor)}
          className={`${inputCls} read-only:text-ink-soft`}
          {...ariaFor(e, 'email')}
        />
      </Field>
      <Field label={preferred === 'email' ? 'Phone (optional)' : 'Phone'} name="phone" error={e.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required={preferred !== 'email'}
          defaultValue={visitor?.phone ?? ''}
          className={inputCls}
          {...ariaFor(e, 'phone')}
        />
      </Field>

      <fieldset className="sm:col-span-2">
        <legend className="eyebrow mb-3">How should we contact you?</legend>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {(['email', 'phone', 'either'] as const).map((v) => (
            <label key={v} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="preferredContact"
                value={v}
                checked={preferred === v}
                onChange={() => setPreferred(v)}
                className="h-4 w-4 accent-[var(--ink)]"
              />
              {CONTACT_LABEL[v]}
            </label>
          ))}
        </div>
      </fieldset>

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
          <textarea id="message" name="message" rows={5} required minLength={10} className={`${inputCls} resize-y`} {...ariaFor(e, 'message')} />
        </Field>
      </div>

      {/* Honeypot for bots: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <button type="button" onClick={review} className={buttonCls}>
          Review &amp; send
        </button>
        {state.status === 'error' && state.message && !dialogRef.current?.open && (
          <p role="alert" className="text-sm text-sakura-ink">{state.message}</p>
        )}
      </div>

      {/* Consent step. It sits inside the form, so its checkboxes and submit button belong to it. */}
      <dialog
        ref={dialogRef}
        aria-labelledby="consent-title"
        className="m-auto w-[min(42rem,calc(100vw-2rem))] max-h-[88dvh] overflow-y-auto bg-paper p-0 text-ink backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-10">
          <p className="eyebrow">Before you send</p>
          <h2 id="consent-title" className="mt-3 text-3xl">Please review and confirm</h2>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-line py-5 text-sm">
            {Object.entries(summary).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-stone">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
          </dl>

          <label className="mt-6 flex cursor-pointer gap-3">
            <input
              type="checkbox"
              name="consentContact"
              checked={agreeContact}
              onChange={(ev) => setAgreeContact(ev.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--ink)]"
            />
            <span>{consent.contact}</span>
          </label>

          <div className="mt-6 border-l-2 border-sakura pl-4">
            <p className="eyebrow mb-3">How we store your data</p>
            <Notice text={consent.dataNotice} />
          </div>

          <label className="mt-6 flex cursor-pointer gap-3">
            <input
              type="checkbox"
              name="consentData"
              checked={agreeData}
              onChange={(ev) => setAgreeData(ev.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--ink)]"
            />
            <span>I have read how my data will be stored and used, and I agree.</span>
          </label>

          {state.status === 'error' && (e.consentContact || e.consentData) && (
            <p role="alert" className="mt-4 text-sm text-sakura-ink">{e.consentContact || e.consentData}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={!agreeContact || !agreeData || pending} className={buttonCls}>
              {pending ? 'Sending…' : 'Agree & send'}
            </button>
            <button type="button" onClick={() => dialogRef.current?.close()} className={ghostButtonCls}>
              Go back
            </button>
          </div>
          <p className="mt-4 text-xs text-stone">
            Full details on our <Link href="/privacy" className="link-underline" target="_blank">privacy page</Link>.
          </p>
        </div>
      </dialog>
    </form>
  )
}
