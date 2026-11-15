import type { Metadata } from 'next'
import { Inter, Shippori_Mincho } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { themeInitScript } from '@/components/theme'
import { getSettings } from '@/lib/queries'
import { SITE_URL } from '@/lib/payload'
import './globals.css'

const mincho = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mincho',
  display: 'swap',
})
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Sakura Architects', template: '%s · Sakura Architects' },
  description:
    'Sakura Architects is an architecture and civil engineering studio designing calm, durable buildings and places.',
  openGraph: { type: 'website', siteName: 'Sakura Architects', locale: 'en_GB' },
  twitter: { card: 'summary_large_image' },
}

// Pages are static and refreshed on save by the CMS hooks. This hourly refresh is a safety net,
// e.g. for journal posts or stories scheduled with a future publish date.
export const revalidate = 3600

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3ee' },
    { media: '(prefers-color-scheme: dark)', color: '#161413' },
  ],
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    additionalType: 'https://schema.org/Architect',
    name: 'Sakura Architects',
    url: SITE_URL,
    email: settings.email ?? undefined,
    telephone: settings.phone ?? undefined,
    address: settings.address ?? undefined,
    sameAs: settings.socials?.map((s) => s.url),
  }

  return (
    // suppressHydrationWarning: the theme script sets data-theme on <html> before React hydrates.
    <html lang="en" className={`${mincho.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </body>
    </html>
  )
}
