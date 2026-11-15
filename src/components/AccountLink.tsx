'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * "Sign in" / "My account" link. Checks the visitor session client-side via Payload's REST
 * `/api/visitors/me`, so public pages stay statically rendered.
 */
export function AccountLink({
  className = '',
  labelClassName = '',
  onNavigate,
}: {
  className?: string
  /** e.g. "sr-only xl:not-sr-only" to show only the icon on narrower desktops */
  labelClassName?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/visitors/me', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && setSignedIn(Boolean(d?.user)))
      .catch(() => !cancelled && setSignedIn(false))
    return () => {
      cancelled = true
    }
  }, [pathname])

  const active = pathname.startsWith('/account')
  return (
    <Link
      href={signedIn ? '/account' : '/account/login'}
      title={signedIn ? 'My account' : 'Sign in'}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-2 transition-colors ${active ? 'text-ink' : 'text-stone hover:text-ink'} ${className}`}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </svg>
      {/* Keep width stable while loading */}
      <span className={`${signedIn === null ? 'opacity-0' : ''} ${labelClassName}`}>{signedIn ? 'My account' : 'Sign in'}</span>
    </Link>
  )
}
