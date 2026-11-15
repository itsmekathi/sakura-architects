import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/SectionHeading'
import { PayloadImage } from '@/components/PayloadImage'
import { formatDate, getPosts } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'News, essays and site notes from Sakura Architects.',
}

export default async function JournalPage() {
  const posts = await getPosts()
  return (
    <>
      <PageHeader eyebrow="Journal" title="Notes from the studio" />
      <section className="wrap">
        {posts.length === 0 && <p className="text-stone">Nothing published yet.</p>}
        <ul>
          {posts.map((post) => (
            <li key={post.id} className="reveal border-t border-line">
              <Link href={`/journal/${post.slug}`} className="group grid gap-6 py-10 md:grid-cols-12 md:items-center">
                <p className="eyebrow md:col-span-2">{formatDate(post.publishedAt)}</p>
                <div className="md:col-span-6">
                  <h2 className="text-2xl transition-colors group-hover:text-sakura-ink md:text-3xl">{post.title}</h2>
                  <p className="mt-3 text-ink-soft">{post.excerpt}</p>
                </div>
                <div className="relative aspect-[3/2] overflow-hidden bg-paper-2 md:col-span-3 md:col-start-10">
                  <PayloadImage media={post.cover} sizes="(min-width: 768px) 25vw, 100vw" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
