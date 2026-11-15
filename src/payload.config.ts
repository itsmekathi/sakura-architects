import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Team } from './collections/Team'
import { Services } from './collections/Services'
import { Posts } from './collections/Posts'
import { Jobs } from './collections/Jobs'
import { Inquiries } from './collections/Inquiries'
import { Stories } from './collections/Stories'
import { Testimonials } from './collections/Testimonials'
import { SiteSettings } from './globals/SiteSettings'
import { SITE_URL } from './lib/site-url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// With SMTP_HOST set, emails go out over SMTP. Without it, Payload logs them to the console.
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'studio@example.com',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'Sakura Architects',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined

// Database: SQLite file locally; Postgres (e.g. Neon on Vercel) when the URL is a postgres:// one.
// Postgres never auto-pushes schema: changes ship as migrations (src/migrations), run by `payload migrate`.
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
const db = /^postgres(ql)?:\/\//.test(databaseUrl)
  ? postgresAdapter({
      pool: { connectionString: databaseUrl },
      push: false,
      migrationDir: path.resolve(dirname, 'migrations'),
    })
  : sqliteAdapter({ client: { url: databaseUrl } })

export default buildConfig({
  serverURL: SITE_URL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Sakura Architects', icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }] },
    components: {
      graphics: {
        Logo: '/components/admin/AdminBrand#AdminLogo',
        Icon: '/components/admin/AdminBrand#AdminIcon',
      },
    },
  },
  collections: [Inquiries, Projects, Stories, Testimonials, Posts, Services, Team, Jobs, Media, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  email,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  sharp,
  plugins: [
    // Uploads go to Vercel Blob when its token is present (Vercel sets it); otherwise to ./media on disk.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Media is public: serve files from the Blob CDN instead of proxying through /api/media.
      collections: { media: { disablePayloadAccessControl: true } },
      // Browser uploads straight to Blob, avoiding Vercel's 4.5 MB request limit on functions.
      clientUploads: true,
    }),
  ],
})
