const ERRORS: Record<string, string> = {
  google: 'Google sign-in didn’t complete. Please try again.',
  'google-cancelled': 'Google sign-in was cancelled.',
  'google-state': 'Your Google sign-in session expired. Please try again.',
  'google-disabled': 'Google sign-in isn’t set up yet. Please use email and password.',
}

/** Centered two-column layout for the sign-in / sign-up / password pages. */
export function AuthShell({
  eyebrow,
  title,
  intro,
  error,
  children,
}: {
  eyebrow: string
  title: string
  intro?: React.ReactNode
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <section className="wrap grid gap-12 pt-16 pb-8 md:grid-cols-12 md:pt-24">
      <div className="md:col-span-5">
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="text-4xl leading-[1.1] md:text-5xl">{title}</h1>
        {intro && <div className="mt-6 max-w-md text-ink-soft">{intro}</div>}
      </div>
      <div className="md:col-span-6 md:col-start-7">
        {error && ERRORS[error] && (
          <p role="alert" className="mb-8 border-l-2 border-sakura pl-4 text-sm text-sakura-ink">
            {ERRORS[error]}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
