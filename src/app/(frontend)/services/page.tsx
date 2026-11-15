import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/SectionHeading'
import { PayloadImage } from '@/components/PayloadImage'
import { getServices } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Architecture, structural and civil engineering, interiors, urban planning and consulting.',
}

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="One studio, from feasibility to handover"
        intro="Architects and engineers work side by side, so structure, space and budget are resolved together from day one."
      />
      <section className="wrap">
        {services.map((s, i) => (
          <article key={s.id} className="reveal grid gap-8 border-t border-line py-14 md:grid-cols-12 md:py-20">
            <span className="font-serif text-stone tabular-nums md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
            <div className="md:col-span-5">
              <h2 className="text-3xl md:text-4xl">{s.title}</h2>
              <p className="mt-5 text-lg text-ink-soft">{s.summary}</p>
              {s.deliverables && s.deliverables.length > 0 && (
                <ul className="mt-8 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {s.deliverables.map((d) => (
                    <li key={d.id ?? d.item} className="flex gap-3">
                      <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-sakura" />
                      {d.item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-paper-2 md:col-span-5 md:col-start-8">
              <PayloadImage media={s.image} sizes="(min-width: 768px) 40vw, 100vw" />
            </div>
          </article>
        ))}
        <div className="border-t border-line pt-14">
          <Link href="/contact" className="link-underline text-sm tracking-[0.14em] uppercase">
            Discuss your project →
          </Link>
        </div>
      </section>
    </>
  )
}
