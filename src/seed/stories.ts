import type { Payload } from 'payload'
import { lexical } from './lexical'

// A fresh object per call: Payload uses the passed context object as-is, and the cloud-storage plugin
// stores per-upload state on it. A shared object made every upload after the first one silently skip Blob.
const ctx = () => ({ disableRevalidate: true })

const stories = [
  {
    title: 'A home that grew with the family',
    project: 'engawa-house',
    client: 'The Ito family',
    featured: true,
    daysAgo: 20,
    excerpt:
      'Three generations, one sloping plot and a tight budget. How a deep timber veranda became the heart of the Ito family home.',
    outcomes: [
      { value: '14 mo', label: 'Brief to move-in' },
      { value: '−45%', label: 'Heating energy vs. old home' },
      { value: '3', label: 'Generations under one roof' },
      { value: '0', label: 'Budget overruns' },
    ],
    quote: {
      text: 'They listened to every one of us, from our daughter to my mother, and somehow designed a house that feels like it was always ours.',
      author: 'Yuki Ito, homeowner',
    },
    body: [
      '## The challenge',
      'The Itos had outgrown their apartment and bought a steep, north-facing plot that two other firms had called unbuildable within their budget. They needed room for grandparents, children and a home office, without the house feeling crowded.',
      '## Our approach',
      'Our engineers proposed a lightweight timber frame on just four concrete pad foundations, avoiding costly retaining walls. Architecturally, we turned the house to face the garden and wrapped it in an engawa, a deep veranda that brings winter sun in and keeps summer sun out.',
      '> The veranda is where the family actually lives: breakfast, homework, evening tea.',
      '## The result',
      'The family moved in 14 months after our first meeting, on budget. Heating bills are less than half what they paid in their old apartment, and the grandparents have a ground-floor suite with step-free access to the garden.',
    ],
  },
  {
    title: 'A library the whole town wanted to visit',
    project: 'riverside-library',
    client: 'City Council',
    daysAgo: 60,
    excerpt:
      'An underused riverfront, a community divided over a new building, and a council that wanted a library people would love. Here is how we got there together.',
    outcomes: [
      { value: '3×', label: 'Visitors in year one' },
      { value: '600+', label: 'Residents consulted' },
      { value: 'A+', label: 'Energy rating' },
    ],
    quote: {
      text: 'Sakura ran the most open consultation we have ever had. The building that came out of it is now the most-loved place in town.',
      author: 'Head of Culture, City Council',
    },
    body: [
      '## The challenge',
      'The previous library proposal had stalled amid opposition from residents worried about losing views of the river. The brief: a modern library that would win the community over.',
      '## Our approach',
      'We held six public workshops and walked the site with more than 600 residents. Their main request, keeping the river visible, shaped the design: a single folded roof that steps down toward the water, with reading rooms on terraces open to the view.',
      'Our civil engineering team also redesigned the flood defences as a public promenade, turning a barrier into a place to walk.',
      '## The result',
      'Visitor numbers tripled in the first year compared with the old library. The promenade now hosts a weekend market, and the building achieved an A+ energy rating.',
    ],
  },
  {
    title: 'A workplace that helped a company hire',
    project: 'kura-offices',
    client: 'Kura Holdings',
    daysAgo: 110,
    excerpt:
      'Kura Holdings needed a headquarters that would attract talent back to the office. Natural light, cedar and a rooftop garden did the work.',
    outcomes: [
      { value: '92%', label: 'Staff satisfaction' },
      { value: '−30%', label: 'Embodied carbon vs. typical office' },
      { value: '2 wks', label: 'Ahead of schedule' },
    ],
    quote: {
      text: 'Our people actually want to come in now. Candidates mention the building in interviews.',
      author: 'Director of Operations, Kura Holdings',
    },
    body: [
      '## The challenge',
      'Kura was growing fast but struggling to hire, and staff rarely used their old, dark office. The new headquarters had to be somewhere people would choose to work.',
      '## Our approach',
      'We combined an exposed concrete frame, engineered for flexible open floors, with a screen of vertical cedar fins that controls glare while keeping views open. Every desk is within seven metres of a window, and a planted roof terrace gives every team outdoor space.',
      '## The result',
      'The building was handed over two weeks early. In the first staff survey after the move, 92% said they were satisfied with their workplace, up from 41%.',
    ],
  },
]

const testimonials = [
  {
    quote:
      'From the first site visit to the final handover, the team was patient, precise and honest about costs. We could not have asked for more.',
    name: 'Yuki Ito',
    role: 'Homeowner',
    rating: 5,
    project: 'engawa-house',
  },
  {
    quote:
      'Having architects and engineers in one studio saved us months. Problems were solved at the drawing board, not on site.',
    name: 'Kenta Fujii',
    role: 'Director of Operations, Kura Holdings',
    rating: 5,
    project: 'kura-offices',
  },
  {
    quote: 'They took a tiny budget and a difficult site and gave us forty-two homes our residents are proud of.',
    name: 'Emi Nakamura',
    role: 'Chair, Hikari Housing Co-op',
    rating: 5,
    project: 'courtyard-apartments',
  },
  {
    quote: 'The atelier is calm, full of light and works perfectly for making ceramics. Every detail was thought through.',
    name: 'Haruto Mori',
    role: 'Founder, Studio Mori',
    rating: 5,
    project: 'atelier-interior',
  },
  {
    quote: 'The bridge was delivered on time and within budget, and it has quickly become a local landmark.',
    name: 'Anna Weber',
    role: 'Project Manager, Regional Transport Authority',
    rating: 4,
    project: 'footbridge-at-sato',
  },
  {
    quote: 'Thoughtful, responsive and genuinely collaborative. They made the planning process feel easy.',
    name: 'Sarah Chen',
    role: 'Botanical Trust',
    rating: 5,
    project: 'tea-pavilion',
  },
]

/** (Re)creates success stories and testimonials, linking them to existing projects by slug. */
export async function seedStories(payload: Payload, { replace = false } = {}) {
  if (replace) {
    for (const collection of ['stories', 'testimonials'] as const) {
      await payload.delete({ collection, where: { id: { exists: true } }, context: ctx() })
    }
  }

  const { docs: projectDocs } = await payload.find({ collection: 'projects', limit: 100, depth: 0 })
  const bySlug = new Map(projectDocs.map((p) => [p.slug, p.id]))

  for (const st of stories) {
    await payload.create({
      collection: 'stories',
      context: ctx(),
      data: {
        title: st.title,
        client: st.client,
        featured: st.featured ?? false,
        excerpt: st.excerpt,
        project: bySlug.get(st.project),
        publishedAt: new Date(Date.now() - st.daysAgo * 86400000).toISOString(),
        outcomes: st.outcomes,
        quote: st.quote,
        body: lexical(st.body),
      },
    })
  }

  for (const [i, t] of testimonials.entries()) {
    const { project, ...rest } = t
    await payload.create({
      collection: 'testimonials',
      context: ctx(),
      data: { ...rest, order: i, project: bySlug.get(project) },
    })
  }
}
