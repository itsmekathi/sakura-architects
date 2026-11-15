import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/account/AuthShell'
import { ResetPasswordForm } from '@/components/account/AuthForms'

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false } }
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ token?: string }> }

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams
  return (
    <AuthShell eyebrow="Your account" title="Choose a new password">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-ink-soft">
          This link is missing its reset code.{' '}
          <Link href="/account/forgot-password" className="text-sakura-ink underline underline-offset-4">
            Request a new link
          </Link>
          .
        </p>
      )}
    </AuthShell>
  )
}
