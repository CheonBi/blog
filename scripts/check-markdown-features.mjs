import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

const blogRoot = path.resolve(import.meta.dirname, '../apps/blog')
const require = createRequire(path.join(blogRoot, 'package.json'))

export async function renderFeatureFixture() {
  const {renderMarkdown} = await import(
    pathToFileURL(require.resolve('@yceffort/markdown-rs')).href
  )
  const {toJsxRuntime} = await import(
    pathToFileURL(require.resolve('hast-util-to-jsx-runtime')).href
  )
  const {Fragment, jsx, jsxs} = require('react/jsx-runtime')
  const {renderToStaticMarkup} = require('react-dom/server')
  const filename = path.resolve(
    import.meta.dirname,
    'fixtures/markdown-features.md',
  )
  const previousDirectory = process.cwd()
  let tree
  try {
    process.chdir(blogRoot)
    tree = renderMarkdown(readFileSync(filename, 'utf8'), filename)
  } finally {
    process.chdir(previousDirectory)
  }
  const html = renderToStaticMarkup(toJsxRuntime(tree, {Fragment, jsx, jsxs}))
  assert.match(html, /<table>/)
  assert.match(html, /language-javascript/)
  assert.match(html, /<math><semantics>/)
  assert.match(html, /<math[^>]+display="block"/)
  assert.match(html, /<mfrac>/)
  assert.match(html, /<msqrt>/)
  assert.match(html, /language-mermaid/)
  return html
}
