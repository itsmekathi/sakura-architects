import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/account/AuthShell'
import { SignupForm } from '@/components/account/AuthForms'
import { GoogleButton, OrDivider } from '@/components/forms'
import { getVisitor, googleEnabled, safeNext } from '@/lib/visitor-session'

export const metadata: Metadata = { title: 'Create an account', robots: { index: false } }
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ next?: string; error?: string }> }

export default async function SignupPage({ searchParams }: Props) {
  const { next: rawNext, error } = await searchParams
  const next = safeNext(rawNext)
  if (await getVisitor()) redirect(next)

  return (
    <AuthShell
      eyebrow="Your account"
      title="Create an account"
      error={error}
      intro={
        <>
          An account lets you track your enquiries and read our replies. It’s optional: you can always{' '}
          <Link href="/contact?guest=1" className="text-sakura-ink underline underline-offset-4">
            send an enquiry without one
          </Link>
          .
        </>
      }
    >
      {googleEnabled() && (
        <>
          <GoogleButton next={next} label="Sign up with Google" />
          <OrDivider />
        </>
      )}
      <SignupForm next={next} />
      <p className="mt-10 border-t border-line pt-6 text-sm text-ink-soft">
        Already have an account?{' '}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="text-sakura-ink underline underline-offset-4">
          Sign in
        </Link>
        . By creating an account you agree to how we store your data, described on our{' '}
        <Link href="/privacy" className="text-sakura-ink underline underline-offset-4">
          privacy page
        </Link>
        .
      </p>
    </AuthShell>
  )
}
