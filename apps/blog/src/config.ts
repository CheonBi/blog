import {getContactHref} from '@cheonbi/shared/utils'

const isDev = process.env.NODE_ENV === 'development'

export const SiteConfig = {
  url: isDev ? 'http://localhost:3000' : 'https://cheonbi.kr',
  pathPrefix: '/',
  title: 'cheonbi',
  subtitle: 'CODE. SYSTEM. With The Decisions Between.',
  copyright: 'cheonbi © All rights reserved.',
  disqusShortname: '',
  postsPerPage: 5,
  googleAnalyticsId: '',
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
      label: '🎥 Kinetograph',
      path: isDev ? 'http://localhost:3001' : 'https://kinetograph.cheonbi.kr',
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
