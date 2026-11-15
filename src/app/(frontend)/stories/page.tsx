import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/SectionHeading'
import { PayloadImage } from '@/components/PayloadImage'
import { Testimonial, storyCover } from '@/components/Testimonial'
import { getStories, getTestimonials } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Success stories',
  description: 'How our clients’ projects came together, and what they say about working with Sakura Architects.',
}

export default async function StoriesPage() {
  const [stories, testimonials] = await Promise.all([getStories(), getTestimonials()])

  return (
    <>
      <PageHeader
        eyebrow="Success stories"
        title="Projects, in our clients’ words"
        intro="Every building begins with someone’s hopes for a place. These are the stories of how those hopes became homes, workplaces and public spaces."
      />

      {stories.length > 0 && (
        <section aria-label="Client stories" className="wrap">
          {stories.map((story, i) => {
            const flip = i % 2 === 1
            const project = typeof story.project === 'object' ? story.project : null
            return (
              <article
                key={story.id}
                className="reveal grid gap-8 border-t border-line py-14 md:grid-cols-12 md:items-center md:gap-12 md:py-20"
              >
                <Link
                  href={`/stories/${story.slug}`}
                  tabIndex={-1}
                  aria-hidden
                  className={`group relative block aspect-[4/3] overflow-hidden bg-paper-2 md:col-span-7 ${flip ? 'md:order-2' : ''}`}
                >
                  <PayloadImage
                    media={storyCover(story)}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    priority={i === 0}
                    className="transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                  />
                </Link>
                <div className={`md:col-span-5 ${flip ? 'md:order-1' : ''}`}>
                  <p className="eyebrow">
                    {story.client}
                    {project ? ` · ${project.title}` : ''}
                  </p>
                  <h2 className="mt-3 text-3xl leading-tight md:text-4xl">
                    <Link href={`/stories/${story.slug}`} className="transition-colors hover:text-sakura-ink">
                      {story.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-ink-soft">{story.excerpt}</p>

                  {story.outcomes && story.outcomes.length > 0 && (
                    <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
                      {story.outcomes.slice(0, 2).map((o) => (
                        <div key={o.id ?? o.label} className="border-t border-line pt-3">
                          <dt className="sr-only">{o.label}</dt>
                          <dd className="font-serif text-3xl">{o.value}</dd>
                          <dd className="eyebrow mt-1">{o.label}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {story.quote?.text && (
                    <blockquote className="mt-8 border-l border-sakura pl-5 font-serif text-lg text-ink-soft">
                      “{story.quote.text}”
                    </blockquote>
                  )}

                  <Link
                    href={`/stories/${story.slug}`}
                    className="link-underline mt-8 inline-block text-sm tracking-[0.12em] uppercase"
                  >
                    Read the story →
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {testimonials.length > 0 && (
        <section aria-labelledby="feedback-heading" className="mt-16 bg-paper-2 py-24 md:py-32">
          <div className="wrap">
            <div className="mb-14 grid gap-6 md:grid-cols-12">
              <div className="md:col-span-6">
                <p className="eyebrow mb-3">Client feedback</p>
                <h2 id="feedback-heading" className="text-3xl md:text-4xl">
                  What our clients say
                </h2>
              </div>
            </div>
            <ul className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.id} className="reveal">
                  <Testimonial t={t} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {stories.length === 0 && testimonials.length === 0 && (
        <p className="wrap text-stone">Stories are on their way.</p>
      )}

      <section className="wrap mt-24">
        <div className="grid gap-8 border-t border-line pt-16 md:grid-cols-12">
          <h2 className="text-3xl leading-tight md:col-span-7 md:text-4xl">
            Ready to write your own story? <span className="text-stone">Tell us about your project.</span>
          </h2>
          <div className="self-end md:col-span-4 md:col-start-9">
            <Link
              href="/contact"
              className="inline-block bg-ink px-8 py-4 text-sm tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85"
            >
              Start a project
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
