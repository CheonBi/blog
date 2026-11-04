import {getContactHref} from '@yceffort/shared/utils'

const isDev = process.env.NODE_ENV === 'development'

export const SiteConfig = {
  url: isDev ? 'http://localhost:3001' : 'https://research.cheonbi.kr',
  title: 'cheonbi research',
  subtitle: 'Read. Build. Share.',
  description:
    '관제 시스템, 데이터 처리, 소프트웨어 설계를 탐구하고 정리하는 cheonbi의 발표 자료와 연구 노트.',
  hero: {
    eyebrow: 'ENGINEERING NOTES',
    title: ['READ', 'BUILD', 'SHARE'],
    description:
      'Slides and research notes on monitoring systems, data pipelines, and software design.',
  },
  postsPerPage: 6,
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '',
  menu: [
    {label: 'Offline', path: '/offline'},
    {
      label: 'Blog',
      path: isDev ? 'http://localhost:3000' : 'https://cheonbi.kr',
    },
  ],
  author: {
    name: 'cheonbi',
    contacts: {
      email: 'root@cheonbi.kr',
      twitter: '',
      github: getContactHref('github', 'CheonBi'),
    },
  },
}

// Next 메타데이터는 얕게 병합되어 페이지가 openGraph를 정의하면 layout의 openGraph가 통째로 덮인다.
// 그래서 openGraph를 정의하는 페이지마다 이 값을 펼쳐 넣는다.
export const openGraphBase = {
  siteName: SiteConfig.title,
  locale: 'ko_KR',
  type: 'website' as const,
}
