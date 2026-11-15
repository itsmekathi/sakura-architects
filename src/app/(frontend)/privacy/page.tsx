import type { Metadata } from 'next'
import { PageHeader } from '@/components/SectionHeading'

export const metadata: Metadata = { title: 'Privacy' }

// Placeholder copy. Have it reviewed for your jurisdiction before launch.
export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy" />
      <div className="wrap">
        <div className="prose-sakura">
          <p>
            When you send us an enquiry we store your name, contact details and message so we can reply. We do not sell
            or share this information, and we delete enquiries that do not lead to a project after 24 months.
          </p>
          <p>
            This site does not use advertising or tracking cookies. The contact page embeds a Google Map, which is loaded
            from Google and subject to Google’s privacy policy.
          </p>
          <p>To see, correct or delete the information we hold about you, email the studio.</p>
        </div>
      </div>
    </>
  )
}
