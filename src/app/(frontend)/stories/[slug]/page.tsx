import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { categoryLabel } from '@/components/ProjectCard'
import { storyCover } from '@/components/Testimonial'
import { getStories, getStory } from '@/lib/queries'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getStories()).filter((s) => s.slug).map((s) => ({ slug: s.slug! }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getStory((await params).slug)
  if (!story) return {}
  const cover = storyCover(story)
  const img = cover && typeof cover === 'object' ? cover : null
  return {
    title: story.title,
    description: story.excerpt,
    openGraph: { type: 'article', images: img?.url ? [{ url: img.url, alt: img.alt }] : undefined },
  }
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params
  const [story, all] = await Promise.all([getStory(slug), getStories()])
  if (!story) notFound()

  const project = typeof story.project === 'object' ? story.project : null
  const idx = all.findIndex((s) => s.id === story.id)
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null

  const facts = [
    ['Client', story.client],
    ['Project', project?.title],
    ['Type', project ? categoryLabel(project.category) : null],
    ['Location', project?.location],
    ['Completed', project?.year?.toString()],
  ].filter(([, v]) => v) as [string, string][]

  return (
    <article>
      <header className="wrap grid gap-8 pt-12 pb-12 md:grid-cols-12 md:pt-20 md:pb-16">
        <div className="md:col-span-8">
          <Link href="/stories" className="eyebrow link-underline">← Success stories</Link>
          <h1 className="mt-6 text-4xl leading-[1.1] md:text-6xl">{story.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-soft">{story.excerpt}</p>
        </div>
      </header>

      <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <PayloadImage media={storyCover(story)} priority sizes="100vw" />
      </div>

      {story.outcomes && story.outcomes.length > 0 && (
        <section aria-label="Results" className="border-b border-line bg-paper-2">
          <dl className="wrap grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
            {story.outcomes.map((o) => (
              <div key={o.id ?? o.label}>
                <dt className="sr-only">{o.label}</dt>
                <dd className="font-serif text-4xl md:text-5xl">{o.value}</dd>
                <dd className="eyebrow mt-2">{o.label}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <aside className="self-start md:sticky md:top-28 md:col-span-3">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-1">
            {facts.map(([k, v]) => (
              <div key={k} className="border-t border-line pt-3">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
          {project && (
            <Link
              href={`/projects/${project.slug}`}
              className="link-underline mt-8 inline-block text-sm tracking-[0.12em] uppercase"
            >
              View the project →
            </Link>
          )}
        </aside>

        <div className="md:col-span-8 md:col-start-5">
          <RichText data={story.body} />
          {story.quote?.text && (
            <figure className="mt-16 border-t border-sakura pt-10">
              <blockquote className="font-serif text-2xl leading-relaxed md:text-3xl">“{story.quote.text}”</blockquote>
              {story.quote.author && <figcaption className="eyebrow mt-6">{story.quote.author}</figcaption>}
            </figure>
          )}
        </div>
      </div>

      {next && next.id !== story.id && (
        <nav aria-label="Next story" className="wrap mt-8">
          <Link href={`/stories/${next.slug}`} className="group flex flex-col gap-2 border-t border-line pt-10">
            <span className="eyebrow">Next story</span>
            <span className="font-serif text-3xl transition-colors group-hover:text-sakura-ink md:text-5xl">
              {next.title} →
            </span>
          </Link>
        </nav>
      )}
    </article>
  )
}
