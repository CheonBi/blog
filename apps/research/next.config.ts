import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  async rewrites() {
    return [
      {source: '/slides/:slug.md', destination: '/api/slides/:slug/raw'},
      {source: '/llms.txt', destination: '/api/llms'},
      {source: '/llms-full.txt', destination: '/api/llms-full'},
    ]
  },
}

export default nextConfig
