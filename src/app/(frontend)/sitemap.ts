import type { MetadataRoute } from 'next'
import { getPosts, getProjects, getStories } from '@/lib/queries'
import { SITE_URL } from '@/lib/payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, stories] = await Promise.all([getProjects(), getPosts(), getStories()])
  const staticRoutes = ['', '/projects', '/stories', '/studio', '/services', '/journal', '/careers', '/contact', '/privacy']
  return [
    ...staticRoutes.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, lastModified: p.updatedAt })),
    ...posts.map((p) => ({ url: `${SITE_URL}/journal/${p.slug}`, lastModified: p.updatedAt })),
    ...stories.map((s) => ({ url: `${SITE_URL}/stories/${s.slug}`, lastModified: s.updatedAt })),
  ]
}
