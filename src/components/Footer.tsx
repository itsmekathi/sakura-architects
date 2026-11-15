import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'
import { Logo } from './Logo'
import { NAV } from './nav'

export function Footer({ settings }: { settings: SiteSetting }) {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-32 border-t border-line">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          {settings.intro && <p className="mt-6 max-w-sm text-sm text-stone">{settings.intro}</p>}
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow mb-4">Studio</p>
          {settings.address && <address className="text-sm whitespace-pre-line not-italic">{settings.address}</address>}
          {settings.hours && <p className="mt-3 text-sm text-stone">{settings.hours}</p>}
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-1 text-sm">
            {settings.email && (
              <li>
                <a className="link-underline" href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
            {settings.phone && (
              <li>
                <a className="link-underline" href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a>
              </li>
            )}
            {settings.socials?.map((s) => (
              <li key={s.id ?? s.url}>
                <a className="link-underline capitalize" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-1 text-sm">
            {[...NAV, { href: '/careers', label: 'Careers' }].map((item) => (
              <li key={item.href}>
                <Link className="link-underline" href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-line py-6 text-xs text-stone sm:flex-row sm:justify-between">
        <p>© {year} Sakura Architects. All rights reserved.</p>
        <p className="flex gap-6">
          <Link className="link-underline" href="/privacy">Privacy</Link>
          <Link className="link-underline" href="/admin">Staff login</Link>
        </p>
      </div>
    </footer>
  )
}
