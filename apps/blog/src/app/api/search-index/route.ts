import {NextResponse} from 'next/server'

import {stripTitleEmphasis} from '@yceffort/shared/utils'

import type {Locale} from '@/utils/postPaths'

import {getAllPosts} from '@/utils/Post'

const norm = (s: string) => s.normalize('NFC')

function stripInline(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~>#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 본문에서 검색용 발췌(모든 헤딩 + 첫 문단)를 추출한다. 전체 본문은 gzip ~1.4MB라
// 클라이언트로 보내기엔 무거워, 본문에만 등장하는 용어를 살리는 최소 발췌만 인덱싱한다.
function buildSearchText(body: string): string {
  const headings: string[] = []
  const paragraph: string[] = []
  let inFence = false
  let paragraphDone = false

  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inFence = !inFence
      continue
    }
    if (inFence) {
      continue
    }
    if (/^#{1,6}\s/.test(line)) {
      headings.push(line.replace(/^#+\s*/, ''))
      continue
    }
    if (paragraphDone) {
      continue
    }
    if (line) {
      paragraph.push(line)
    } else if (paragraph.length > 0) {
      paragraphDone = true
    }
  }

  const headingText = stripInline(headings.join(' '))
  const paragraphText = stripInline(paragraph.join(' ')).slice(0, 400)
  return `${headingText} ${paragraphText}`.trim()
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url)
  const locale: Locale = searchParams.get('locale') === 'en' ? 'en' : 'ko'

  try {
    const posts = await getAllPosts(locale)
    const index = posts
      .filter((p) => p.frontMatter.published)
      .map((p) => ({
        slug: p.fields.slug,
        title: norm(stripTitleEmphasis(p.frontMatter.title)),
        description: norm(p.frontMatter.description ?? ''),
        tags: p.frontMatter.tags,
        body: norm(buildSearchText(p.body)),
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
