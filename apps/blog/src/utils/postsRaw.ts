import fs from 'fs'
import path from 'path'

import {sync} from 'glob'

import type {Locale} from './Post'

const POST_ROOT = path.join(process.cwd(), 'posts')

export function getPostRawBySlug(
  year: string,
  slugParts: string[],
  locale: Locale = 'ko',
): string | null {
  const baseSlug = [year, ...slugParts].join('/')
  const suffix = locale === 'en' ? '.en' : ''

  for (const ext of ['.md', '.mdx']) {
    const filePath = path.join(POST_ROOT, `${baseSlug}${suffix}${ext}`)
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8')
    }
  }
  return null
}

export function getAllPostFiles(locale: Locale = 'ko'): string[] {
  const all = sync(`${POST_ROOT}/**/*.md*`)
  return all.filter((f) => {
    const isEn = /\.en\.mdx?$/.test(f)
    return locale === 'en' ? isEn : !isEn
  })
}
