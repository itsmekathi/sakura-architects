import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

type PathsFor = (doc: any) => string[]

function safeRevalidate(paths: string[], logger?: { info: (msg: string) => void }) {
  for (const path of new Set(paths)) {
    try {
      // A dynamic pattern like "/projects/[slug]" revalidates every page of that route.
      if (path.includes('[')) revalidatePath(path, 'page')
      else revalidatePath(path)
      logger?.info(`revalidated ${path}`)
    } catch {
      // Outside a Next.js request (e.g. the seed script) there is nothing to revalidate.
    }
  }
}

/** Builds afterChange / afterDelete hooks that revalidate the public pages showing a collection. */
export function revalidateCollection(pathsFor: PathsFor) {
  const afterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
    if (req.context.disableRevalidate) return doc
    safeRevalidate([...pathsFor(doc), ...(previousDoc ? pathsFor(previousDoc) : [])], req.payload.logger)
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
    if (req.context.disableRevalidate) return doc
    safeRevalidate(pathsFor(doc), req.payload.logger)
    return doc
  }
  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}

export const revalidateEverything: GlobalAfterChangeHook = ({ doc, req }) => {
  if (req.context.disableRevalidate) return doc
  try {
    revalidatePath('/', 'layout')
  } catch {}
  return doc
}
