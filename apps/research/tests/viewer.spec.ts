import {expect, test} from '@playwright/test'

import {decks} from './fixtures/decks'

test('personal decks have fourteen slides, keyboard navigation, and presenter notes', async ({
  page,
  context,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const {slug, title} of Object.values(decks)) {
    await page.goto(`/slides/${slug}`)
    await expect(page.getByText('1 / 14', {exact: true})).toBeVisible()
    const payload = await (
      await context.request.get(`/api/slides/${slug}/offline`)
    ).json()
    expect(payload.notes.filter((note: string) => note.trim()).length).toBe(14)
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(new RegExp(`/slides/${slug}#2$`))
    const opening = context.waitForEvent('page')
    await page.keyboard.press('p')
    const presenter = await opening
    await expect(presenter).toHaveURL(new RegExp(`/slides/${slug}/presenter`))
    await expect(presenter.getByText('2 / 14', {exact: true})).toBeVisible()
    await expect(
      presenter.locator('.marp-presenter-notes-content').last(),
    ).toHaveText(payload.notes[1])
    await presenter.getByRole('button', {name: '시작', exact: true}).click()
    await expect(presenter.getByText('00:01', {exact: true})).toBeVisible()
    await presenter.getByRole('button', {name: '일시정지', exact: true}).click()
    await presenter.getByRole('button', {name: '다음 ▶', exact: true}).click()
    await expect(page).toHaveURL(new RegExp(`#3$`))
    await presenter.close()
    const raw = await context.request.get(`/slides/${slug}.md`)
    expect(raw.ok()).toBe(true)
    expect(await raw.text()).toContain(title)
  }
  expect(errors).toEqual([])
})
