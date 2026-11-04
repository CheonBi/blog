import {execFileSync} from 'node:child_process'
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

export function isPublished(markdown) {
  const frontmatter = markdown
    .replace(/\r\n/g, '\n')
    .match(/^---\n([\s\S]*?)\n---/)
  return Boolean(frontmatter && /^published:\s*true\s*$/m.test(frontmatter[1]))
}

export function postNotificationUrl(file) {
  const match = file
    .replaceAll('\\', '/')
    .match(/^apps\/blog\/posts\/(\d{4}\/[^.]+)\.mdx?$/)
  if (!match || match[1].split('/').includes('..')) return null
  return `/${match[1]}?utm_source=push&utm_medium=notification`
}

export function newlyPublishedFiles(root, before, head = 'HEAD') {
  // The first push is a bootstrap, not a request to notify the whole archive.
  if (!/^[a-f0-9]{40}$/.test(before) || /^0+$/.test(before)) return []
  const git = (args) =>
    execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'})
  const entries = git([
    'diff',
    '--name-status',
    '--no-renames',
    '--diff-filter=AM',
    '-z',
    before,
    head,
    '--',
    'apps/blog/posts',
    'apps/blog/series',
  ])
    .split('\0')
    .filter(Boolean)
  const selected = []
  for (let i = 0; i < entries.length; i += 2) {
    const [status, file] = entries.slice(i, i + 2)
    if (!/\.mdx?$/.test(file) || /\.en\.mdx?$/.test(file)) continue
    if (file.startsWith('apps/blog/series/')) {
      if (status === 'A') selected.push(file)
      continue
    }
    const current = git(['show', `${head}:${file}`])
    if (!isPublished(current)) continue
    if (status === 'A' || !isPublished(git(['show', `${before}:${file}`])))
      selected.push(file)
  }
  return selected
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = path.resolve(import.meta.dirname, '..')
  const manual = process.env.NOTIFY_FILES?.trim()
  const files = manual
    ? manual.split(/\s+/)
    : newlyPublishedFiles(root, process.env.BEFORE_SHA ?? '')
  for (const file of files) {
    if (
      !/^apps\/blog\/(posts|series)\//.test(file) ||
      file.split('/').includes('..')
    )
      throw new Error('Invalid notification file')
    readFileSync(path.join(root, file))
  }
  mkdirSync(path.join(root, '.cache'), {recursive: true})
  writeFileSync(
    path.join(root, '.cache/notification-files.json'),
    JSON.stringify(files),
  )
  console.log(`${files.length} newly published files`)
}
