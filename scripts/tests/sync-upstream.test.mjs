import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {safePath, synchronize} from '../sync-upstream.mjs'

const cache = path.resolve(import.meta.dirname, '../../.cache')
mkdirSync(cache, {recursive: true})

function fixture(t, files) {
  const temporary = mkdtempSync(path.join(cache, 'sync-test-'))
  t.after(() => {
    assert.ok(temporary.startsWith(`${cache}${path.sep}sync-test-`))
    rmSync(temporary, {recursive: true, force: true})
  })
  const source = path.join(temporary, 'source')
  const root = path.join(temporary, 'target')
  mkdirSync(source)
  mkdirSync(root)
  const git = (...args) =>
    execFileSync('git', ['-C', source, ...args], {encoding: 'utf8'})
  git('init', '--quiet')
  git('config', 'core.autocrlf', 'false')
  git('config', 'user.name', 'Sync test')
  git('config', 'user.email', 'sync-test@example.invalid')
  const write = (base, name, text) => {
    mkdirSync(path.dirname(path.join(base, name)), {recursive: true})
    writeFileSync(path.join(base, name), text)
  }
  for (const [name, text] of Object.entries(files)) {
    write(source, name, text)
    write(root, name, text)
  }
  const commit = () => {
    git('add', '.')
    git('commit', '--quiet', '--allow-empty', '-m', 'fixture')
    return git('rev-parse', 'HEAD').trim()
  }
  const base = commit()
  const config = {
    repository: 'example/source',
    ref: 'main',
    commit: base,
    include: ['managed/'],
    protected: ['managed/identity.txt'],
    exclude: [],
  }
  write(root, 'upstream-sync.json', JSON.stringify(config))
  return {
    root,
    source,
    config,
    commit,
    write,
    read: (name) => readFileSync(path.join(root, name), 'utf8'),
  }
}

void test('merges independent local and upstream edits and advances the source lock', (t) => {
  const original =
    Array.from({length: 20}, (_, i) => `line ${i}`).join('\n') + '\n'
  const f = fixture(t, {'managed/code.txt': original})
  f.write(
    f.root,
    'managed/code.txt',
    original.replace('line 0\n', 'personal line\n').replaceAll('\n', '\r\n'),
  )
  f.write(
    f.source,
    'managed/code.txt',
    original.replace('line 19\n', 'updated line\n'),
  )
  const head = f.commit()
  const result = synchronize({...f, head})
  assert.deepEqual(result.conflicts, [])
  assert.match(f.read('managed/code.txt'), /personal line/)
  assert.match(f.read('managed/code.txt'), /updated line/)
  assert.equal(JSON.parse(f.read('upstream-sync.json')).commit, head)
  assert.equal(
    synchronize({...f, config: {...f.config, commit: head}, head}).changed,
    false,
  )
})

void test('content-only changes leave personal data and the lock untouched', (t) => {
  const f = fixture(t, {
    'posts/article.md': 'own article',
    'managed/identity.txt': 'own name',
  })
  f.write(f.source, 'posts/article.md', 'author article')
  f.write(f.source, 'managed/identity.txt', 'author name')
  const result = synchronize({...f, head: f.commit()})
  assert.equal(result.changed, false)
  assert.equal(f.read('posts/article.md'), 'own article')
  assert.equal(f.read('managed/identity.txt'), 'own name')
  assert.equal(JSON.parse(f.read('upstream-sync.json')).commit, f.config.commit)
})

void test('conflicts preserve the local file and source lock and produce a review report', (t) => {
  const f = fixture(t, {'managed/code.txt': 'base\n'})
  f.write(f.root, 'managed/code.txt', 'personal\n')
  f.write(f.source, 'managed/code.txt', 'upstream\n')
  const head = f.commit()
  const result = synchronize({...f, head})
  assert.equal(result.conflicts.length, 1)
  assert.equal(f.read('managed/code.txt'), 'personal\n')
  assert.equal(JSON.parse(f.read('upstream-sync.json')).commit, f.config.commit)
  assert.match(f.read('docs/upstream-conflicts.md'), new RegExp(head))
})

void test('supports additions, deletions and renames without overwriting an edited deletion', (t) => {
  const f = fixture(t, {
    'managed/old.txt': 'rename',
    'managed/remove.txt': 'remove',
    'managed/edited.txt': 'original',
  })
  f.write(f.root, 'managed/edited.txt', 'local edit')
  for (const name of ['old.txt', 'remove.txt', 'edited.txt'])
    rmSync(path.join(f.source, 'managed', name))
  f.write(f.source, 'managed/new.txt', 'rename')
  const result = synchronize({...f, head: f.commit()})
  assert.equal(existsSync(path.join(f.root, 'managed/old.txt')), false)
  assert.equal(existsSync(path.join(f.root, 'managed/remove.txt')), false)
  assert.equal(f.read('managed/new.txt'), 'rename')
  assert.equal(f.read('managed/edited.txt'), 'local edit')
  assert.equal(result.conflicts.length, 1)
})

void test('dry runs and rewound source history do not change files', (t) => {
  const f = fixture(t, {'managed/code.txt': 'base'})
  f.write(f.source, 'managed/code.txt', 'next')
  const head = f.commit()
  const result = synchronize({...f, head, dryRun: true})
  assert.deepEqual(result.applied, ['managed/code.txt'])
  assert.equal(f.read('managed/code.txt'), 'base')
  assert.throws(
    () =>
      synchronize({
        ...f,
        head: f.config.commit,
        config: {...f.config, commit: head},
      }),
    /history changed/,
  )
  assert.equal(f.read('managed/code.txt'), 'base')
})

void test('binary overlap and local deletion require review', (t) => {
  const f = fixture(t, {
    'managed/binary': Buffer.from([0, 1]),
    'managed/deleted': 'old',
  })
  f.write(f.root, 'managed/binary', Buffer.from([0, 2]))
  f.write(f.source, 'managed/binary', Buffer.from([0, 3]))
  rmSync(path.join(f.root, 'managed/deleted'))
  f.write(f.source, 'managed/deleted', 'updated')
  const result = synchronize({...f, head: f.commit()})
  assert.equal(result.conflicts.length, 2)
  assert.deepEqual(
    readFileSync(path.join(f.root, 'managed/binary')),
    Buffer.from([0, 2]),
  )
  assert.equal(existsSync(path.join(f.root, 'managed/deleted')), false)
})

void test('rejects paths outside the checkout and Git metadata', () => {
  for (const name of [
    '../outside',
    '.git/config',
    'managed/../../outside',
    'managed\\file',
    'node_modules/file',
  ]) {
    assert.throws(() => safePath(cache, name))
  }
})
