/**
 * Seeds placeholder content. Run with:  pnpm seed
 *
 * It clears and recreates projects, stories, testimonials, team, services, posts, jobs and media,
 * and fills the site settings. `pnpm seed stories` only (re)creates stories and testimonials.
 * Users and inquiries are left untouched. Placeholder photos come from Unsplash. If a download fails,
 * a flat colour placeholder is generated instead, so the seed also works offline.
 */
import 'dotenv/config'
import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { lexical } from './lexical'
import { seedStories } from './stories'

// A fresh object per call: Payload uses the passed context object as-is, and the cloud-storage plugin
// stores per-upload state on it. A shared object made every upload after the first one silently skip Blob.
const ctx = () => ({ disableRevalidate: true })

const UNSPLASH = (id: string, w = 1800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=75&fm=jpg&fit=crop`

const PALETTE = ['#d9cfc2', '#c9bfb3', '#bfb5a8', '#e3d6cf', '#cdc6bb', '#b9b0a4']

async function fetchImage(id: string, seed: number): Promise<Buffer> {
  try {
    const res = await fetch(UNSPLASH(id), { signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  } catch (err) {
    console.warn(`  · image ${id} unavailable (${(err as Error).message}), using a generated placeholder`)
    return sharp({
      create: { width: 1600, height: 1100, channels: 3, background: PALETTE[seed % PALETTE.length] },
    })
      .jpeg({ quality: 80 })
      .toBuffer()
  }
}

let imageCount = 0
async function image(payload: Payload, id: string, alt: string) {
  const data = await fetchImage(id, imageCount++)
  const doc = await payload.create({
    collection: 'media',
    data: { alt, credit: 'Photo: Unsplash (placeholder)' },
    file: { data, mimetype: 'image/jpeg', name: `placeholder-${id.slice(0, 13)}.jpg`, size: data.length },
    context: ctx(),
  })
  return doc.id
}

async function clear(payload: Payload) {
  for (const collection of ['stories', 'testimonials', 'projects', 'team', 'services', 'posts', 'jobs', 'media'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, context: ctx() })
  }
}

// ── Placeholder content ──────────────────────────────────────────────

const projects = [
  {
    title: 'Engawa House',
    category: 'residential',
    location: 'Hillside, Kamakura',
    year: 2024,
    area: '210 m²',
    client: 'Private',
    featured: true,
    summary: 'A timber family home wrapped by a deep veranda that blurs the line between garden and living room.',
    cover: '1600585154340-be6161a56a0c',
    gallery: ['1600596542815-ffad4c1539a9', '1600607687939-ce8a6c25118c', '1600566753190-17f0baa2a6c3'],
  },
  {
    title: 'Riverside Library',
    category: 'civic',
    location: 'Old Town Riverfront',
    year: 2023,
    area: '3,400 m²',
    client: 'City Council',
    featured: true,
    summary: 'A public library under a single folded roof, its reading rooms stepping down toward the water.',
    cover: '1487958449943-2429e8be8625',
    gallery: ['1521587760476-6c12a4b040da', '1507842217343-583bb7270b66'],
  },
  {
    title: 'Kura Offices',
    category: 'commercial',
    location: 'Harbour District',
    year: 2023,
    area: '5,800 m²',
    client: 'Kura Holdings',
    featured: true,
    summary: 'A six-storey workplace with an exposed concrete frame, shaded by a screen of vertical cedar fins.',
    cover: '1486406146926-c627a92ad1ab',
    gallery: ['1497366216548-37526070297c', '1497366811353-6870744d04b2'],
  },
  {
    title: 'Tea Pavilion',
    category: 'landscape',
    location: 'Botanical Gardens',
    year: 2022,
    area: '48 m²',
    client: 'Botanical Trust',
    featured: true,
    summary: 'A small pavilion of charred larch set on stone piers at the edge of a reflecting pond.',
    cover: '1518005020951-eccb494ad742',
    gallery: ['1500530855697-b586d89ba3ee'],
  },
  {
    title: 'Courtyard Apartments',
    category: 'residential',
    location: 'Northern Quarter',
    year: 2022,
    area: '7,200 m²',
    client: 'Hikari Housing Co-op',
    featured: true,
    summary: 'Forty-two affordable homes arranged around a planted courtyard, each with dual-aspect light.',
    cover: '1545324418-cc1a3fa10c00',
    gallery: ['1512917774080-9991f1c4c750'],
  },
  {
    title: 'Atelier Interior',
    category: 'interiors',
    location: 'Arts District',
    year: 2021,
    area: '320 m²',
    client: 'Studio Mori',
    summary: 'A former print works converted into a ceramics atelier with lime-washed walls and oak joinery.',
    cover: '1507089947368-19c1da9775ae',
    gallery: ['1505691938895-1758d7feb511'],
  },
  {
    title: 'Footbridge at Sato',
    category: 'civic',
    location: 'Sato Canal',
    year: 2021,
    area: '64 m span',
    client: 'Regional Transport Authority',
    summary: 'A slender steel and timber pedestrian bridge engineered in-house, reconnecting two neighbourhoods.',
    cover: '1511818966892-d7d671e672a2',
    gallery: [],
  },
  {
    title: 'Hillside Clinic',
    category: 'commercial',
    location: 'Eastern Hills',
    year: 2025,
    area: '1,150 m²',
    client: 'Eastern Health Trust',
    status: 'construction',
    summary: 'A community health clinic arranged around three gardens, so every waiting area looks onto green.',
    cover: '1494526585095-c41746248156',
    gallery: [],
  },
]

const team = [
  { name: 'Hana Sato', role: 'Founding Director, Architect', photo: '1494790108377-be9c29b29330' },
  { name: 'Kenji Mori', role: 'Director, Structural Engineer', photo: '1507003211169-0a1dd7228f2d' },
  { name: 'Aiko Tanaka', role: 'Associate Architect', photo: '1438761681033-6461ffad8d80' },
  { name: 'Daniel Okafor', role: 'Civil Engineer', photo: '1500648767791-00dcc994a43e' },
  { name: 'Mei Lin', role: 'Interior Designer', photo: '1544005313-94ddf0286df2' },
  { name: 'Ravi Menon', role: 'Project Architect', photo: '1472099645785-5658abf4ff4e' },
]

const services = [
  {
    title: 'Architecture',
    summary: 'Full architectural services from feasibility and concept design through planning, detailed design and site supervision.',
    deliverables: ['Feasibility studies', 'Concept & schematic design', 'Planning applications', 'Construction documents', 'Site supervision'],
    image: '1503387762-592deb58ef4e',
  },
  {
    title: 'Structural & Civil Engineering',
    summary: 'In-house engineers design foundations, frames and infrastructure alongside the architecture, not after it.',
    deliverables: ['Structural design', 'Foundations & geotechnics', 'Drainage & site works', 'Bridges & small infrastructure', 'Structural surveys'],
    image: '1541888946425-d81bb19240f5',
  },
  {
    title: 'Interior Design',
    summary: 'Calm, tactile interiors with bespoke joinery, natural materials and lighting designed with the building.',
    deliverables: ['Space planning', 'Joinery & furniture', 'Material palettes', 'Lighting design'],
    image: '1505691938895-1758d7feb511',
  },
  {
    title: 'Urban Planning & Landscape',
    summary: 'Masterplans and public spaces that knit new buildings into streets, gardens and waterways.',
    deliverables: ['Masterplanning', 'Public realm design', 'Landscape architecture', 'Community consultation'],
    image: '1500530855697-b586d89ba3ee',
  },
  {
    title: 'Consulting',
    summary: 'Independent advice for owners and developers: site appraisals, design reviews and project management.',
    deliverables: ['Site appraisals', 'Design reviews', 'Cost planning', 'Project management'],
    image: '1497366216548-37526070297c',
  },
]

const posts = [
  {
    title: 'Riverside Library opens to the public',
    excerpt: 'After three years of design and construction, the library’s doors opened this spring. A look back at how the folded roof came together.',
    cover: '1521587760476-6c12a4b040da',
    daysAgo: 12,
  },
  {
    title: 'Why we design with timber',
    excerpt: 'Engineered timber lets us build lighter, faster and with far less embodied carbon. Here is what we have learned from five timber projects.',
    cover: '1600607687939-ce8a6c25118c',
    daysAgo: 45,
  },
  {
    title: 'Notes on light: designing the Engawa House',
    excerpt: 'The deep veranda is a very old idea. We revisited it to bring winter sun in and keep summer sun out.',
    cover: '1600596542815-ffad4c1539a9',
    daysAgo: 90,
  },
]

const projectBody = (title: string) =>
  lexical([
    `${title} began, as all our projects do, with time spent on the site: watching how light moves across it through the day, where the wind comes from, and how people pass by.`,
    '## Approach',
    'The plan is organised around a sequence of thresholds. Each one slows the visitor down and frames a view, so the building is experienced as a series of quiet moments rather than a single object.',
    '> We wanted the structure to be honest, and the spaces to be generous.',
    'Structure and architecture were developed together by our in-house engineers and architects, allowing slender spans and a reduced material palette of timber, concrete and lime plaster.',
    '## Sustainability',
    'Passive design (orientation, shading and thermal mass) does most of the work. Rainwater is collected for the gardens, and the building is designed to be easily adapted as needs change.',
  ])

const postBody = lexical([
  'This is placeholder copy for a journal post. Replace it from the admin panel with real news, essays or site notes.',
  '## What happened',
  'Use headings, quotes and lists in the editor to give longer posts a clear structure. Images can be added to the gallery and referenced in the text.',
  '> Good buildings are made by many hands.',
  'Thank you to our clients, consultants and contractors for their collaboration.',
])

async function seed() {
  const payload = await getPayload({ config })
  if (process.argv.includes('stories')) {
    payload.logger.info('Seeding success stories and testimonials only…')
    await seedStories(payload, { replace: true })
    payload.logger.info('Done.')
    process.exit(0)
  }

  payload.logger.info('Seeding placeholder content…')

  await clear(payload)

  // Admin user (only if no users exist yet)
  const { totalDocs: userCount } = await payload.count({ collection: 'users' })
  if (userCount === 0) {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
    const password = process.env.SEED_ADMIN_PASSWORD || 'change-me-now'
    await payload.create({ collection: 'users', data: { email, password, name: 'Studio Admin', role: 'admin' } })
    payload.logger.info(`Created admin user ${email} (password from SEED_ADMIN_PASSWORD or the default). Change it after logging in.`)
  }

  payload.logger.info('Projects…')
  for (const p of projects) {
    const { cover, gallery, ...data } = p
    await payload.create({
      collection: 'projects',
      context: ctx(),
      data: {
        ...(data as any),
        cover: await image(payload, cover, `${p.title}, exterior view`),
        gallery: await Promise.all(gallery.map((g, i) => image(payload, g, `${p.title}, view ${i + 2}`))),
        body: projectBody(p.title),
      },
    })
  }

  payload.logger.info('Success stories…')
  await seedStories(payload)

  payload.logger.info('Team…')
  for (const [i, m] of team.entries()) {
    await payload.create({
      collection: 'team',
      context: ctx(),
      data: {
        name: m.name,
        role: m.role,
        order: i,
        photo: await image(payload, m.photo, `Portrait of ${m.name}`),
        bio: `${m.name.split(' ')[0]} brings a calm, rigorous approach to every project. Placeholder bio, edit in the admin.`,
      },
    })
  }

  payload.logger.info('Services…')
  for (const [i, s] of services.entries()) {
    await payload.create({
      collection: 'services',
      context: ctx(),
      data: {
        title: s.title,
        summary: s.summary,
        order: i,
        deliverables: s.deliverables.map((item) => ({ item })),
        image: await image(payload, s.image, s.title),
      },
    })
  }

  payload.logger.info('Journal…')
  for (const p of posts) {
    await payload.create({
      collection: 'posts',
      context: ctx(),
      data: {
        title: p.title,
        excerpt: p.excerpt,
        publishedAt: new Date(Date.now() - p.daysAgo * 86400000).toISOString(),
        cover: await image(payload, p.cover, p.title),
        body: postBody,
      },
    })
  }

  await payload.create({
    collection: 'jobs',
    context: ctx(),
    data: {
      title: 'Project Architect',
      location: 'Studio, hybrid',
      type: 'full-time',
      description:
        'We are looking for a registered architect with 5+ years of experience to lead residential and small civic projects from concept to completion.\n\nPlaceholder listing, edit or close it in the admin.',
    },
  })

  payload.logger.info('Site settings…')
  await payload.updateGlobal({
    slug: 'site-settings',
    context: ctx(),
    data: {
      heroEyebrow: 'Architecture · Civil Engineering · Interiors',
      heroTitle: 'Quiet buildings,\nmade to last.',
      heroImage: await image(payload, '1600585154526-990dced4db0d', 'Timber house at dusk with warm interior light'),
      intro:
        'Sakura Architects is an architecture and civil engineering studio. We design calm, durable homes, workplaces and public buildings, engineered in-house from the ground up.',
      philosophy: lexical([
        'We believe architecture should be quiet. Not silent, but considered: buildings that sit comfortably in their place, age gracefully, and leave room for the lives lived inside them.',
        'Our name comes from the cherry blossom, a reminder that beauty is found in seasons and in change. We design with natural light, honest materials and careful structure, and we stay with our clients from the first sketch to the final inspection.',
        'Because our architects and engineers share one studio, structure is never an afterthought. It is part of the idea.',
      ]),
      timeline: [
        { year: '2012', text: 'Studio founded by Hana Sato' },
        { year: '2015', text: 'Structural & civil engineering practice joins under Kenji Mori' },
        { year: '2019', text: 'First civic commission: Footbridge at Sato' },
        { year: '2023', text: 'Riverside Library completed' },
      ],
      awards: [
        { year: '2024', title: 'Residential Design Award, Engawa House' },
        { year: '2023', title: 'Civic Architecture Prize, Riverside Library (shortlist)' },
        { year: '2021', title: 'Engineering Excellence Award, Footbridge at Sato' },
      ],
      email: 'hello@example.com',
      phone: '+00 000 000 0000',
      address: '12 Cherry Blossom Lane\nYour City 00000',
      hours: 'Mon – Fri, 9:00 – 18:00',
      socials: [
        { platform: 'instagram', url: 'https://instagram.com/' },
        { platform: 'linkedin', url: 'https://linkedin.com/' },
      ],
    },
  })

  payload.logger.info('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
