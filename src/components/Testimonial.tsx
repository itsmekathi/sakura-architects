import Link from 'next/link'
import type { Project, Story, Testimonial as TestimonialDoc } from '@/payload-types'
import { PayloadImage } from './PayloadImage'

export function Rating({ value }: { value?: number | null }) {
  if (!value) return null
  const n = Math.max(1, Math.min(5, Math.round(value)))
  return (
    <p className="flex gap-1 text-sm text-sakura" role="img" aria-label={`Rated ${n} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden className={i < n ? '' : 'opacity-25'}>
          ★
        </span>
      ))}
    </p>
  )
}

/** Client feedback quote. `showProject` adds a link to the related project. */
export function Testimonial({ t, showProject = true }: { t: TestimonialDoc; showProject?: boolean }) {
  const project = typeof t.project === 'object' ? (t.project as Project | null) : null
  return (
    <figure className="flex h-full flex-col border-t border-sakura pt-6">
      <Rating value={t.rating} />
      <blockquote className="mt-4 flex-1 font-serif text-xl leading-relaxed">“{t.quote}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-4">
        {t.photo && typeof t.photo === 'object' && (
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-paper-2">
            <PayloadImage media={t.photo} sizes="44px" />
          </span>
        )}
        <span>
          <span className="block">{t.name}</span>
          <span className="eyebrow block">
            {t.role}
            {showProject && project && (
              <>
                {t.role ? ' · ' : ''}
                <Link href={`/projects/${project.slug}`} className="link-underline">
                  {project.title}
                </Link>
              </>
            )}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

/** A story's own cover, falling back to its project's cover. */
export const storyCover = (story: Story) =>
  story.cover ?? (typeof story.project === 'object' && story.project ? story.project.cover : null)
