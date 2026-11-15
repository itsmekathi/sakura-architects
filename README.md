# Sakura Architects

Website and CMS for Sakura Architects, built with **Next.js 16 + Payload CMS 3** in a single app.

- **Public site** (`/`): static pages for Home, Projects, Success stories, Studio, Services, Journal, Careers, Contact and Privacy.
- **Admin** (`/admin`): staff publish content and answer contact-form enquiries.

## Quick start

```bash
cp .env.example .env      # then set PAYLOAD_SECRET to a long random string
npm install
npm run seed              # placeholder projects, team, services, posts + an admin user
npm run dev               # http://localhost:3000, admin at /admin
```

The seed creates `admin@example.com` / `change-me-now` (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) **only if no users exist**. Change the password after the first login.
Re-running `npm run seed` replaces projects, team, services, posts, jobs and media. It does not touch users or enquiries.

## Managing content

| Admin section | Shows up on |
|---|---|
| Inbox → Inquiries | Contact form submissions (staff only) |
| Content → Projects | `/projects`, `/projects/[slug]`, featured ones on `/` |
| Content → Success stories | `/stories`, `/stories/[slug]`. Link a project to show "Read the full story" on its page |
| Content → Testimonials | Client feedback wall on `/stories`, plus on the linked project page |
| Content → Journal | `/journal`, latest 3 on `/`. Posts with a future date stay hidden until then |
| Content → Services | `/services` and the home page list |
| Content → Team | `/studio` |
| Content → Careers | `/careers` (untick **Open** to hide a role) |
| Admin → Site settings | Hero text and image, studio philosophy, timeline, awards, contact details, socials |

Saving in the admin revalidates the affected pages immediately, so there's no rebuild needed.

### Replying to enquiries

1. Open **Inbox → Inquiries** and select the message.
2. Type into **Compose reply** and click **Save**.
3. The reply is emailed to the visitor (with their original message quoted), added to the **Reply thread**, and the status changes to **Replied**.

New enquiries also send a notification to `STUDIO_INBOX_EMAIL` (or the email in Site settings).
Without `SMTP_HOST` configured, emails are **logged to the server console** instead of sent, which is handy locally.

### Roles

The first user is an **admin**. Admins can manage users and delete enquiries. **Editors** can do everything else.

## Project layout

```
src/
  app/(frontend)/   public pages, contact server action, sitemap
  app/(payload)/    Payload admin + REST/GraphQL API (generated, do not edit)
  collections/      Projects, Posts, Services, Team, Jobs, Inquiries, Media, Users
  globals/          SiteSettings
  components/       Header, Footer, ProjectCard/Grid, ContactForm, PayloadImage, RichText
  lib/              queries (Local API reads), email templates, revalidation, constants
  seed/             placeholder content
```

Design tokens (washi paper, sumi ink, stone, sakura accent, plus dark mode) live in `src/app/(frontend)/globals.css`.
Fonts are Shippori Mincho (headings) and Inter (body).

**Brand:** the logo is a hanko-style seal (deep rose `#a8586c`) with a cherry blossom cut out, next to a stacked SAKURA / ARCHITECTS wordmark. It is drawn in code in `src/components/Logo.tsx`. Ready-made files for print, social and email signatures are in `public/brand/` (`sakura-mark.svg`, `sakura-mark-512.png`, `sakura-logo.png`). The browser icon (`src/app/icon.svg`), phone home-screen icon (`src/app/apple-icon.png`) and link-preview image (`src/app/(frontend)/opengraph-image.png`) use the same mark, and the admin panel shows it too.

## Scripts

| Script | |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run seed` | Load placeholder content (replaces content) |
| `npm run seed -- stories` | Re-create only success stories + testimonials |
| `npm run seed:vercel` | Seed the hosted site using credentials in `.env.vercel` |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after changing collections |
| `npm run migrate:create <name>` | Create a Postgres migration after changing collections (no database needed) |
| `npm run generate:importmap` | Regenerate the admin import map (needed after adding admin components or plugins) |
| `npm run test:int` | Integration tests (inquiry access + reply flow) |
| `npm run typecheck` | TypeScript |

## Deploying (Vercel + Neon Postgres + Vercel Blob)

The app picks its backends from the environment, so the same code runs locally and on Vercel:

| | Local | Vercel |
|---|---|---|
| Database | SQLite file (`DATABASE_URL=file:./sakura.db`) | Neon Postgres (any `postgres://` `DATABASE_URL` or `POSTGRES_URL`) |
| Uploads | `./media` on disk | Vercel Blob (when `BLOB_READ_WRITE_TOKEN` is set) |
| Site URL | `http://localhost:3000` | `NEXT_PUBLIC_SERVER_URL`, else the Vercel production domain automatically |

On Vercel the `vercel-build` script runs `payload migrate` (applies `src/migrations`) before `next build`.

> **Licence note:** Vercel's free Hobby plan is for personal / non-commercial use. It is fine for a preview of the site, but a live business site needs Vercel Pro (or another host).

### 1. Push the code to GitHub
Create an empty **private** repository on github.com (no README), then:
```bash
git add -A
git commit -m "Initial Sakura Architects site"
git branch -M main
git remote add origin https://github.com/<your-user>/sakura-architects.git
git push -u origin main
```

### 2. Create the Vercel project
1. Sign up at vercel.com with GitHub (Hobby plan).
2. **Add New… → Project**, import the repository. Leave the framework (Next.js) and build settings as detected.
3. Under **Environment Variables** add `PAYLOAD_SECRET`, a long random string. Generate one with
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Keep a copy for step 4.
4. Click **Deploy**. **This first build fails** (there's no database yet). That's expected.

### 3. Add the database and file storage
In the project: **Storage** tab:
1. **Create Database → Neon** (Postgres). Pick a region near your visitors and connect it to the project for all environments. This adds `DATABASE_URL` and related variables.
2. **Create → Blob**, connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`.
3. **Deployments → ⋯ on the latest → Redeploy.** The build now creates the tables and goes live at `https://<project>.vercel.app`.

### 4. Load content
Either open `https://<project>.vercel.app/admin` and create your account (the first user becomes admin), **or** load the placeholder content from your computer:
1. Create a file `.env.vercel` in the project folder (it's gitignored) with:
   ```
   DATABASE_URL=<from Vercel → Settings → Environment Variables, or the Neon dashboard>
   BLOB_READ_WRITE_TOKEN=<from Storage → your Blob store>
   PAYLOAD_SECRET=<the same value as on Vercel>
   SEED_ADMIN_EMAIL=you@yourdomain.com
   SEED_ADMIN_PASSWORD=<a strong password>
   ```
   (`npx vercel env pull .env.vercel --environment=production` can fill most of it automatically.)
2. `npm run seed:vercel`. **This replaces all content on the live site**, so only use it for the first setup. `npm run seed:vercel -- stories` only replaces stories and testimonials.
3. **Redeploy** once more so the static pages are rebuilt with the content. Edits made in the admin after that show up straight away.

### 5. Address
The free address is `https://<project>.vercel.app`. To change it, go to **Settings → Domains** and edit it to e.g. `sakura-architects.vercel.app` if it's free. For a real domain (e.g. `sakuraarchitects.com`, roughly the price of a year's registration), buy it from any registrar, add it in **Settings → Domains** and follow the DNS instructions shown. HTTPS is automatic.

### Day-to-day
- `git push` to `main` → Vercel builds and deploys automatically.
- After changing collection fields: `npm run generate:types`, then `npm run migrate:create <name>`, commit the new file in `src/migrations`, and push. The deploy applies it.
- Email: add the `SMTP_*`, `EMAIL_FROM_*` and `STUDIO_INBOX_EMAIL` variables in Vercel (any SMTP provider: Resend, Postmark, SES, Gmail…) and redeploy.
- Neon's free tier suspends the database after a few idle minutes, so the first admin request after a quiet period is a little slower. Public pages are served from Vercel's cache and aren't affected.
- The contact form's rate limiter is in-memory, so on serverless it only slows down bursts from the same instance. The honeypot still filters most bots.

Self-hosting on a single server (VPS, Railway, Fly.io) also works with the local setup: SQLite plus `/media`, both on a persistent volume.

## Before launch

- Replace placeholder images (Unsplash), copy, team, address and phone.
- Review the privacy page text for your jurisdiction.
- Once you add a custom domain, set `NEXT_PUBLIC_SERVER_URL` to it (used for the sitemap, Open Graph and email links).
