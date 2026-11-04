import {execFileSync, spawnSync} from 'node:child_process'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  chmodSync,
} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const matches = (name, entries = []) =>
  entries.some((entry) =>
    entry.endsWith('/') ? name.startsWith(entry) : name === entry,
  )

export function isManaged(name, config) {
  return (
    matches(name, config.include) &&
    !matches(name, config.exclude) &&
    !matches(name, config.protected)
  )
}

function git(cwd, args, options = {}) {
  return execFileSync('git', ['-C', cwd, ...args], {
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  })
}

export function safePath(root, name) {
  if (
    name.includes('\\') ||
    name
      .split('/')
      .some((part) => ['..', '.git', 'node_modules'].includes(part))
  ) {
    throw new Error(`Unsafe upstream path: ${name}`)
  }
  const absolute = path.resolve(root, name)
  const relative = path.relative(root, absolute)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative))
    throw new Error(`Path outside repository: ${name}`)
  // Never write through a symlink already present in the target checkout.
  let current = root
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part)
    if (existsSync(current) && lstatSync(current).isSymbolicLink())
      throw new Error(`Symlink in target path: ${name}`)
  }
  return absolute
}

function blob(source, revision, name) {
  const entry = git(source, ['ls-tree', '-z', revision, '--', name], {
    encoding: 'utf8',
  })
  if (!entry) return null
  const [mode, type] = entry.split(' ')
  if (type !== 'blob' || !['100644', '100755'].includes(mode))
    throw new Error('Only regular files can be synchronized')
  return {content: git(source, ['show', `${revision}:${name}`]), mode}
}

const same = (a, b) => (a === null || b === null ? a === b : a.equals(b))

function merge(current, before, after, temporary) {
  const original = current
  const normalize = (buffer) =>
    buffer === null || buffer.includes(0)
      ? buffer
      : Buffer.from(buffer.toString('utf8').replace(/\r\n/g, '\n'))
  current = normalize(current)
  before = normalize(before)
  after = normalize(after)
  if (same(current, before)) return {content: after}
  if (same(current, after) || same(before, after)) return {content: original}
  if (current === null || before === null || after === null)
    return {
      reason: 'Local addition, deletion, or edit overlaps the upstream change',
    }
  if ([current, before, after].some((buffer) => buffer.includes(0)))
    return {reason: 'Both versions changed a binary file'}
  for (const [name, content] of [
    ['local', current],
    ['base', before],
    ['upstream', after],
  ])
    writeFileSync(path.join(temporary, name), content)
  const result = spawnSync(
    'git',
    [
      'merge-file',
      '--stdout',
      '--diff3',
      path.join(temporary, 'local'),
      path.join(temporary, 'base'),
      path.join(temporary, 'upstream'),
    ],
    {maxBuffer: 64 * 1024 * 1024},
  )
  if (result.error) throw result.error
  return result.status === 0
    ? {content: result.stdout}
    : {reason: 'Three-way merge needs manual resolution'}
}

export function synchronize({
  root,
  source,
  head,
  config,
  dryRun = false,
  configPath = 'upstream-sync.json',
}) {
  root = path.resolve(root)
  source = path.resolve(source)
  if (![config.commit, head].every((sha) => /^[a-f0-9]{40}$/.test(sha)))
    throw new Error('Full source commit hashes are required')
  const ancestry = spawnSync('git', [
    '-C',
    source,
    'merge-base',
    '--is-ancestor',
    config.commit,
    head,
  ])
  if (ancestry.status !== 0)
    throw new Error(
      'Upstream history changed or the recorded base is unavailable; no files were changed',
    )
  const changed = git(
    source,
    ['diff', '--name-only', '--no-renames', '-z', config.commit, head],
    {encoding: 'utf8'},
  )
    .split('\0')
    .filter(Boolean)
  const managed = changed.filter((name) => isManaged(name, config))
  const result = {
    base: config.commit,
    head,
    dryRun,
    applied: [],
    conflicts: [],
    ignored: changed.filter((name) => !isManaged(name, config)),
    changed: false,
  }
  const cache = safePath(root, '.cache')
  mkdirSync(cache, {recursive: true})
  const temporary = mkdtempSync(path.join(cache, 'upstream-merge-'))
  if (!temporary.startsWith(`${cache}${path.sep}upstream-merge-`))
    throw new Error('Unexpected temporary directory')
  try {
    for (const name of managed) {
      try {
        const target = safePath(root, name)
        const before = blob(source, config.commit, name)
        const after = blob(source, head, name)
        const current = existsSync(target) ? readFileSync(target) : null
        const merged = merge(
          current,
          before?.content ?? null,
          after?.content ?? null,
          temporary,
        )
        if (merged.reason) {
          result.conflicts.push({path: name, reason: merged.reason})
          continue
        }
        if (same(current, merged.content)) continue
        if (!dryRun) {
          if (merged.content === null) rmSync(target)
          else {
            mkdirSync(path.dirname(target), {recursive: true})
            writeFileSync(target, merged.content)
            chmodSync(target, after?.mode === '100755' ? 0o755 : 0o644)
          }
        }
        result.applied.push(name)
      } catch (error) {
        result.conflicts.push({path: name, reason: error.message})
      }
    }
    result.changed = managed.length > 0
    if (!dryRun && managed.length) {
      const report = safePath(root, 'docs/upstream-conflicts.md')
      if (result.conflicts.length) {
        mkdirSync(path.dirname(report), {recursive: true})
        writeFileSync(
          report,
          `# Upstream conflicts\n\nBase: \`${config.commit}\`\n\nIncoming: \`${head}\`\n\nThe source lock has not advanced. Conflicting local files were preserved. Resolve each path, rerun validation, update upstream-sync.json to the incoming commit, and remove this report before merging.\n\n${result.conflicts.map((item) => `- \`${item.path}\`: ${item.reason}`).join('\n')}\n`,
        )
      } else {
        writeFileSync(
          safePath(root, configPath),
          `${JSON.stringify({...config, commit: head}, null, 2)}\n`,
        )
        if (existsSync(report)) rmSync(report)
      }
    }
  } finally {
    rmSync(temporary, {recursive: true, force: true})
  }
  return result
}

function main() {
  const args = process.argv.slice(2)
  const value = (name) =>
    args.includes(name) ? args[args.indexOf(name) + 1] : undefined
  const root = path.resolve(
    value('--root') ?? path.join(import.meta.dirname, '..'),
  )
  const config = JSON.parse(
    readFileSync(path.join(root, 'upstream-sync.json'), 'utf8'),
  )
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(config.repository))
    throw new Error('Invalid upstream repository')
  let source = value('--source')
  if (!source) {
    source = path.join(root, '.cache/upstream-source')
    if (!existsSync(source)) {
      mkdirSync(path.dirname(source), {recursive: true})
      execFileSync(
        'git',
        [
          'clone',
          '--bare',
          '--filter=blob:none',
          `https://github.com/${config.repository}.git`,
          source,
        ],
        {stdio: 'inherit'},
      )
    }
    git(source, ['fetch', '--no-tags', 'origin', config.ref])
  }
  const head =
    value('--head') ??
    git(source, ['rev-parse', value('--source') ? config.ref : 'FETCH_HEAD'], {
      encoding: 'utf8',
    }).trim()
  const result = synchronize({
    root,
    source,
    head,
    config,
    dryRun: args.includes('--dry-run'),
  })
  const output = path.join(root, '.cache/upstream-result.json')
  writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify(result, null, 2))
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main()
