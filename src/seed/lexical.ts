/**
 * Minimal helper to turn plain text into Lexical rich-text JSON for seeding.
 * Lines starting with "## " become h2 headings, "> " become quotes, everything else a paragraph.
 */
const text = (t: string) => ({ type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })

const block = (type: string, t: string, extra: Record<string, unknown> = {}) => ({
  type,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [text(t)],
  ...extra,
})

export function lexical(blocks: string[]): any {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: blocks.map((b) => {
        if (b.startsWith('## ')) return block('heading', b.slice(3), { tag: 'h2' })
        if (b.startsWith('> ')) return block('quote', b.slice(2))
        return block('paragraph', b, { textFormat: 0, textStyle: '' })
      }),
    },
  }
}
