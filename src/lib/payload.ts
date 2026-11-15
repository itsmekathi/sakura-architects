import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'

export const getPayloadClient = cache(async () => getPayload({ config }))

export { SITE_URL } from './site-url'
