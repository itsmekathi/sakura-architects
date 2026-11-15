/** Placeholder mark: five petals around a point. Swap for the real logo when available. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true">
        <g transform="translate(20 20)">
          {[0, 72, 144, 216, 288].map((r) => (
            <path
              key={r}
              transform={`rotate(${r})`}
              d="M0 -2 C -5 -6 -6 -13 -2 -17 L 0 -15 L 2 -17 C 6 -13 5 -6 0 -2 Z"
              fill="var(--sakura)"
            />
          ))}
          <circle r="1.6" fill="var(--ink)" />
        </g>
      </svg>
      <span className="font-serif text-[1.15rem] tracking-[0.08em] whitespace-nowrap">
        Sakura <span className="text-stone">Architects</span>
      </span>
    </span>
  )
}
