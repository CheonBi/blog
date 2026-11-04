import assert from 'node:assert/strict'
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'

export async function checkBlogOffline({blog, chromium, output}) {
  const cache = path.resolve(import.meta.dirname, '../.cache')
  await mkdir(cache, {recursive: true})
  const profile = await mkdtemp(path.join(cache, 'blog-offline-'))
  assert.ok(profile.startsWith(`${cache}${path.sep}blog-offline-`))
  let context
  const errors = []
  const launch = async () => {
    const next = await chromium.launchPersistentContext(profile, {
      headless: true,
      viewport: {width: 390, height: 844},
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    })
    next.setDefaultTimeout(60000)
    // Exercise the installed-app flow without requiring a browser install dialog.
    await next.addInitScript(() => {
      Object.defineProperty(navigator, 'standalone', {get: () => true})
    })
    next.on('page', (page) =>
      page.on('pageerror', (error) => errors.push(error.message)),
    )
    return next
  }
  try {
    context = await launch()
    let page = await context.newPage()
    const articlePath = '/2026/09/blog-java-functional-interface-lambda'
    await page.goto(`${blog}${articlePath}`, {waitUntil: 'domcontentloaded'})
    await page.locator('h1').first().waitFor()
    const title = await page.locator('h1').first().innerText()
    await page.waitForFunction(() => navigator.serviceWorker.controller)
    await page.waitForFunction((pathname) => {
      const meta = JSON.parse(
        localStorage.getItem('offline-saved-meta') ?? '{}',
      )
      return meta.lastSync && meta.sizes?.[pathname]?.bytes > 0
    }, articlePath)
    await page.goto(`${blog}/saved`, {waitUntil: 'domcontentloaded'})
    const savedLink = page.locator(`a[href="${articlePath}"]`)
    await savedLink.waitFor()
    assert.ok((await savedLink.innerText()).includes(title))
    await context.close()

    context = await launch()
    await context.setOffline(true)
    page = await context.newPage()
    await page.goto(`${blog}/saved`, {waitUntil: 'domcontentloaded'})
    assert.equal(await page.evaluate(() => navigator.onLine), false)
    await page.locator(`a[href="${articlePath}"]`).click()
    await page.waitForURL(`${blog}${articlePath}`)
    const article = page.locator(
      'article.post-article:not([aria-hidden="true"])',
    )
    await article.waitFor()
    assert.ok((await article.innerText()).length > 1000)
    await page.reload({waitUntil: 'networkidle'})
    assert.equal(await page.locator('h1').first().innerText(), title)
    assert.ok((await article.locator('pre').count()) > 0)
    assert.deepEqual(errors, [], 'Blog offline client errors')
    await page.screenshot({path: path.join(output, 'blog-offline-restart.png')})
    await writeFile(
      path.join(output, 'blog-offline.json'),
      JSON.stringify(
        {
          passed: true,
          browserRestart: true,
          offline: true,
          articlePath,
          title,
          clientErrors: errors,
        },
        null,
        2,
      ),
    )
  } finally {
    await context?.close()
    assert.ok(profile.startsWith(`${cache}${path.sep}blog-offline-`))
    await rm(profile, {recursive: true, force: true})
  }
}
