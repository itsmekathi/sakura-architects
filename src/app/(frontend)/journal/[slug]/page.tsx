import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { formatDate, getPost, getPosts } from '@/lib/queries'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPosts()).filter((p) => p.slug).map((p) => ({ slug: p.slug! }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}
  const cover = typeof post.cover === 'object' ? post.cover : null
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      images: cover?.url ? [{ url: cover.url, alt: cover.alt }] : undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  return (
    <article className="wrap max-w-4xl pt-12 md:pt-20">
      <Link href="/journal" className="eyebrow link-underline">← Journal</Link>
      <p className="eyebrow mt-10">{formatDate(post.publishedAt)}</p>
      <h1 className="mt-4 text-4xl leading-[1.12] md:text-6xl">{post.title}</h1>
      <p className="mt-8 font-serif text-xl text-ink-soft md:text-2xl">{post.excerpt}</p>
      {post.cover && (
        <div className="relative mt-12 aspect-[16/9] overflow-hidden bg-paper-2">
          <PayloadImage media={post.cover} priority sizes="(min-width: 896px) 896px, 100vw" />
        </div>
      )}
      <RichText data={post.body} className="mx-auto mt-14" />
    </article>
  )
}
