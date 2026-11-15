import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/SectionHeading'
import { getJobs, getSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the Sakura Architects studio.',
}

const TYPE: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
}

export default async function CareersPage() {
  const [jobs, settings] = await Promise.all([getJobs(), getSettings()])
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Work with us"
        intro="We are a small, collaborative studio. We look for people who draw carefully, listen well, and enjoy site visits."
      />
      <section className="wrap">
        {jobs.length === 0 ? (
          <p className="border-t border-line pt-10 text-ink-soft">
            No open positions right now. We still welcome portfolios
            {settings.email && (
              <>
                {' '}at{' '}
                <a className="text-sakura-ink underline underline-offset-4" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </>
            )}
            .
          </p>
        ) : (
          <ul>
            {jobs.map((job) => (
              <li key={job.id} className="grid gap-4 border-t border-line py-10 md:grid-cols-12">
                <div className="md:col-span-4">
                  <h2 className="text-2xl">{job.title}</h2>
                  <p className="eyebrow mt-2">
                    {[job.location, job.type ? TYPE[job.type] : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <p className="whitespace-pre-line text-ink-soft md:col-span-6 md:col-start-6">{job.description}</p>
                <div className="md:col-span-1 md:col-start-12 md:text-right">
                  {settings.email && (
                    <a
                      href={`mailto:${settings.email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                      className="link-underline text-sm tracking-[0.12em] uppercase"
                    >
                      Apply
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-16 text-sm text-stone">
          Questions? <Link href="/contact" className="link-underline">Get in touch</Link>.
        </p>
      </section>
    </>
  )
}
