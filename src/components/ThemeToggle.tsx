'use client'

import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, type Theme } from './theme'

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: 'system',
    label: 'Match system theme',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    value: 'light',
    label: 'Light theme',
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    value: 'dark',
    label: 'Dark theme',
    icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  },
]

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY)
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.add('theme-transition')
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  window.setTimeout(() => root.classList.remove('theme-transition'), 350)
}

/** System / Light / Dark switcher. "System" follows the browser's prefers-color-scheme live. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  // null until mounted: the server can't know the saved theme, so render neutral to avoid hydration mismatch.
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(readTheme())
    // Keep other open tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return
      const next = readTheme()
      setTheme(next)
      applyTheme(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const choose = (next: Theme) => {
    setTheme(next)
    try {
      if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
      else localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {}
    applyTheme(next)
  }

  return (
    <div role="radiogroup" aria-label="Colour theme" className={`inline-flex items-center gap-0.5 rounded-full border border-line p-0.5 ${className}`}>
      {OPTIONS.map((o) => {
        const active = theme === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            title={o.label}
            onClick={() => choose(o.value)}
            className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
              active ? 'bg-ink text-paper' : 'text-stone hover:text-ink'
            }`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {o.icon}
            </svg>
          </button>
        )
      })}
    </div>
  )
}
