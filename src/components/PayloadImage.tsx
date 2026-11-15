import Image from 'next/image'
import type { Media } from '@/payload-types'

type Props = {
  media?: number | Media | null
  /** Responsive `sizes` hint, e.g. "(min-width: 768px) 50vw, 100vw". */
  sizes?: string
  priority?: boolean
  className?: string
}

/**
 * Renders a Payload media doc filling its (positioned, sized) parent, honouring the focal point.
 * Falls back to a soft paper block when the image is missing.
 */
export function PayloadImage({ media, sizes = '100vw', priority, className = '' }: Props) {
  if (!media || typeof media !== 'object' || !media.url) {
    return <div aria-hidden className={`absolute inset-0 bg-paper-2 ${className}`} />
  }
  // Payload returns absolute URLs when serverURL is set; make same-site ones relative for next/image.
  const src = media.url.replace(/^https?:\/\/[^/]+(?=\/api\/media\/)/, '')
  return (
    <Image
      src={src}
      alt={media.alt ?? ''}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      style={{ objectPosition: `${media.focalX ?? 50}% ${media.focalY ?? 50}%` }}
    />
  )
}
