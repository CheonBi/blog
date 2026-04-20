import {getAllPosts} from '@/utils/Post'
import {getPostRawBySlug} from '@/utils/postsRaw'

export const dynamic = 'error'

export async function generateStaticParams() {
  const posts = await getAllPosts('en')
  return posts.map(({fields: {slug}}) => {
    const [year, ...slugs] = slug.split('/')
    return {year, slug: slugs}
  })
}

export async function GET(
  _req: Request,
  {params}: {params: Promise<{year: string; slug: string[]}>},
) {
  const {year, slug} = await params
  const raw = getPostRawBySlug(year, slug, 'en')
  if (!raw) {
    return new Response('Not Found', {status: 404})
  }
  return new Response(raw, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  })
}
