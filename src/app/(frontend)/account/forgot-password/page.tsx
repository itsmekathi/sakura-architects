import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/account/AuthShell'
import { ForgotPasswordForm } from '@/components/account/AuthForms'

export const metadata: Metadata = { title: 'Forgot password', robots: { index: false } }

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Your account"
      title="Forgot your password?"
      intro="Enter your account email and we’ll send you a link to choose a new password. Signed up with Google? This also lets you add a password."
    >
      <ForgotPasswordForm />
      <p className="mt-10 border-t border-line pt-6 text-sm">
        <Link href="/account/login" className="link-underline">
          ← Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
