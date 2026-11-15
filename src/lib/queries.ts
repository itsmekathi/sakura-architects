import { cache } from 'react'
import { getPayloadClient } from './payload'

// All public reads go through Payload's Local API with access control applied,
// so visitors only ever see what an anonymous user is allowed to see.
const publicRead = { overrideAccess: false } as const

export const getSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1, ...publicRead })
})

export const getProjects = cache(async (opts: { featured?: boolean; limit?: number } = {}) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: opts.limit ?? 100,
    sort: '-year',
    where: opts.featured ? { featured: { equals: true } } : undefined,
    ...publicRead,
  })
  return res.docs
})

export const getProject = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    ...publicRead,
  })
  return res.docs[0] ?? null
})

export const getServices = cache(async () => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'services', depth: 1, limit: 50, sort: 'order', ...publicRead })).docs
})

export const getTeam = cache(async () => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'team', depth: 1, limit: 100, sort: 'order', ...publicRead })).docs
})

export const getPosts = cache(async (limit = 50) => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'posts', depth: 1, limit, sort: '-publishedAt', ...publicRead })).docs
})

export const getPost = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    ...publicRead,
  })
  return res.docs[0] ?? null
})

export const getJobs = cache(async () => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'jobs', depth: 0, limit: 50, ...publicRead })).docs
})

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

export const getStories = cache(async () => {
  const payload = await getPayloadClient()
  return (
    await payload.find({ collection: 'stories', depth: 2, limit: 50, sort: ['-featured', '-publishedAt'], ...publicRead })
  ).docs
})

export const getStory = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'stories',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
    ...publicRead,
  })
  return res.docs[0] ?? null
})

/** Story and testimonials linked to one project, for the project detail page. */
export const getProjectFeedback = cache(async (projectId: number) => {
  const payload = await getPayloadClient()
  const [stories, testimonials] = await Promise.all([
    payload.find({ collection: 'stories', depth: 0, limit: 1, where: { project: { equals: projectId } }, ...publicRead }),
    payload.find({ collection: 'testimonials', depth: 1, limit: 3, where: { project: { equals: projectId } }, ...publicRead }),
  ])
  return { story: stories.docs[0] ?? null, testimonials: testimonials.docs }
})

export const getTestimonials = cache(async () => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'testimonials', depth: 1, limit: 100, sort: 'order', ...publicRead })).docs
})
