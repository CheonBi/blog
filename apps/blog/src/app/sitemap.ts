import type {MetadataRoute} from 'next'

import {getAllPosts, getAllTagsFromPosts} from '@/utils/Post'
import {toInstant} from '@/utils/postDate'
import {getAllSeries} from '@/utils/Series'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, enPosts, tags, enTags, series, enSeries] = await Promise.all([
    getAllPosts(),
    getAllPosts('en'),
    getAllTagsFromPosts(),
    getAllTagsFromPosts('en'),
    getAllSeries(),
    getAllSeries('en'),
  ])

  const enSlugs = new Set(enPosts.map((p) => p.fields.slug))

  return [
    {
      url: 'https://cheonbi.kr',
      lastModified: new Date(),
    },
    ...['about', 'resume'].flatMap((page) =>
      ['', '/en'].map((prefix) => ({
        url: `https://cheonbi.kr${prefix}/${page}`,
        lastModified: new Date(),
        alternates: {
          languages: {
            ko: `https://cheonbi.kr/${page}`,
            en: `https://cheonbi.kr/en/${page}`,
          },
        },
      })),
    ),
    {
      url: 'https://cheonbi.kr/archive',
      lastModified: new Date(),
    },
    ...posts.map((post) => ({
      url: `https://cheonbi.kr/${post.fields.slug}`,
      lastModified: toInstant(
        post.frontMatter.updated ?? post.frontMatter.date,
      ),
      ...(enSlugs.has(post.fields.slug) && {
        alternates: {
          languages: {
            ko: `https://cheonbi.kr/${post.fields.slug}`,
            en: `https://cheonbi.kr/en/${post.fields.slug}`,
          },
        },
      }),
    })),
    ...enPosts.map((post) => ({
      url: `https://cheonbi.kr/en/${post.fields.slug}`,
      lastModified: toInstant(
        post.frontMatter.updated ?? post.frontMatter.date,
      ),
      alternates: {
        languages: {
          ko: `https://cheonbi.kr/${post.fields.slug}`,
          en: `https://cheonbi.kr/en/${post.fields.slug}`,
        },
      },
    })),
    ...tags.map(({tag}) => ({
      url: `https://cheonbi.kr/tags/${tag}`,
    })),
    {
      url: 'https://cheonbi.kr/series',
      lastModified: new Date(),
    },
    ...series.map((s) => ({
      url: `https://cheonbi.kr/series/${s.slug}`,
      lastModified: new Date(),
    })),
    ...enTags.map(({tag}) => ({
      url: `https://cheonbi.kr/en/tags/${tag}`,
    })),
    {
      url: 'https://cheonbi.kr/en/series',
      lastModified: new Date(),
    },
    ...enSeries.map((s) => ({
      url: `https://cheonbi.kr/en/series/${s.slug}`,
      lastModified: new Date(),
    })),
  ]
}
