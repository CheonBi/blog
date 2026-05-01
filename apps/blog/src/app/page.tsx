import {cacheLife, cacheTag} from 'next/cache'

import type {Metadata} from 'next'

import Hero from '@/components/HeroE'
import PostCard from '@/components/PostCard'
import RecentRow from '@/components/RecentRow'
import {SiteConfig} from '@/config'
import {buildOgImageUrl} from '@/utils/og'
import {getAllPosts, getAllTagsFromPosts, getFeaturedPosts} from '@/utils/Post'

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

async function getHomeData() {
  'use cache'
  cacheLife('hours')
  cacheTag('home:ko')

  const [{popular: posts, recent: recentPosts}, allPosts, tags] =
    await Promise.all([
      getFeaturedPosts('ko'),
      getAllPosts('ko'),
      getAllTagsFromPosts('ko'),
    ])

  const postCount = allPosts.length
  const tagCount = tags.length
  const earliestYear = allPosts
    .map((p) => new Date(p.frontMatter.date).getFullYear())
    .reduce((a, b) => Math.min(a, b), new Date().getFullYear())
  const yearsWriting = Math.max(1, new Date().getFullYear() - earliestYear + 1)

  return {posts, recentPosts, postCount, tagCount, yearsWriting}
}

export default async function Page() {
  const {posts, recentPosts, postCount, tagCount, yearsWriting} =
    await getHomeData()

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
