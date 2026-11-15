import type { Metadata } from 'next'
import { PageHeader } from '@/components/SectionHeading'
import { ProjectGrid } from '@/components/ProjectGrid'
import { getProjects } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Homes, workplaces, civic buildings and landscapes by Sakura Architects.',
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Work, built and in progress"
        intro="Each project starts with the site: its light, its ground, its neighbours. Browse our work by type."
      />
      <section className="wrap">
        <ProjectGrid projects={projects} />
      </section>
    </>
  )
}
