import type {MetadataRoute} from 'next'

import {SiteConfig} from '@/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SiteConfig.url}/sitemap.xml`,
  }
}
