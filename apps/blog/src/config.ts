import {getContactHref} from '@yceffort/shared/utils'

const isDev = process.env.NODE_ENV === 'development'

export const SiteConfig = {
  url: isDev ? 'http://localhost:3000' : 'https://cheonbi.kr',
  pathPrefix: '/',
  title: 'cheonbi',
  subtitle: 'Build. Learn. Record.',
  description:
    '관제 웹 서비스와 데이터 처리, 개발 과정에서 배운 내용을 기록하는 cheonbi의 기술 블로그.',
  hero: {
    eyebrow: 'WEB SERVICES · DATA',
    title: ['BUILD', 'LEARN', 'RECORD'],
    description:
      'Building monitoring web services with React, TypeScript, Java, and Spring Boot. Notes on data visualization, backend design, and lessons from development.',
  },
  copyright: 'cheonbi © All rights reserved.',
  disqusShortname: '',
  postsPerPage: 5,
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '',
  // infra/otel 의 수집 서버. CWV 를 OpenTelemetry 로 보낸다.
  otelCollectorUrl: process.env.NEXT_PUBLIC_OTEL_COLLECTOR_URL ?? '',
  useKatex: false,
  menu: [
    {
      label: 'Posts',
      path: '/pages/1',
    },
    {
      label: 'Series',
      path: '/series',
    },
    {
      label: 'Tags',
      path: '/tags',
    },
    {
      label: 'About',
      path: '/about',
    },
    {
      label: 'Research',
      path: isDev ? 'http://localhost:3001' : 'https://research.cheonbi.kr',
    },
  ],
  author: {
    name: 'cheonbi',
    photo: '/profile.webp',
    bio: 'Software engineer',
    contacts: {
      email: 'root@cheonbi.kr',
      facebook: '',
      telegram: '',
      twitter: '',
      github: getContactHref('github', 'CheonBi'),
      rss: '',
      linkedin: '',
      instagram: '',
      line: '',
      gitlab: '',
      codepen: '',
      youtube: '',
      soundcloud: '',
    },
  },
}
