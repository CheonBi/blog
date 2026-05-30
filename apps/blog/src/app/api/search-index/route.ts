import {NextResponse} from 'next/server'

import {stripTitleEmphasis} from '@yceffort/shared/utils'

import type {Locale} from '@/utils/postPaths'

import {getAllPosts} from '@/utils/Post'

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url)
  const locale: Locale = searchParams.get('locale') === 'en' ? 'en' : 'ko'

  try {
    const posts = await getAllPosts(locale)
    const index = posts
      .filter((p) => p.frontMatter.published)
      .map((p) => ({
        slug: p.fields.slug,
        title: stripTitleEmphasis(p.frontMatter.title),
        description: p.frontMatter.description ?? '',
        tags: p.frontMatter.tags,
        date: p.frontMatter.date.slice(0, 10),
      }))

    return NextResponse.json(
      {index},
      {
        headers: {
          'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
        },
      },
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[API/search-index] Error building index:', error)
    return NextResponse.json({index: []}, {status: 500})
  }
}
