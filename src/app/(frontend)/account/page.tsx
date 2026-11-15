import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import { DeleteAccountForm, ProfileForm } from '@/components/account/AuthForms'
import { buttonCls, ghostButtonCls } from '@/components/forms'
import { PROJECT_TYPES } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getVisitor } from '@/lib/visitor-session'

export const metadata: Metadata = { title: 'My account', robots: { index: false } }
export const dynamic = 'force-dynamic'

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: 'Received', cls: 'border-line text-stone' },
  'in-progress': { label: 'In progress', cls: 'border-sakura text-sakura-ink' },
  replied: { label: 'Replied', cls: 'border-ink text-ink' },
  closed: { label: 'Closed', cls: 'border-line text-stone' },
}

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

export default async function AccountPage() {
  const visitor = await getVisitor()
  if (!visitor) redirect('/account/login?next=/account')

  const payload = await getPayloadClient()
  // Access control applies: a visitor can only ever read their own enquiries.
  const { docs: enquiries } = await payload.find({
    collection: 'inquiries',
    where: { visitor: { equals: visitor.id } },
    sort: '-createdAt',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    user: visitor,
  })

  return (
    <>
      <header className="wrap flex flex-wrap items-end justify-between gap-6 pt-16 pb-12 md:pt-24">
        <div>
          <p className="eyebrow mb-5">My account</p>
          <h1 className="text-4xl leading-[1.1] md:text-5xl">Hello{visitor.name ? `, ${visitor.name.split(' ')[0]}` : ''}.</h1>
          <p className="mt-4 text-ink-soft">
            Signed in as {visitor.email}
            {visitor.provider === 'google' ? ' with Google' : ''}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className={buttonCls}>
            New enquiry
          </Link>
          <form action={logout}>
            <input type="hidden" name="next" value="/" />
            <button type="submit" className={ghostButtonCls}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section aria-labelledby="enquiries-heading" className="wrap">
        <h2 id="enquiries-heading" className="mb-8 border-b border-line pb-5 text-2xl">
          My enquiries
        </h2>
        {enquiries.length === 0 ? (
          <p className="text-ink-soft">
            You haven’t sent an enquiry yet.{' '}
            <Link href="/contact" className="text-sakura-ink underline underline-offset-4">
              Tell us about your project
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-6">
            {enquiries.map((q) => {
              const status = STATUS[q.status] ?? STATUS.new
              return (
                <li key={q.id} className="border border-line p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="eyebrow">
                      {fmt(q.createdAt)}
                      {q.projectType ? ` · ${PROJECT_TYPES.find((t) => t.value === q.projectType)?.label ?? q.projectType}` : ''}
                    </p>
                    <span className={`border px-3 py-1 text-xs tracking-[0.14em] uppercase ${status.cls}`}>{status.label}</span>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-ink-soft">{q.message}</p>

                  {q.replies && q.replies.length > 0 && (
                    <ol className="mt-6 space-y-4 border-t border-line pt-6">
                      {q.replies.map((r, i) => (
                        <li key={r.id ?? i} className="border-l-2 border-sakura pl-4">
                          <p className="eyebrow">Sakura Architects · {fmt(r.sentAt)}</p>
                          <p className="mt-2 whitespace-pre-line">{r.message}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                  {(!q.replies || q.replies.length === 0) && (
                    <p className="mt-6 text-sm text-stone">
                      We’ll reply by {q.preferredContact === 'phone' ? 'phone' : q.preferredContact === 'email' ? 'email' : 'phone or email'}, usually within two working days.
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="wrap mt-20 grid gap-16 border-t border-line pt-16 md:grid-cols-2">
        <div>
          <h2 className="mb-8 text-2xl">Your details</h2>
          <ProfileForm name={visitor.name} phone={visitor.phone} />
        </div>
        <div>
          <h2 className="mb-8 text-2xl">Delete account</h2>
          <DeleteAccountForm />
          <p className="mt-8 text-sm text-stone">
            How we handle your data is explained on our{' '}
            <Link href="/privacy" className="link-underline">
              privacy page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
