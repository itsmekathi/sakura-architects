'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from './Logo'
import { NAV } from './nav'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
    <header
      className={`sticky top-0 z-40 border-b border-line/70 ${open ? 'bg-paper' : 'bg-paper/85 backdrop-blur-md'}`}
    >
      <div className="wrap flex h-16 items-center justify-between lg:h-20">
        <Link href="/" aria-label="Sakura Architects, home" className="shrink-0">
          <Logo />
        </Link>

        {/* Full menu only from lg (1024px): six links + theme switcher don't fit on tablets. */}
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex xl:gap-10">
          <ul className="flex items-center gap-6 text-[0.8rem] tracking-[0.14em] uppercase xl:gap-9">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`link-underline py-1 transition-colors ${isActive(item.href) ? 'text-ink' : 'text-stone hover:text-ink'}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </nav>

        <button
          type="button"
          className="-mr-2 p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-ink transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-px w-6 bg-ink transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </button>
      </div>
    </header>

    {/* Rendered outside <header>: its backdrop-filter would make it the containing block for
        this fixed panel, collapsing the panel to the header's height. */}
    <div
      id="mobile-nav"
      hidden={!open}
      className="fixed inset-x-0 top-16 bottom-0 z-30 overflow-y-auto overscroll-contain bg-paper lg:hidden"
    >
      <nav aria-label="Mobile" className="wrap flex min-h-full flex-col pt-8 pb-10">
        <ul>
          {NAV.map((item, i) => (
            <li key={item.href} className="border-b border-line">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`flex items-baseline gap-4 py-4 font-serif text-[1.75rem] sm:text-3xl ${
                  isActive(item.href) ? 'text-sakura-ink' : ''
                }`}
              >
                <span className="eyebrow w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between pt-10">
          <span className="eyebrow">Theme</span>
          <ThemeToggle />
        </div>
      </nav>
    </div>
    </>
  )
}
