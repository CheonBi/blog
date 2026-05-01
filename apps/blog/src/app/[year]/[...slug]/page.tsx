import {cacheLife, cacheTag} from 'next/cache'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import Script from 'next/script'
import {ViewTransition} from 'react'

import {parseTitleEmphasis, stripTitleEmphasis} from '@yceffort/shared/utils'
import {format} from 'date-fns'
import {MDXRemote} from 'next-mdx-remote-client/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import prism from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkToc from 'remark-toc'

import MathLoader from '@/components/layouts/Post/math'
import MDXComponents from '@/components/MDXComponents'
import ProfileImage from '@/components/ProfileImage'
import SeriesNavigation from '@/components/SeriesNavigation'
import TableOfContents from '@/components/TableOfContents'
import Tag from '@/components/Tag'
import {SiteConfig} from '@/config'
import imageMetadataPlugin from '@/utils/imageMetadata'
import {extractCodeFilename, parseCodeSnippet} from '@/utils/Markdown'
import {buildOgImageUrl} from '@/utils/og'
import {
  findPostByYearAndSlug,
  getFeaturedSlugs,
  getSeriesPosts,
} from '@/utils/Post'

export async function generateMetadata(props: {
  params: Promise<{year: string; slug: string[]}>
}) {
  const params = await props.params

  const {year, slug} = params

  const post = await findPostByYearAndSlug(year, slug)

  if (!post) {
    return {}
  }

  const enPost = await findPostByYearAndSlug(year, slug, 'en')
  const plainTitle = stripTitleEmphasis(post.frontMatter.title)

  return {
    title: plainTitle,
    description: post.frontMatter.description,
    openGraph: {
      title: plainTitle,
      description: post.frontMatter.description,
      url: `${SiteConfig.url}/${post.fields.slug}`,
      images: [
        {
          url: buildOgImageUrl({
            title: plainTitle,
            description: post.frontMatter.description,
            tags: post.frontMatter.tags,
            path: '/' + post.fields.slug,
            thumbnail: post.frontMatter.thumbnail,
          }),
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: plainTitle,
      description: post.frontMatter.description,
    },
    alternates: {
      canonical: `${SiteConfig.url}/${post.fields.slug}`,
      ...(enPost && {
        languages: {
          en: `${SiteConfig.url}/en/${post.fields.slug}`,
        },
      }),
      types: {
        'text/markdown': `${SiteConfig.url}/${post.fields.slug}.md`,
      },
    },
  }
}

export async function generateStaticParams() {
  const slugs = await getFeaturedSlugs('ko')
  return slugs.map((slug) => {
    const [year, ...rest] = slug.split('/')
    return {year, slug: rest}
  })
}

export default async function Page(props: {
  params: Promise<{year: string; slug: string[]}>
}) {
  const params = await props.params
  const {year, slug} = params

  const post = await findPostByYearAndSlug(year, slug)
  if (!post) {
    return notFound()
  }

  return <PostBody year={year} slug={slug} />
}

async function PostBody({year, slug}: {year: string; slug: string[]}) {
  'use cache'
  cacheLife('max')
  cacheTag(`post:ko/${year}/${slug.join('/')}`)

  const post = await findPostByYearAndSlug(year, slug)
  if (!post) {
    return null
  }

  const {
    frontMatter: {title, tags, date, description, series},
    body,
    path,
    fields: {slug: postSlug},
    readingTime,
  } = post

  const seriesPosts = series ? await getSeriesPosts(series) : []

  const updatedAt = format(new Date(date), 'yyyy-MM-dd')
  const transitionName = `post-${postSlug.replace(/\//g, '-')}`
  const plainTitle = stripTitleEmphasis(title)
  const link = `https://github.com/yceffort/yceffort-blog-v2/issues/new?labels=%F0%9F%92%AC%20Discussion&title=[Discussion] issue on ${plainTitle}&assignees=yceffort&body=${SiteConfig.url}/${slug}`

  const thumbnail = post.frontMatter.thumbnail
  const ogImageUrl = buildOgImageUrl({
    title: plainTitle,
    description,
    tags,
    path: '/' + postSlug,
    thumbnail,
  })

  const postYear = new Date(date).getFullYear()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: plainTitle,
    datePublished: new Date(date).toISOString(),
    dateModified: new Date(date).toISOString(),
    description,
    image: `${SiteConfig.url}${ogImageUrl}`,
    url: `${SiteConfig.url}/${postSlug}`,
    author: {
      '@type': 'Person',
      name: SiteConfig.author.name,
    },
  }

  const titleParts = parseTitleEmphasis(title)

  return (
    <>
      <Script
        id={`jsonld-${postSlug.replace(/\//g, '-')}`}
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <MathLoader />
      <div className="page-view relative">
        <Link href="/" className="post-back">
          <span className="dot">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M15 18 9 12l6-6" />
            </svg>
          </span>
          BACK TO INDEX
        </Link>

        <section className="post-masthead">
          <div className="post-eyebrow">
            ◆ {series ? `SERIES · ${series}` : 'ESSAY'}
          </div>
          <ViewTransition name={transitionName}>
            <h1 className="post-title">
              {titleParts.map((part, i) =>
                part.emphasis ? <em key={i}>{part.text}</em> : part.text,
              )}
            </h1>
          </ViewTransition>
          <div className="post-meta-row">
            <div className="post-author">
              <ProfileImage
                size={36}
                transitionName={`${transitionName}-avatar`}
              />
              <div>
                <div className="nm">{SiteConfig.author.name}</div>
                <div className="sub">
                  {updatedAt} · {readingTime}분
                </div>
              </div>
            </div>
            <div className="post-stats">
              <div>
                <b>{readingTime}</b>min
              </div>
              <div>
                <b>{postYear}</b>year
              </div>
              <div>
                <b>KO</b>original
              </div>
            </div>
          </div>
          {tags && (
            <ViewTransition name={`${transitionName}-tags`}>
              <div className="post-tags-row">
                {tags.slice(0, 5).map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
            </ViewTransition>
          )}
        </section>

        {series && seriesPosts.length > 1 && (
          <SeriesNavigation
            seriesName={series}
            seriesPosts={seriesPosts}
            currentSlug={postSlug}
          />
        )}

        <div className="post-layout">
          <article className="post-article prose max-w-none dark:prose-dark">
            <MDXRemote
              source={body}
              components={MDXComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkMath, remarkToc, remarkGfm],
                  rehypePlugins: [
                    rehypeKatex,
                    rehypeSlug,
                    extractCodeFilename,
                    [prism, {showLineNumbers: true}],
                    parseCodeSnippet,
                    rehypeAutolinkHeadings,
                    [imageMetadataPlugin, {path}],
                  ],
                },
              }}
            />
          </article>
        </div>

        <footer className="post-footer">
          <Link href="/">&larr; Back to the blog</Link>
          <Link href={link} className="issue">
            Issue on GitHub →
          </Link>
        </footer>
      </div>
      <TableOfContents />
    </>
  )
}
