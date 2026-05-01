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
import TableOfContents from '@/components/TableOfContents'
import Tag from '@/components/Tag'
import {SiteConfig} from '@/config'
import imageMetadataPlugin from '@/utils/imageMetadata'
import {extractCodeFilename, parseCodeSnippet} from '@/utils/Markdown'
import {buildOgImageUrl} from '@/utils/og'
import {findPostByYearAndSlug, getAllPosts} from '@/utils/Post'

export const dynamic = 'error'

export async function generateMetadata(props: {
  params: Promise<{year: string; slug: string[]}>
}) {
  const params = await props.params
  const {year, slug} = params
  const post = await findPostByYearAndSlug(year, slug, 'en')

  if (!post) {
    return {}
  }

  const plainTitle = stripTitleEmphasis(post.frontMatter.title)

  return {
    title: plainTitle,
    description: post.frontMatter.description,
    openGraph: {
      title: plainTitle,
      description: post.frontMatter.description,
      url: `${SiteConfig.url}/en/${post.fields.slug}`,
      locale: 'en_US',
      images: [
        {
          url: buildOgImageUrl({
            title: plainTitle,
            description: post.frontMatter.description,
            tags: post.frontMatter.tags,
            path: '/en/' + post.fields.slug,
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
      languages: {
        ko: `${SiteConfig.url}/${post.fields.slug}`,
      },
      canonical: `${SiteConfig.url}/en/${post.fields.slug}`,
      types: {
        'text/markdown': `${SiteConfig.url}/en/${post.fields.slug}.md`,
      },
    },
  }
}

export async function generateStaticParams() {
  const allPosts = await getAllPosts('en')
  return allPosts.map(({fields: {slug}}) => {
    const [year, ...slugs] = slug.split('/')
    return {year, slug: slugs}
  })
}

export default async function EnPostPage(props: {
  params: Promise<{year: string; slug: string[]}>
}) {
  const params = await props.params
  const {year, slug} = params
  const post = await findPostByYearAndSlug(year, slug, 'en')

  if (!post) {
    return notFound()
  }

  const {
    frontMatter: {title, tags, date, description},
    body,
    path,
    fields: {slug: postSlug},
    readingTime,
  } = post

  const updatedAt = format(new Date(date), 'yyyy-MM-dd')
  const transitionName = `post-${postSlug.replace(/\//g, '-')}`
  const plainTitle = stripTitleEmphasis(title)

  const thumbnail = post.frontMatter.thumbnail
  const ogImageUrl = buildOgImageUrl({
    title: plainTitle,
    description,
    tags,
    path: '/en/' + postSlug,
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
    url: `${SiteConfig.url}/en/${postSlug}`,
    inLanguage: 'en',
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
        <Link href="/en" className="post-back">
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
          <div className="info">
            <div className="post-eyebrow">◆ ESSAY</div>
            <div className="post-author">
              <ProfileImage
                size={40}
                transitionName={`${transitionName}-avatar`}
              />
              <div>
                <div className="nm">{SiteConfig.author.name}</div>
                <div className="sub">
                  {updatedAt} · {readingTime} min read
                </div>
              </div>
            </div>
            {tags && (
              <ViewTransition name={`${transitionName}-tags`}>
                <div className="post-tags-row">
                  {tags.slice(0, 5).map((tag) => (
                    <Tag key={tag} text={tag} linked={false} />
                  ))}
                </div>
              </ViewTransition>
            )}
            <div className="post-stats">
              <div>
                <b>{readingTime}</b>min read
              </div>
              <div>
                <b>{postYear}</b>year
              </div>
              <div>
                <b>EN</b>translated
              </div>
            </div>
          </div>
          <ViewTransition name={transitionName}>
            <h1 className="post-title">
              {titleParts.map((part, i) =>
                part.emphasis ? <em key={i}>{part.text}</em> : part.text,
              )}
            </h1>
          </ViewTransition>
        </section>

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
          <Link href="/en">&larr; Back to the blog</Link>
          <Link href={`/${postSlug}`} className="issue">
            한국어로 읽기 →
          </Link>
        </footer>
      </div>
      <TableOfContents />
    </>
  )
}
