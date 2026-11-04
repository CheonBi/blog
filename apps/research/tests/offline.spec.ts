import {mkdtemp, rm, mkdir} from 'node:fs/promises'
import path from 'node:path'

import {chromium, expect, test} from '@playwright/test'

import {decks} from './fixtures/decks'

test('saved decks survive a browser restart with offline Mermaid and presenter sync', async () => {
  const cache = path.resolve(import.meta.dirname, '../../../.cache')
  await mkdir(cache, {recursive: true})
  const profile = await mkdtemp(path.join(cache, 'research-offline-'))
  expect(profile.startsWith(`${cache}${path.sep}research-offline-`)).toBe(true)
  const base = 'http://localhost:3011'
  let context = await chromium.launchPersistentContext(profile, {
    headless: true,
  })
  try {
    let page = await context.newPage()
    await page.goto(`${base}/slides/${decks.event.slug}`)
    await page.locator('.marp-slides').click({button: 'right'})
    await page
      .getByRole('button', {
        name: `${decks.event.slug} 오프라인 저장`,
        exact: true,
      })
      .click()
    await expect(page.locator('.offline-toast')).toContainText(
      `저장 완료: ${decks.event.title}`,
    )
    await context.close()

    context = await chromium.launchPersistentContext(profile, {headless: true})
    await context.setOffline(true)
    page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(
      `${base}/offline/${decks.event.slug}#${decks.event.mermaidPage}`,
    )
    await expect(
      page.locator('.swiper-slide-active .mermaid svg'),
    ).toBeVisible()
    await page.reload()
    await expect(page.locator('.marp-slides')).toBeVisible()
    await page.goto(`${base}/`)
    await expect(page).toHaveURL(`${base}/offline`)
    await expect(page.locator('.offline-deck')).toHaveCount(1)
    await page.getByRole('link', {name: '슬라이드 열기', exact: true}).click()
    await expect(page.locator('.marp-slides')).toBeVisible()
    const opening = context.waitForEvent('page')
    await page.keyboard.press('p')
    const presenter = await opening
    await expect(
      presenter.locator('.marp-presenter-notes-content').last(),
    ).not.toBeEmpty()
    await presenter.getByRole('button', {name: '시작', exact: true}).click()
    await expect(presenter.getByText('00:01', {exact: true})).toBeVisible()
    await presenter.getByRole('button', {name: '일시정지', exact: true}).click()
    const previous = Number(new URL(page.url()).hash.slice(1))
    await presenter.getByRole('button', {name: '다음 ▶', exact: true}).click()
    await expect(page).toHaveURL(new RegExp(`#${previous + 1}$`))
    expect(errors).toEqual([])
  } finally {
    await context.close()
    await rm(profile, {recursive: true, force: true})
  }
})
