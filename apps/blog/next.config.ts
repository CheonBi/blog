import type {NextConfig} from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    viewTransition: true,
  },
  outputFileTracingIncludes: {
    '/*': ['./posts/**/*'],
  },
  async rewrites() {
    return [
      {source: '/llms.txt', destination: '/api/llms'},
      {source: '/llms-full.txt', destination: '/api/llms-full'},
      {
        source: '/en/:year(\\d{4})/:slug*.md',
        destination: '/api/posts-raw/en/:year/:slug*',
      },
      {
        source: '/:year(\\d{4})/:slug*.md',
        destination: '/api/posts-raw/:year/:slug*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ko',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ko/:path*',
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/generate-screenshot',
        destination: '/2020/12/generate-serverless-thumbnail',
        permanent: true,
      },
      {
        source: '/',
        has: [{type: 'query', key: 'page', value: '(?<no>\\d+)'}],
        destination: '/pages/:no',
        permanent: true,
      },
      {
        source: '/tag/:tag',
        destination: '/tags/:tag/pages/1',
        permanent: true,
      },
      {
        source: '/tag/:tag/page/:no',
        destination: '/tags/:tag/pages/:no',
        permanent: true,
      },
      {
        source: '/tags/:tag/pages/((?!\\d).*)',
        destination: '/tags/:tag/pages/1',
        permanent: true,
      },
      {
        source: '/tags/:tag',
        destination: '/tags/:tag/pages/1',
        permanent: true,
      },
      {
        source: '/category/:tag',
        destination: '/tags/:tag/pages/1',
        permanent: true,
      },
      {
        source: '/category/:tag/page/:no',
        destination: '/tags/:tag/pages/:no',
        permanent: true,
      },
      {
        source: '/categories',
        destination: '/tags',
        permanent: true,
      },
    ]
  },
}

export default config
