import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/account/AuthShell'
import { LoginForm } from '@/components/account/AuthForms'
import { GoogleButton, OrDivider } from '@/components/forms'
import { getVisitor, googleEnabled, safeNext } from '@/lib/visitor-session'

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } }
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ next?: string; error?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const { next: rawNext, error } = await searchParams
  const next = safeNext(rawNext)
  if (await getVisitor()) redirect(next)

  return (
    <AuthShell
      eyebrow="Your account"
      title="Sign in"
      error={error}
      intro="Sign in to send enquiries with your details pre-filled and follow our replies in one place."
    >
      {googleEnabled() && (
        <>
          <GoogleButton next={next} />
          <OrDivider />
        </>
      )}
      <LoginForm next={next} />
      <p className="mt-10 border-t border-line pt-6 text-sm text-ink-soft">
        New here?{' '}
        <Link href={`/account/signup?next=${encodeURIComponent(next)}`} className="text-sakura-ink underline underline-offset-4">
          Create an account
        </Link>
        {next === '/contact' && (
          <>
            {' '}or{' '}
            <Link href="/contact?guest=1" className="text-sakura-ink underline underline-offset-4">
              continue without one
            </Link>
          </>
        )}
        .
      </p>
    </AuthShell>
  )
}
