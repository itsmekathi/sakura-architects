import Link from 'next/link'

export function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string
  title: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 md:mb-14">
      <div>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="text-3xl md:text-4xl">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="link-underline text-sm tracking-[0.12em] uppercase">
          {link.label} →
        </Link>
      )}
    </div>
  )
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string | null }) {
  return (
    <header className="wrap grid gap-6 pt-16 pb-12 md:grid-cols-12 md:pt-24 md:pb-20">
      <div className="md:col-span-7">
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="text-4xl leading-[1.1] md:text-6xl">{title}</h1>
      </div>
      {intro && <p className="self-end text-lg text-ink-soft md:col-span-4 md:col-start-9">{intro}</p>}
    </header>
  )
}
