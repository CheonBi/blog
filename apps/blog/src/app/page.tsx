import type {Metadata} from 'next'

import Hero from '@/components/HeroE'
import PostCard from '@/components/PostCard'
import RecentRow from '@/components/RecentRow'
import {SiteConfig} from '@/config'
import {POPULAR_POSTS_COUNT, RECENT_POSTS_COUNT} from '@/constants'
import {getPopularPostSlugs} from '@/utils/analytics'
import {buildOgImageUrl} from '@/utils/og'
import {getAllPosts, getAllTagsFromPosts} from '@/utils/Post'

export const revalidate = 3600

export const metadata: Metadata = {
  title: SiteConfig.title,
  description: SiteConfig.subtitle,
  openGraph: {
    title: SiteConfig.title,
    description: SiteConfig.subtitle,
    url: SiteConfig.url,
    images: [
      {
        url: buildOgImageUrl({
          title: SiteConfig.title,
          description: `${SiteConfig.subtitle}'s blog`,
          path: '/',
          type: 'page',
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default async function Page() {
  const [allPosts, popularSlugs, tags] = await Promise.all([
    getAllPosts(),
    getPopularPostSlugs(POPULAR_POSTS_COUNT),
    getAllTagsFromPosts('ko'),
  ])

  const posts = popularSlugs
    .map((slug) => allPosts.find((p) => p.fields.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p != null)

  if (posts.length < POPULAR_POSTS_COUNT) {
    const slugSet = new Set(posts.map((p) => p.fields.slug))
    for (const p of allPosts) {
      if (posts.length >= POPULAR_POSTS_COUNT) {
        break
      }
      if (!slugSet.has(p.fields.slug)) {
        posts.push(p)
        slugSet.add(p.fields.slug)
      }
    }
  }

  const shown = new Set(posts.map((p) => p.fields.slug))
  const recentPosts = allPosts
    .filter((p) => !shown.has(p.fields.slug))
    .slice(0, RECENT_POSTS_COUNT)

  const postCount = allPosts.length
  const tagCount = tags.length
  const earliestYear = allPosts
    .map((p) => new Date(p.frontMatter.date).getFullYear())
    .reduce((a, b) => Math.min(a, b), new Date().getFullYear())
  const yearsWriting = Math.max(1, new Date().getFullYear() - earliestYear + 1)

  return (
    <div className="page-view">
      <Hero
        postCount={postCount}
        tagCount={tagCount}
        yearsWriting={yearsWriting}
      />

      <div className="sec-head">
        <div>
          <span className="sec-count">
            {String(posts.length).padStart(2, '0')} ITEMS
          </span>
          <h2>
            Popular <em>this season</em>
          </h2>
        </div>
        <div className="line" />
        <div className="hint">hover · tilt · open</div>
      </div>
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.fields.slug} post={post} />
        ))}
      </section>

      {recentPosts.length > 0 && (
        <>
          <div className="sec-head">
            <div>
              <span className="sec-count">
                {String(recentPosts.length).padStart(2, '0')} ITEMS
              </span>
              <h2>Recent</h2>
            </div>
            <div className="line" />
            <div className="hint">latest writing</div>
          </div>
          <section className="rec-list">
            {recentPosts.map((post, i) => (
              <RecentRow key={post.fields.slug} post={post} index={i} />
            ))}
          </section>
        </>
      )}
    </div>
  )
}
