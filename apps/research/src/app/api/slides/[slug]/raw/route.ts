import {getAllSlides, getSlideBySlug} from '@/lib/slidesIndex'

export const dynamic = 'error'

export function generateStaticParams() {
  return getAllSlides().map(({slug}) => ({slug}))
}

export async function GET(
  _req: Request,
  {params}: {params: Promise<{slug: string}>},
) {
  const {slug} = await params
  const entry = getSlideBySlug(slug)
  if (!entry) {
    return new Response('Not Found', {status: 404})
  }

  return new Response(entry.markdown, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  })
}
