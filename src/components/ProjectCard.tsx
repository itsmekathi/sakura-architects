import Link from 'next/link'
import type { Project } from '@/payload-types'
import { PROJECT_CATEGORIES } from '@/lib/constants'
import { PayloadImage } from './PayloadImage'

export const categoryLabel = (value?: string | null) =>
  PROJECT_CATEGORIES.find((c) => c.value === value)?.label ?? value ?? ''

export function ProjectCard({
  project,
  aspect = 'aspect-[4/3]',
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  priority,
}: {
  project: Project
  aspect?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className={`relative overflow-hidden bg-paper-2 ${aspect}`}>
        <PayloadImage
          media={project.cover}
          sizes={sizes}
          priority={priority}
          className="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-xl transition-colors group-hover:text-sakura-ink">{project.title}</h3>
        {project.year && <span className="text-sm text-stone tabular-nums">{project.year}</span>}
      </div>
      <p className="eyebrow mt-1">
        {categoryLabel(project.category)}
        {project.location ? ` · ${project.location}` : ''}
      </p>
    </Link>
  )
}
