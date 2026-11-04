import path from 'path'

export type Locale = 'ko' | 'en'

export const pathPrefixOf = (locale: Locale) => (locale === 'en' ? '/en' : '')

export const POST_ROOT = path.join(process.cwd(), 'posts').replaceAll('\\', '/')

export function isLocaleFile(filePath: string, locale: Locale): boolean {
  const isEn = /\.en\.mdx?$/.test(filePath)
  return locale === 'en' ? isEn : !isEn
}

export function pathToSlug(filePath: string): string {
  return path.posix
    .relative(POST_ROOT.replaceAll('\\', '/'), filePath.replaceAll('\\', '/'))
    .replace(/\.en\.mdx?$/, '')
    .replace(/\.mdx?$/, '')
}
