/**
 * Sakura Architects brand mark: a hanko-style seal (the stamp used to sign documents in Japan)
 * with a five-petal cherry blossom cut out of it. The seal keeps the same colours in every theme.
 * Standalone files live in public/brand/ and src/app/icon.svg. Keep them in sync with this geometry.
 */
export const SEAL = '#a8586c'
export const SEAL_PAPER = '#f7f3ee'

const PETAL =
  'M0,-3.2 C-5.4,-5.6 -8.3,-12.2 -5.1,-17.6 C-4.1,-19.3 -2.4,-20.3 -1.2,-19.7 L0,-17.2 L1.2,-19.7 C2.4,-20.3 4.1,-19.3 5.1,-17.6 C8.3,-12.2 5.4,-5.6 0,-3.2 Z'

export function LogoMark({ size = 34, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="4" fill={SEAL} />
      <g transform="translate(24 24.8) rotate(-8) scale(0.86)" fill={SEAL_PAPER}>
        {[0, 72, 144, 216, 288].map((r) => (
          <path key={r} d={PETAL} transform={`rotate(${r})`} />
        ))}
      </g>
    </svg>
  )
}

/** Mark + stacked wordmark ("SAKURA / ARCHITECTS"). Text colours follow the theme. */
export function Logo({ className = '', size = 34 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none whitespace-nowrap">
        <span className="font-serif text-[1.15rem] font-medium tracking-[0.34em] text-ink">SAKURA</span>
        <span className="mt-[0.4rem] text-[0.53rem] font-normal tracking-[0.47em] text-stone">ARCHITECTS</span>
      </span>
    </span>
  )
}
