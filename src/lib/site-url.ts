/**
 * Public base URL of the site, without a trailing slash.
 * Explicit NEXT_PUBLIC_SERVER_URL wins; on Vercel it falls back to the project's production domain.
 * Kept dependency-free so payload.config.ts can import it.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'http://localhost:3000'
).replace(/\/$/, '')
