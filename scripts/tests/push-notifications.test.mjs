import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isPublished,
  postNotificationUrl,
  newlyPublishedFiles,
} from '../push-notifications.mjs'

void test('publication detection handles drafts and both newline conventions', () => {
  assert.equal(isPublished('---\npublished: true\n---\nbody'), true)
  assert.equal(isPublished('---\r\npublished: true\r\n---\r\nbody'), true)
  assert.equal(isPublished('---\npublished: false\n---\nbody'), false)
  assert.equal(isPublished('body\npublished: true'), false)
})

void test('notification links preserve nested post slugs', () => {
  assert.equal(
    postNotificationUrl('apps/blog/posts/2026/09/series/01-post.md'),
    '/2026/09/series/01-post?utm_source=push&utm_medium=notification',
  )
  assert.equal(postNotificationUrl('apps/blog/posts/2026/../secret.md'), null)
  assert.equal(postNotificationUrl('apps/blog/posts/2026/09/post.en.md'), null)
})

void test('an initial repository push never broadcasts the existing archive', () => {
  assert.deepEqual(newlyPublishedFiles('.', '0'.repeat(40)), [])
})
