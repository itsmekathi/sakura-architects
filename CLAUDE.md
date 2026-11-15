# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Website + CMS for Sakura Architects (an architecture / civil engineering studio). A single **Next.js 16 (App Router, Turbopack) + Payload CMS 3** app on **SQLite** (`sakura.db`, gitignored), styled with **Tailwind v4**. Staff use `/admin` to publish content and to reply to contact-form enquiries.

Next.js 16 has breaking changes vs. older versions (e.g. `params` is a `Promise`). Per `AGENTS.md`, check `node_modules/next/dist/docs/` before relying on remembered Next.js APIs.

## Commands

```bash
npm run dev                 # http://localhost:3000, admin at /admin
npm run build               # also type-checks (includes tests/), so test typing errors fail the build
npm run typecheck           # tsc --noEmit
npm run lint
npm run generate:types      # REQUIRED after any collection/global field change → src/payload-types.ts
npm run generate:importmap  # only needed if custom admin components are added
npm run seed                # wipes + recreates all content collections and media (keeps users & inquiries)
npm run seed -- stories     # recreates only stories + testimonials (non-destructive to other content)

npm run test:int                                                       # vitest, tests/int/**/*.int.spec.ts
npx vitest run --config ./vitest.config.mts tests/int/api.int.spec.ts -t "records a reply"   # single test
npm run test:e2e            # Playwright (tests/e2e); expects the site running on :3000
```

Gotchas:
- **Integration tests use the real `sakura.db`** (no separate test DB). They create and clean up their own inquiries.
- **Don't run `npm run build` while `npm run dev` is running.** Both write `.next/`, and the dev server starts throwing errors afterwards. Stop dev first; if it's already broken, `rm -rf .next` and restart.
- The seed runs through `tsx`, not `payload run`, because `payload run` silently does nothing here. In dev, Payload auto-pushes schema changes to SQLite. Running the seed right after a schema change while dev is pushing the same change can fail with `SQLITE_ERROR`; just re-run it.
- With no `SMTP_HOST`, Payload logs emails to the console instead of sending ("Email attempted without being configured…"). That's the expected local behaviour.
- Node engine warnings (`EBADENGINE`, wants ≥24.22) are noise on the current machine; everything works.

## Architecture

**Two root layouts via route groups.** `src/app/(frontend)/` is the public site, with its own `<html>`, fonts, `globals.css`, Header and Footer. `src/app/(payload)/` is Payload's admin + REST/GraphQL API: generated files, don't edit. Tailwind is only imported in the frontend layout, so it never touches the admin. `robots.ts` lives at `src/app/robots.ts` because a metadata route inside the route group returned 404. `sitemap.ts` works inside `(frontend)`.

**Data flow (public site).** Pages are async server components that read through `src/lib/queries.ts`. Every query there uses Payload's Local API with `overrideAccess: false`, so the public site sees exactly what the collection `access.read` rules allow an anonymous user to see. Scheduled posts and stories (`publishedAt` in the future) and closed jobs (`open: false`) are hidden purely by those access rules, not by page code. Pages are statically generated (`generateStaticParams` for slugs).

**Revalidation instead of rebuilds.** Collections register `hooks: revalidateCollection(doc => [paths])` from `src/lib/revalidate.ts`, which calls `revalidatePath` on change or delete. A path containing `[` (e.g. `/projects/[slug]`) revalidates every page of that route. Globals use `revalidateEverything`. Hooks skip work when `req.context.disableRevalidate` is set (the seed sets it), and swallow errors outside a Next request. **When adding a collection that appears on a page, add its paths here.**

**Collections** (`src/collections/`, registered in `src/payload.config.ts`, admin groups Inbox / Content / Admin):
- `Inquiries`: created only by the contact-form server action (`src/app/(frontend)/contact/actions.ts`: zod validation, honeypot `company` field, in-memory per-IP rate limit). Staff reply by typing in `replyMessage` and saving. A `beforeChange` hook sends the email *before* saving (a send failure aborts the save), appends to the `replies` array, clears `replyMessage` and sets `status: 'replied'`. `afterChange` on create emails the studio (`STUDIO_INBOX_EMAIL` or the email in SiteSettings). Email templates are in `src/lib/email.ts`.
- `Stories` (case studies) and `Testimonials` both relate optionally to `Projects`. Project detail pages pull linked feedback via `getProjectFeedback`. A story's cover falls back to its project's cover (`storyCover` in `components/Testimonial.tsx`).
- `Users` have `role` admin/editor (saved to the JWT). The first user ever created is forced to admin. Access helpers are in `src/access.ts`.
- `SiteSettings` global holds the hero, studio philosophy/timeline/awards, contact details and socials.
- Slugs come from `slugField()` in `src/fields/slug.ts` (auto-generated from the title).

**Client/server boundary.** Client components (`Header`, `ProjectGrid`, `ContactForm`) must not import from `src/collections/*`, because that pulls Payload/`next/cache` server code into the bundle. Shared option lists (project categories, project types, budgets) live in `src/lib/constants.ts` and are imported by both collections and UI.

**Images.** Always render Payload media through `components/PayloadImage.tsx` (`next/image` with `fill`, so the parent must be positioned and sized, e.g. `relative aspect-[4/3]`). Because `serverURL` is set, Payload returns absolute media URLs; PayloadImage strips the origin so they match `images.localPatterns` (`/api/media/file/**`) in `next.config.ts`.

**Rich text** is Lexical. Render it with `components/RichText.tsx` (adds the `.prose-sakura` styles). The seed builds Lexical JSON with `src/seed/lexical.ts` (`## ` → h2, `> ` → quote).

## Design system

Tokens are CSS variables in `src/app/(frontend)/globals.css`, mapped into Tailwind via `@theme inline`: `paper`, `paper-2`, `ink`, `ink-soft`, `stone`, `line`, `sakura` (decorative accent, too low-contrast for text), `sakura-ink` (accent for text). Theming: `<html data-theme="light|dark">` forces a theme, and no attribute means "System", which follows `prefers-color-scheme` live. The dark tokens are therefore defined twice in `globals.css` (inside the media query with `:root:not([data-theme='light'])`, and as `:root[data-theme='dark']`) and must be kept in sync. `components/ThemeToggle.tsx` saves the choice to localStorage (`sakura-theme`). `themeInitScript` (`components/theme.ts`, inlined in the layout `<head>`) applies it before first paint, which is why `<html>` has `suppressHydrationWarning`. Always use the token classes rather than raw colours so every theme works. Custom utilities: `wrap` (page container), `eyebrow` (small uppercase label), `link-underline`. Fonts: Shippori Mincho (`font-serif`, headings) and Inter (`font-sans`). `.reveal` is a CSS scroll-driven fade-in, so full-page screenshots leave below-the-fold `.reveal` elements invisible. Inject `.reveal{animation:none!important}` when capturing.

## Local vs. Vercel backends

`src/payload.config.ts` picks backends from the environment:
- A `postgres://` `DATABASE_URL`/`POSTGRES_URL` selects `postgresAdapter` (Neon on Vercel). Anything else selects SQLite.
- `BLOB_READ_WRITE_TOKEN` enables `vercelBlobStorage` for `media`, with `clientUploads` and direct CDN URLs (allowed in `next.config.ts` `remotePatterns`). Without it, files go to `./media`.
- `src/lib/site-url.ts` resolves the public URL (`NEXT_PUBLIC_SERVER_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`, then localhost).

Postgres runs with `push: false`, so **schema changes need a migration**: after editing fields run `npm run generate:types` and `npm run migrate:create <name>`, then commit `src/migrations/*`. This script injects a placeholder Postgres URL and needs no database. Vercel's `vercel-build` script runs `payload migrate` before `next build`. Locally SQLite still auto-pushes in dev.

The admin import map must include the Blob client-upload handler even though it's disabled locally. The `generate:importmap` script therefore injects a placeholder token, which must match `vercel_blob_rw_<id>_<rand>`. Always regenerate through the npm script, never with a bare `payload generate:importmap`.

`npm run seed:vercel` seeds the hosted DB/Blob from `.env.vercel` (gitignored). `--env-file` values take precedence over `.env`. The frontend layout sets `revalidate = 3600` as a safety net (e.g. for content scheduled with a future `publishedAt`).

## Environment

See `.env.example`: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL` (used for sitemap, OG and email links), the `SMTP_*` / `EMAIL_FROM_*` settings, `STUDIO_INBOX_EMAIL`, and `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. The seed creates `admin@example.com` / `change-me-now` only if no users exist. The README has the deployment notes (Postgres adapter + object storage for serverless, `payload migrate` in production).

## Tooling note

In this Windows/Git Bash environment, Bash heredocs containing apostrophes have failed to parse. Prefer the Write/Edit tools for file content.
