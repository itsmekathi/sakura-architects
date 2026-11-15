'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import {
  deleteAccount,
  forgotPassword,
  login,
  resetPassword,
  signup,
  updateProfile,
  type FormState,
} from '@/app/(frontend)/account/actions'
import { ariaFor, Field, FormMessage, inputCls, PhoneInput, SubmitButton } from '@/components/forms'
import { PHONE_HINT } from '@/lib/phone'

const idle: FormState = { status: 'idle' }

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, idle)
  const e = state.errors
  return (
    <form action={action} noValidate className="space-y-7">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" error={e?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} {...ariaFor(e, 'email')} />
      </Field>
      <Field label="Password" name="password" error={e?.password}>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} {...ariaFor(e, 'password')} />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
        <Link href={`/account/forgot-password`} className="link-underline text-sm text-stone">
          Forgot password?
        </Link>
      </div>
      <FormMessage state={state} />
    </form>
  )
}

export function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(signup, idle)
  const e = state.errors
  return (
    <form action={action} noValidate className="grid gap-7 sm:grid-cols-2">
      <input type="hidden" name="next" value={next} />
      <div className="sm:col-span-2">
        <Field label="Name" name="name" error={e?.name}>
          <input id="name" name="name" autoComplete="name" required className={inputCls} {...ariaFor(e, 'name')} />
        </Field>
      </div>
      <Field label="Email" name="email" error={e?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} {...ariaFor(e, 'email')} />
      </Field>
      <Field label="Phone (optional)" name="phone" error={e?.phone} hint={PHONE_HINT}>
        <PhoneInput errors={e} />
      </Field>
      <Field label="Password" name="password" error={e?.password} hint="At least 8 characters.">
        <input id="password" name="password" type="password" autoComplete="new-password" required className={inputCls} {...ariaFor(e, 'password')} />
      </Field>
      <Field label="Confirm password" name="confirm" error={e?.confirm}>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputCls} {...ariaFor(e, 'confirm')} />
      </Field>
      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  )
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPassword, idle)
  if (state.status === 'success') return <p role="status" className="text-ink-soft">{state.message}</p>
  return (
    <form action={action} noValidate className="space-y-7">
      <Field label="Email" name="email" error={state.errors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} {...ariaFor(state.errors, 'email')} />
      </Field>
      <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
      <FormMessage state={state} />
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, idle)
  const e = state.errors
  return (
    <form action={action} noValidate className="space-y-7">
      <input type="hidden" name="token" value={token} />
      <Field label="New password" name="password" error={e?.password} hint="At least 8 characters.">
        <input id="password" name="password" type="password" autoComplete="new-password" required className={inputCls} {...ariaFor(e, 'password')} />
      </Field>
      <Field label="Confirm new password" name="confirm" error={e?.confirm}>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputCls} {...ariaFor(e, 'confirm')} />
      </Field>
      <SubmitButton pendingText="Saving…">Set new password</SubmitButton>
      <FormMessage state={state} />
    </form>
  )
}

export function ProfileForm({ name, phone }: { name?: string | null; phone?: string | null }) {
  const [state, action] = useActionState(updateProfile, idle)
  const e = state.errors
  return (
    <form action={action} noValidate className="space-y-7">
      <Field label="Name" name="name" error={e?.name}>
        <input id="name" name="name" defaultValue={name ?? ''} autoComplete="name" className={inputCls} {...ariaFor(e, 'name')} />
      </Field>
      <Field label="Phone" name="phone" error={e?.phone} hint={PHONE_HINT}>
        <PhoneInput defaultValue={phone} errors={e} />
      </Field>
      <div className="flex items-center gap-6">
        <SubmitButton pendingText="Saving…">Save</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  )
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccount, idle)
  return (
    <form action={action} noValidate className="space-y-5">
      <p className="text-sm text-ink-soft">
        This permanently deletes your account and every enquiry you sent while signed in. It can’t be undone.
      </p>
      <Field label="Type DELETE to confirm" name="confirm" error={state.errors?.confirm}>
        <input id="confirm" name="confirm" autoComplete="off" className={inputCls} {...ariaFor(state.errors, 'confirm')} />
      </Field>
      <SubmitButton pendingText="Deleting…" className="!bg-sakura-ink">
        Delete my account
      </SubmitButton>
    </form>
  )
}
