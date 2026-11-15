import { headers } from 'next/headers'

// Simple in-memory limiter. On serverless each instance has its own memory, so this slows bursts
// rather than enforcing a hard global limit. Use a shared store (e.g. Redis) for strict limits.
const buckets = new Map<string, number[]>()

export async function clientIp() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

/** Returns true when `key` exceeded `max` hits within `windowMs`. */
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  buckets.set(key, recent)
  return recent.length > max
}
