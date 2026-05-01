import fs from 'fs'
import path from 'path'

import frontMatter from 'front-matter'

import type {FrontMatter} from '@/type'

import {SiteConfig} from '@/config'
import {getAllPostFiles} from '@/utils/postsRaw'

const POST_ROOT = path.join(process.cwd(), 'posts')

export function GET() {
  const files = getAllPostFiles('ko')

  const parts: string[] = []
  parts.push(`# ${SiteConfig.title}`)
  parts.push('')
  parts.push(`> Full markdown of every published post (Korean).`)
  parts.push('')

  const entries = files
    .map((file) => {
      const raw = fs.readFileSync(file, 'utf-8')
      const {attributes} = frontMatter<FrontMatter>(raw)
      const slug = file
        .slice(POST_ROOT.length + 1)
        .replace(/\.mdx?$/, '')
        .replace(/\.en$/, '')
      return {slug, raw, attributes}
    })
    .filter(({attributes}) => attributes.published)
    .sort(
      (a, b) =>
        new Date(b.attributes.date).getTime() -
        new Date(a.attributes.date).getTime(),
    )

  for (const {slug, raw} of entries) {
    parts.push('---')
    parts.push('')
    parts.push(`Source: ${SiteConfig.url}/${slug}.md`)
    parts.push('')
    parts.push(raw.trim())
    parts.push('')
  }

  return new Response(parts.join('\n') + '\n', {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  })
}
