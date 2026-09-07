import type {Metadata} from 'next'
import type {ReactNode} from 'react'

import {SiteConfig} from '@/config'
import {buildOgImageUrl} from '@/utils/og'

export const metadata: Metadata = {
  title: 'Resume - ' + SiteConfig.title,
  description:
    'cheonbi의 프론트엔드 중심 풀스택 개발 경력과 기술을 정리했습니다.',
  openGraph: {
    title: 'Resume - ' + SiteConfig.title,
    description:
      'cheonbi의 프론트엔드 중심 풀스택 개발 경력과 기술을 정리했습니다.',
    url: `${SiteConfig.url}/resume`,
    images: [
      {
        url: buildOgImageUrl({
          title: 'Resume - ' + SiteConfig.title,
          description:
            'cheonbi의 프론트엔드 중심 풀스택 개발 경력과 기술을 정리했습니다.',
          path: '/resume',
          type: 'page',
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function Layout({children}: {children: ReactNode}) {
  return <>{children}</>
}
