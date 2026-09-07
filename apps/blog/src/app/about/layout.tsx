import type {Metadata} from 'next'
import type {ReactNode} from 'react'

import {SiteConfig} from '@/config'
import {buildOgImageUrl} from '@/utils/og'

export const metadata: Metadata = {
  title: 'About - ' + SiteConfig.title,
  description: 'cheonbi의 개발 경험과 관심사를 소개합니다.',
  openGraph: {
    title: 'About - ' + SiteConfig.title,
    description: 'cheonbi의 개발 경험과 관심사를 소개합니다.',
    url: `${SiteConfig.url}/about`,
    images: [
      {
        url: buildOgImageUrl({
          title: 'About - ' + SiteConfig.title,
          description: 'cheonbi의 개발 경험과 관심사를 소개합니다.',
          path: '/about',
          type: 'page',
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: `${SiteConfig.url}/about`,
  },
}

export default function Layout({children}: {children: ReactNode}) {
  return <>{children}</>
}
