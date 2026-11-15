'use client'

import { useState } from 'react'
import type { Project } from '@/payload-types'
import { PROJECT_CATEGORIES } from '@/lib/constants'
import { ProjectCard } from './ProjectCard'

/** Projects grid with a client-side category filter (the full list is small and already rendered). */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>('all')
  const present = PROJECT_CATEGORIES.filter((c) => projects.some((p) => p.category === c.value))
  const shown = filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  const tabs = [{ label: 'All', value: 'all' }, ...present]

  return (
    <>
      <div role="group" aria-label="Filter by category" className="mb-12 flex flex-wrap gap-x-8 gap-y-3 border-b border-line pb-5">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={filter === t.value}
            onClick={() => setFilter(t.value)}
            className={`text-[0.8rem] tracking-[0.16em] uppercase transition-colors ${
              filter === t.value ? 'text-ink underline decoration-sakura decoration-1 underline-offset-8' : 'text-stone hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-stone">No projects yet.</p>
      ) : (
        <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <li key={p.id} className={`reveal ${i % 3 === 1 ? 'lg:mt-16' : ''}`}>
              <ProjectCard project={p} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
