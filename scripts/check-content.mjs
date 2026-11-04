import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync, readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
assert.equal(
  existsSync(path.join(root, 'docs/upstream-conflicts.md')),
  false,
  'Resolve the upstream conflict report before merging',
)
const read = (name) =>
  readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n')
const files = (name) =>
  readdirSync(path.join(root, name), {recursive: true}).map(
    (entry) => `${name}/${entry.replaceAll('\\', '/')}`,
  )
const document = (name) => {
  const match = read(name).match(/^---\n([\s\S]*?)\n---([\s\S]*)$/)
  assert.ok(match, `Missing frontmatter: ${name}`)
  return {metadata: match[1], body: match[2]}
}

const posts = files('apps/blog/posts').filter((name) => /\.mdx?$/.test(name))
const series = files('apps/blog/series').filter((name) => name.endsWith('.md'))
const decks = files('apps/research/research').filter((name) =>
  name.endsWith('.md'),
)
assert.ok(posts.length > 0 && series.length > 0 && decks.length >= 2)
for (const name of posts) {
  const {metadata} = document(name)
  assert.match(metadata, /^title:/m, name)
  assert.match(metadata, /^date:/m, name)
  const slide = metadata.match(/^slide:\s*(.+)$/m)?.[1]
  if (slide)
    assert.ok(
      existsSync(path.join(root, `apps/research/research/${slide}.md`)),
      `Missing deck for ${name}`,
    )
}
for (const name of decks) {
  const {metadata, body} = document(name)
  const count = body.trim().split(/\n---\s*\n/).length
  assert.ok(
    count >= 12 && count <= 16,
    `${name}: expected 12–16 slides, got ${count}`,
  )
  assert.match(metadata, /^post: https:\/\/cheonbi\.kr\//m)
  assert.ok(
    (body.match(/<!--/g) ?? []).length >= count,
    `Missing speaker notes: ${name}`,
  )
}
for (const directory of [
  'apps/blog/src',
  'apps/research/src',
  'packages/shared/src',
  'apps/blog/public',
  'apps/research/public',
]) {
  for (const name of files(directory).filter(
    (entry) => /\.[cm]?[jt]sx?$/.test(entry) && !entry.includes('/__tests__/'),
  )) {
    assert.doesNotMatch(
      read(name),
      /yceffort\.kr|G-ND58S24JBX|github\.com\/yceffort|payload\.(?:title|url) \|\| 'yceffort'/,
      `Upstream identity in runtime: ${name}`,
    )
  }
}
if (process.argv.includes('--baseline')) {
  const baseline = JSON.parse(read('docs/restoration-baseline.json'))
  assert.equal(posts.length, 15)
  assert.equal(series.length, 2)
  for (const entry of baseline.documents) {
    const {metadata, body} = document(entry.path)
    assert.equal(
      createHash('sha256').update(body).digest('hex'),
      entry.bodySha256,
      `Body changed: ${entry.path}`,
    )
    if (entry.date)
      assert.equal(
        metadata.match(/^date:\s*(.+)$/m)?.[1],
        entry.date,
        `Date changed: ${entry.path}`,
      )
  }
}
console.log(
  `Content verified: ${posts.length} posts, ${series.length} series, ${decks.length} research decks.`,
)
