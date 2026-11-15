import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/SectionHeading'
import { consentTextsFromSettings } from '@/lib/consent'
import { getSettings } from '@/lib/queries'

export const metadata: Metadata = { title: 'Privacy' }

// Placeholder copy. Have it reviewed for your jurisdiction before launch.
// The enquiry section is the same text visitors agree to before sending (Admin → Site settings → Enquiry consent).
export default async function PrivacyPage() {
  const settings = await getSettings()
  const { contact, dataNotice } = consentTextsFromSettings(settings)

  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy" />
      <div className="wrap">
        <div className="prose-sakura">
          <h2>Enquiries</h2>
          {dataNotice.split(/\n{2,}/).map((p, i) => {
            const m = p.match(/^([^:\n]{2,40}):\s*([\s\S]*)$/)
            return <p key={i}>{m ? <><strong>{m[1]}:</strong> {m[2]}</> : p}</p>
          })}
          <p>
            Before sending an enquiry you are asked to confirm: <em>“{contact}”</em> The exact wording you agreed to is
            stored with your enquiry, together with the date and time.
          </p>

          <h2>Accounts</h2>
          <p>
            Creating an account is optional. If you create one, we store your name, email address, phone number (if you
            add it) and a securely hashed password. If you sign in with Google, we receive your name and email address
            from Google; we do not receive your Google password or access anything else in your Google account.
          </p>
          <p>
            You can update your details or delete your account at any time from{' '}
            <Link href="/account">My account</Link>. Deleting your account also deletes the enquiries you sent while
            signed in.
          </p>

          <h2>Cookies</h2>
          <p>
            We use a single essential cookie to keep you signed in, plus your theme preference stored in your browser. We
            do not use advertising or tracking cookies. The contact page embeds a Google Map, which is loaded from Google
            and subject to Google’s privacy policy.
          </p>

          <h2>Contact</h2>
          <p>
            To see, correct or delete the information we hold about you, email the studio
            {settings.email && (
              <>
                {' '}at <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </>
            )}
            .
          </p>
        </div>
      </div>
    </>
  )
}
