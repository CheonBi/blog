import {SiteConfig} from '@/config'
import {getAllPosts} from '@/utils/Post'
import {getPostRawBySlug} from '@/utils/postsRaw'

export const dynamic = 'error'

export async function GET() {
  const posts = await getAllPosts('ko')

  const parts: string[] = []
  parts.push(`# ${SiteConfig.title}`)
  parts.push('')
  parts.push(`> Full markdown of every published post (Korean).`)
  parts.push('')

  for (const post of posts) {
    const [year, ...rest] = post.fields.slug.split('/')
    const raw = getPostRawBySlug(year, rest, 'ko')
    if (!raw) {
      continue
    }
    parts.push('---')
    parts.push('')
    parts.push(`Source: ${SiteConfig.url}/${post.fields.slug}.md`)
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
