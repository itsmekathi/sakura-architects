import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { categoryLabel } from '@/components/ProjectCard'
import { Testimonial } from '@/components/Testimonial'
import { getProject, getProjectFeedback, getProjects } from '@/lib/queries'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.filter((p) => p.slug).map((p) => ({ slug: p.slug! }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug)
  if (!project) return {}
  const cover = typeof project.cover === 'object' ? project.cover : null
  return {
    title: project.title,
    description: project.summary,
    openGraph: { images: cover?.url ? [{ url: cover.url, alt: cover.alt }] : undefined },
  }
}

const STATUS: Record<string, string> = { completed: 'Completed', construction: 'In construction', design: 'In design' }

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const [project, all] = await Promise.all([getProject(slug), getProjects()])
  if (!project) notFound()
  const feedback = await getProjectFeedback(project.id)

  const idx = all.findIndex((p) => p.id === project.id)
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null

  const facts = [
    ['Category', categoryLabel(project.category)],
    ['Location', project.location],
    ['Year', project.year?.toString()],
    ['Area', project.area],
    ['Client', project.client],
    ['Status', project.status ? STATUS[project.status] : null],
  ].filter(([, v]) => v) as [string, string][]

  const gallery = (project.gallery ?? []).filter((m) => typeof m === 'object')

  return (
    <article>
      <header className="wrap pt-12 pb-10 md:pt-20 md:pb-14">
        <Link href="/projects" className="eyebrow link-underline">← Projects</Link>
        <h1 className="mt-6 max-w-4xl text-4xl leading-[1.1] md:text-6xl">{project.title}</h1>
      </header>

      <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <PayloadImage media={project.cover} priority sizes="100vw" />
      </div>

      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start md:sticky md:top-28 md:col-span-3 md:grid-cols-1">
          {facts.map(([k, v]) => (
            <div key={k} className="border-t border-line pt-3">
              <dt className="eyebrow">{k}</dt>
              <dd className="mt-1">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="md:col-span-8 md:col-start-5">
          <p className="font-serif text-2xl leading-relaxed md:text-3xl">{project.summary}</p>
          <RichText data={project.body} className="mt-10" />
        </div>
      </div>

      {gallery.length > 0 && (
        <section aria-label="Gallery" className="wrap grid gap-4 md:grid-cols-12 md:gap-8">
          {gallery.map((m, i) => {
            // Rhythm: wide, then two side-by-side, repeat.
            const wide = i % 3 === 0
            return (
              <figure key={typeof m === 'object' ? m.id : i} className={`reveal ${wide ? 'md:col-span-12' : 'md:col-span-6'}`}>
                <div className={`relative overflow-hidden bg-paper-2 ${wide ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}>
                  <PayloadImage media={m} sizes={wide ? '100vw' : '(min-width: 768px) 50vw, 100vw'} />
                </div>
                {typeof m === 'object' && m.credit && (
                  <figcaption className="mt-2 text-xs text-stone">{m.credit}</figcaption>
                )}
              </figure>
            )
          })}
        </section>
      )}

      {(feedback.story || feedback.testimonials.length > 0) && (
        <section aria-label="Client feedback" className="wrap mt-24 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="eyebrow">Client feedback</p>
            {feedback.story && (
              <Link
                href={`/stories/${feedback.story.slug}`}
                className="link-underline mt-4 inline-block text-sm tracking-[0.12em] uppercase"
              >
                Read the full story →
              </Link>
            )}
          </div>
          <ul className="grid gap-12 md:col-span-8 md:col-start-5 md:grid-cols-2">
            {feedback.testimonials.map((t) => (
              <li key={t.id}>
                <Testimonial t={t} showProject={false} />
              </li>
            ))}
            {feedback.testimonials.length === 0 && feedback.story?.quote?.text && (
              <li className="md:col-span-2">
                <figure className="border-t border-sakura pt-6">
                  <blockquote className="font-serif text-2xl leading-relaxed">“{feedback.story.quote.text}”</blockquote>
                  {feedback.story.quote.author && (
                    <figcaption className="eyebrow mt-4">{feedback.story.quote.author}</figcaption>
                  )}
                </figure>
              </li>
            )}
          </ul>
        </section>
      )}

      {next && next.id !== project.id && (
        <nav aria-label="Next project" className="wrap mt-24">
          <Link href={`/projects/${next.slug}`} className="group flex flex-col gap-2 border-t border-line pt-10">
            <span className="eyebrow">Next project</span>
            <span className="font-serif text-3xl transition-colors group-hover:text-sakura-ink md:text-5xl">
              {next.title} →
            </span>
          </Link>
        </nav>
      )}
    </article>
  )
}
