import type { Metadata } from 'next'
import { ContactForm } from '@/components/ContactForm'
import { getSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Tell us about your project. We reply to every enquiry.',
}

export default async function ContactPage() {
  const settings = await getSettings()
  const mapQuery = settings.address?.replace(/\n/g, ', ')

  return (
    <>
      <header className="wrap pt-16 pb-12 md:pt-24 md:pb-16">
        <p className="eyebrow mb-5">Contact</p>
        <h1 className="max-w-3xl text-4xl leading-[1.1] md:text-6xl">Tell us about your project.</h1>
      </header>

      <div className="wrap grid gap-16 md:grid-cols-12">
        <section aria-label="Enquiry form" className="md:col-span-7">
          <ContactForm />
        </section>

        <aside className="space-y-10 md:col-span-4 md:col-start-9">
          {settings.address && (
            <div>
              <p className="eyebrow mb-3">Studio</p>
              <address className="whitespace-pre-line not-italic">{settings.address}</address>
            </div>
          )}
          {(settings.email || settings.phone) && (
            <div>
              <p className="eyebrow mb-3">Direct</p>
              {settings.email && (
                <p>
                  <a className="link-underline" href={`mailto:${settings.email}`}>{settings.email}</a>
                </p>
              )}
              {settings.phone && (
                <p>
                  <a className="link-underline" href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a>
                </p>
              )}
            </div>
          )}
          {settings.hours && (
            <div>
              <p className="eyebrow mb-3">Hours</p>
              <p>{settings.hours}</p>
            </div>
          )}
        </aside>
      </div>

      {mapQuery && (
        <section aria-label="Map" className="wrap mt-24">
          <iframe
            title="Studio location map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            className="h-[360px] w-full border-0 grayscale-[60%] md:h-[460px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      )}
    </>
  )
}
