import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {mkdirSync, writeFileSync, readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import path from 'node:path'

import {checkBlogOffline} from './check-blog-offline.mjs'
import {renderFeatureFixture} from './check-markdown-features.mjs'

const root = path.resolve(import.meta.dirname, '..')
const require = createRequire(path.join(root, 'apps/blog/package.json'))
const {chromium} = require('@playwright/test')
const output = path.join(root, '.cache/browser-check')
mkdirSync(output, {recursive: true})
const servers = []

async function start(app, port) {
  const url = `http://localhost:${port}`
  if (!process.argv.includes('--existing')) {
    const child = spawn(
      process.execPath,
      [require.resolve('next/dist/bin/next'), 'start', '--port', String(port)],
      {
        cwd: path.join(root, `apps/${app}`),
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    servers.push(child)
    let logs = ''
    child.stdout.on('data', (chunk) => {
      logs += chunk
    })
    child.stderr.on('data', (chunk) => {
      logs += chunk
    })
    child.on('exit', () =>
      writeFileSync(path.join(output, `${app}-server.log`), logs),
    )
  }
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return url
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Production server did not start: ${app}`)
}

let browser
try {
  const blog = await start('blog', 3100)
  const research = await start('research', 3101)
  browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  })
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}})
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const checks = []
  async function visit(url) {
    const response = await page.goto(url, {waitUntil: 'networkidle'})
    assert.ok(response?.ok(), `${url}: ${response?.status()}`)
    assert.doesNotMatch(
      await page.locator('body').innerText(),
      /카카오페이증권|yceffort_dev|모던 리액트 Deep Dive/,
    )
    checks.push(url)
  }
  await visit(blog)
  for (const heading of ['Latest', 'Popular', 'Recent'])
    assert.ok(
      await page.getByRole('heading', {name: new RegExp(heading)}).count(),
    )
  await page.screenshot({
    path: path.join(output, 'blog-desktop.png'),
    fullPage: true,
  })
  await page.getByRole('button', {name: '검색', exact: true}).click()
  const input = page.getByRole('searchbox')
  await input.fill('람다')
  await page.waitForFunction(() =>
    document.body.innerText.includes('람다는 어떻게'),
  )
  await page.keyboard.press('Escape')
  const baseline = JSON.parse(
    readFileSync(path.join(root, 'docs/restoration-baseline.json'), 'utf8'),
  )
  const retiredDocuments = baseline.documents.filter((entry) => entry.retired)
  for (const entry of baseline.documents.filter(
    (candidate) => !candidate.retired,
  )) {
    await visit(
      `${blog}/${entry.path.includes('/series/') ? 'series/' : ''}${entry.slug}`,
    )
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href')
    assert.ok(
      canonical?.startsWith('https://cheonbi.kr/'),
      `Wrong canonical: ${canonical}`,
    )
  }
  await visit(`${blog}/about`)
  await page.screenshot({
    path: path.join(output, 'about-desktop.png'),
    fullPage: true,
  })
  await visit(`${blog}/resume`)
  assert.ok((await page.locator('body').innerText()).includes('ENITT'))
  assert.equal(await page.locator('#publications, #open-source').count(), 0)
  const index = await (await fetch(`${blog}/api/search-index`)).json()
  for (const entry of retiredDocuments) {
    assert.equal((await fetch(`${blog}/${entry.slug}`)).status, 404)
    assert.equal((await fetch(`${blog}/${entry.slug}.md`)).status, 404)
    assert.ok(!JSON.stringify(index).includes(entry.slug), entry.slug)
    assert.ok(!JSON.stringify(index).toLowerCase().includes('kineto'))
  }
  assert.ok(
    JSON.stringify(index).includes('blog-java-functional-interface-lambda'),
  )
  for (const route of [
    '/feed.xml',
    '/sitemap.xml',
    '/llms.txt',
    '/llms-full.txt',
    '/api/recent-posts',
    '/2026/09/blog-java-functional-interface-lambda.md',
  ]) {
    const response = await fetch(`${blog}${route}`)
    assert.equal(response.status, 200, route)
    const text = await response.text()
    for (const entry of retiredDocuments)
      assert.ok(!text.includes(entry.slug), `${route}: retired ${entry.slug}`)
    assert.doesNotMatch(text, /https:\/\/(?:research\.)?yceffort\.kr/)
  }
  assert.equal((await fetch(`${blog}/2026/09/does-not-exist`)).status, 404)
  for (const [alias, target] of [
    ['/index', '/'],
    ['/ko', '/'],
    ['/?page=1', '/pages/1'],
    ['/categories', '/tags'],
    ['/generate-screenshot', '/2026/09/thumbnail-generation'],
    ['/series/control-room-dispatch', '/series/event-distance-to-mms'],
  ]) {
    const response = await fetch(`${blog}${alias}`, {redirect: 'manual'})
    assert.equal(response.status, 308, alias)
    assert.equal(
      new URL(response.headers.get('location'), blog).pathname,
      target,
    )
    assert.ok((await fetch(`${blog}${target}`)).ok, target)
  }
  await visit(research)
  assert.equal((await page.locator('a[href^="/slides/"]').count()) >= 2, true)
  await page.screenshot({
    path: path.join(output, 'research-desktop.png'),
    fullPage: true,
  })
  for (const slug of ['design-system-boundaries', 'event-distance-to-mms']) {
    await visit(`${research}/slides/${slug}`)
    assert.ok((await page.locator('body').innerText()).includes('1 / 14'))
    const payload = await (
      await fetch(`${research}/api/slides/${slug}/offline`)
    ).json()
    assert.equal(payload.html.length, 14)
    await page.screenshot({path: path.join(output, `${slug}-cover.png`)})
    for (let index = 1; index <= 14; index++) {
      await page.goto(`${research}/slides/${slug}#${index}`, {
        waitUntil: 'networkidle',
      })
      await page.getByText(`${index} / 14`, {exact: true}).waitFor()
      const overflow = await page
        .locator('.swiper-slide-active section')
        .evaluate((section) => {
          const bounds = section.getBoundingClientRect()
          return [...section.querySelectorAll('h1,h2,h3,p,li,pre,table')].some(
            (node) => {
              const rect = node.getBoundingClientRect()
              return (
                rect.bottom > bounds.bottom + 2 ||
                rect.right > bounds.right + 2 ||
                rect.left < bounds.left - 2
              )
            },
          )
        })
      if (overflow)
        await page.screenshot({
          path: path.join(output, `${slug}-overflow-${index}.png`),
        })
      assert.equal(overflow, false, `${slug}: slide ${index} overflows`)
    }
    await page.goto(`${research}/slides/${slug}`, {waitUntil: 'networkidle'})
    await page.keyboard.press('ArrowRight')
    await page.waitForURL(/#2$/)
    await visit(`${research}/slides/${slug}/presenter`)
    assert.ok(await page.locator('.marp-presenter-notes-content').count())
    assert.equal((await fetch(`${research}/slides/${slug}.md`)).status, 200)
  }
  await page.setViewportSize({width: 390, height: 844})
  await visit(blog)
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  )
  await page.screenshot({
    path: path.join(output, 'blog-mobile.png'),
    fullPage: true,
  })
  await visit(`${blog}/2026/09/blog-java-functional-interface-lambda`)
  await page.screenshot({
    path: path.join(output, 'post-mobile.png'),
    fullPage: true,
  })
  const stylesheetLinks = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) => links.map((link) => link.outerHTML).join(''))
  await page.setContent(
    `${stylesheetLinks}<article class="post-article">${await renderFeatureFixture()}</article>`,
  )
  assert.equal(await page.locator('table').count(), 1)
  assert.equal(await page.locator('math').count(), 2)
  for (const math of await page.locator('math').all())
    assert.ok((await math.boundingBox())?.height > 0)
  await page.screenshot({
    path: path.join(output, 'markdown-private-fixture.png'),
  })
  assert.deepEqual(errors, [], 'Client-side errors')
  await browser.close()
  browser = null
  await checkBlogOffline({blog, chromium, output})
  writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify(
      {passed: true, checks, clientErrors: errors, blogOfflineRestart: true},
      null,
      2,
    ),
  )
  console.log(
    `Browser checks passed: ${checks.length} page visits, search, feeds, raw Markdown, 404, mobile, and two 14-slide decks.`,
  )
} finally {
  if (browser) await browser.close()
  for (const child of servers) child.kill()
}
