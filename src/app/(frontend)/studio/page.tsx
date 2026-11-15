import type { Metadata } from 'next'
import { PageHeader } from '@/components/SectionHeading'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { getSettings, getTeam } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'The people, history and philosophy behind Sakura Architects.',
}

export default async function StudioPage() {
  const [settings, team] = await Promise.all([getSettings(), getTeam()])

  return (
    <>
      <PageHeader
        eyebrow="Studio"
        title="Architecture with restraint"
        intro="A small studio of architects and engineers who believe the best buildings feel inevitable."
      />

      {settings.philosophy && (
        <section className="wrap grid gap-10 pb-24 md:grid-cols-12">
          <p className="eyebrow md:col-span-3">Philosophy</p>
          <RichText data={settings.philosophy} className="md:col-span-8 md:col-start-5" />
        </section>
      )}

      {team.length > 0 && (
        <section className="wrap pb-24 md:pb-32">
          <div className="mb-12 border-b border-line pb-6">
            <p className="eyebrow mb-3">People</p>
            <h2 className="text-3xl md:text-4xl">The team</h2>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
            {team.map((m) => (
              <li key={m.id} className="reveal">
                <div className="relative aspect-[3/4] overflow-hidden bg-paper-2">
                  <PayloadImage
                    media={m.photo}
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="grayscale-[35%]"
                  />
                </div>
                <h3 className="mt-4 text-lg">{m.name}</h3>
                <p className="eyebrow mt-1">{m.role}</p>
                {m.bio && <p className="mt-3 text-sm text-ink-soft">{m.bio}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-paper-2 py-24">
        <div className="wrap grid gap-16 md:grid-cols-2">
          {settings.timeline && settings.timeline.length > 0 && (
            <div>
              <p className="eyebrow mb-8">History</p>
              <ol className="space-y-0">
                {settings.timeline.map((t) => (
                  <li key={t.id ?? t.year} className="grid grid-cols-[5rem_1fr] gap-4 border-t border-line py-5">
                    <span className="font-serif text-xl tabular-nums">{t.year}</span>
                    <span className="text-ink-soft">{t.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {settings.awards && settings.awards.length > 0 && (
            <div>
              <p className="eyebrow mb-8">Recognition</p>
              <ul>
                {settings.awards.map((a) => (
                  <li key={a.id ?? a.title} className="grid grid-cols-[5rem_1fr] gap-4 border-t border-line py-5">
                    <span className="font-serif text-xl tabular-nums">{a.year}</span>
                    <span className="text-ink-soft">{a.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
