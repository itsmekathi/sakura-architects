import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[60vh] flex-col justify-center py-24">
      <p className="eyebrow mb-5">404</p>
      <h1 className="max-w-2xl text-4xl md:text-6xl">This page has not been built yet.</h1>
      <Link href="/" className="link-underline mt-10 self-start text-sm tracking-[0.14em] uppercase">
        Return home →
      </Link>
    </section>
  )
}
