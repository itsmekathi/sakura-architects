import Link from 'next/link'
import { PayloadImage } from '@/components/PayloadImage'
import { ProjectCard } from '@/components/ProjectCard'
import { SectionHeading } from '@/components/SectionHeading'
import { formatDate, getPosts, getProjects, getServices, getSettings } from '@/lib/queries'

export default async function HomePage() {
  const [settings, featured, services, posts] = await Promise.all([
    getSettings(),
    getProjects({ featured: true, limit: 5 }),
    getServices(),
    getPosts(3),
  ])
  const [lead, ...rest] = featured

  return (
    <>
      {/* Hero: asymmetric split, text left, image right */}
      <section className="wrap grid gap-10 pt-10 pb-20 md:grid-cols-12 md:gap-8 md:pt-16 md:pb-32">
        <div className="relative flex flex-col justify-end md:col-span-5 md:pb-6">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 right-0 hidden font-serif text-sm tracking-[0.5em] text-stone [writing-mode:vertical-rl] md:block"
          >
            桜 建築設計事務所
          </span>
          <p className="eyebrow mb-6">{settings.heroEyebrow}</p>
          <h1 className="text-[2.6rem] leading-[1.08] whitespace-pre-line sm:text-6xl lg:text-7xl">
            {settings.heroTitle}
          </h1>
          <div className="mt-10 h-px w-16 bg-sakura" />
          {settings.intro && <p className="mt-8 max-w-md text-lg text-ink-soft">{settings.intro}</p>}
          <div className="mt-10 flex flex-wrap gap-8 text-sm tracking-[0.14em] uppercase">
            <Link href="/projects" className="link-underline">View projects →</Link>
            <Link href="/contact" className="link-underline text-stone hover:text-ink">Start a project</Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[4/3] md:col-span-7 md:aspect-auto md:min-h-[78vh]">
          <PayloadImage media={settings.heroImage} sizes="(min-width: 768px) 58vw, 100vw" priority />
        </div>
      </section>

      {/* Featured projects */}
      {lead && (
        <section className="wrap pb-24 md:pb-36">
          <SectionHeading eyebrow="Selected work" title="Featured projects" link={{ href: '/projects', label: 'All projects' }} />
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-12">
            <div className="reveal md:col-span-8">
              <ProjectCard project={lead} aspect="aspect-[16/10]" sizes="(min-width: 768px) 66vw, 100vw" />
            </div>
            <div className="flex flex-col gap-16 md:col-span-4 md:pt-24">
              {rest.slice(0, 2).map((p) => (
                <div key={p.id} className="reveal">
                  <ProjectCard project={p} aspect="aspect-[4/5]" sizes="(min-width: 768px) 33vw, 100vw" />
                </div>
              ))}
            </div>
            {rest.slice(2, 4).map((p, i) => (
              <div key={p.id} className={`reveal md:col-span-6 ${i === 1 ? 'md:mt-20' : ''}`}>
                <ProjectCard project={p} sizes="(min-width: 768px) 50vw, 100vw" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services teaser */}
      {services.length > 0 && (
        <section className="bg-paper-2 py-24 md:py-32">
          <div className="wrap grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow mb-4">What we do</p>
              <h2 className="text-3xl md:text-4xl">From first sketch to final inspection.</h2>
              <Link href="/services" className="link-underline mt-8 inline-block text-sm tracking-[0.12em] uppercase">
                Our services →
              </Link>
            </div>
            <ol className="md:col-span-7 md:col-start-6">
              {services.map((s, i) => (
                <li key={s.id} className="reveal grid grid-cols-[3rem_1fr] gap-4 border-t border-line py-7 last:border-b">
                  <span className="font-serif text-stone tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-2xl">{s.title}</h3>
                    <p className="mt-2 text-ink-soft">{s.summary}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Journal */}
      {posts.length > 0 && (
        <section className="wrap py-24 md:py-36">
          <SectionHeading eyebrow="Journal" title="Notes from the studio" link={{ href: '/journal', label: 'All posts' }} />
          <ul className="grid gap-12 md:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id} className="reveal">
                <Link href={`/journal/${post.slug}`} className="group block">
                  <div className="relative aspect-[3/2] overflow-hidden bg-paper-2">
                    <PayloadImage
                      media={post.cover}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="eyebrow mt-5">{formatDate(post.publishedAt)}</p>
                  <h3 className="mt-2 text-xl transition-colors group-hover:text-sakura-ink">{post.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{post.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Call to action */}
      <section className="wrap">
        <div className="grid gap-8 border-t border-line pt-20 md:grid-cols-12">
          <h2 className="text-4xl leading-tight md:col-span-7 md:text-5xl">
            Have a site, a brief, or just an idea? <span className="text-stone">Let’s talk.</span>
          </h2>
          <div className="self-end md:col-span-4 md:col-start-9">
            <Link
              href="/contact"
              className="inline-block bg-ink px-8 py-4 text-sm tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
