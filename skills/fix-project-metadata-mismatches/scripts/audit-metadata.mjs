#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const usage = `Usage: audit-metadata.mjs [project-root] [--json] [--strict]

Audit deterministic metadata relationships in a Node project.

Options:
  --json      Emit machine-readable JSON.
  --strict    Exit 1 when deterministic findings exist.
  -h, --help  Show this help.`

const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log(usage)
  process.exit(0)
}
const allowedFlags = new Set(['--json', '--strict'])
const unknownFlags = args.filter((arg) => arg.startsWith('-') && !allowedFlags.has(arg))
const positionals = args.filter((arg) => !arg.startsWith('-'))
if (unknownFlags.length || positionals.length > 1) {
  if (unknownFlags.length) console.error(`Unknown option: ${unknownFlags[0]}`)
  else console.error('Expected at most one project-root argument.')
  console.error(usage)
  process.exit(2)
}
const rootArg = positionals[0] ?? '.'
const root = path.resolve(rootArg)
const jsonOutput = args.includes('--json')
const strict = args.includes('--strict')

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw new Error(`Cannot parse ${path.relative(root, file)}: ${error.message}`)
  }
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

function repositoryUrl(value) {
  if (typeof value === 'string') return value
  if (value && typeof value.url === 'string') return value.url
  return null
}

function normalizeRepository(value) {
  return value
    ?.replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
}

function urlValues(value) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(urlValues)
  if (value && typeof value.url === 'string') return [value.url]
  return []
}

function binNames(value, packageName) {
  if (typeof value === 'string' && packageName) return [packageName.replace(/^@[^/]+\//, '')]
  if (value && typeof value === 'object') return Object.keys(value)
  return []
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function comparable(field, value, packageName) {
  if (['homepage', 'bugs', 'funding'].includes(field)) return urlValues(value).sort()
  if (field === 'bin') {
    if (typeof value === 'string') return { [packageName.replace(/^@[^/]+\//, '')]: value }
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)))
  }
  return value
}

function frontmatter(text) {
  if (!text?.startsWith('---')) return {}
  const end = text.indexOf('\n---', 3)
  if (end < 0) return {}
  return Object.fromEntries(
    text
      .slice(3, end)
      .split('\n')
      .map((line) => line.match(/^([a-zA-Z0-9_-]+):\s*["']?(.*?)["']?\s*$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2]]),
  )
}

const packageFile = path.join(root, 'package.json')
const manifest = readJson(packageFile)
if (!manifest) {
  console.error(`No package.json found at ${packageFile}`)
  process.exit(2)
}

const findings = []
const coverage = []
const checked = ['package.json']
const add = (kind, field, file, actual, expected, message) =>
  findings.push({ kind, field, file, actual, expected, message })
const cover = (field, status, surfaces, message) =>
  coverage.push({ field, status, surfaces, message })

const lock = readJson(path.join(root, 'package-lock.json'))
if (lock) {
  checked.push('package-lock.json')
  const lockedRoot = lock.packages?.[''] ?? lock
  for (const field of ['name', 'version', 'description', 'homepage', 'engines', 'bugs', 'funding', 'bin']) {
    if (manifest[field] === undefined) continue
    if (lockedRoot[field] === undefined) {
      cover(field, 'not-repeated', ['package.json', 'package-lock.json'], `package-lock.json does not repeat root ${field}; no deterministic comparison is possible.`)
      continue
    }
    if (!sameValue(comparable(field, lockedRoot[field], manifest.name ?? ''), comparable(field, manifest[field], manifest.name ?? ''))) {
      add('mismatch', field, 'package-lock.json', lockedRoot[field], manifest[field], `Lockfile root ${field} differs from package.json.`)
    } else {
      cover(field, 'verified', ['package.json', 'package-lock.json'], `Root ${field} agrees.`)
    }
  }
} else {
  cover('lockfile', 'unsupported', ['package.json'], 'No package-lock.json was found; inspect the repository package manager separately.')
}

const readme = readText(path.join(root, 'README.md'))
const repo = normalizeRepository(repositoryUrl(manifest.repository))
if (readme !== null) {
  checked.push('README.md')
  if (manifest.name && !readme.includes(manifest.name)) {
    add('missing', 'name', 'README.md', null, manifest.name, 'README does not mention the package name.')
  }
  if (repo && !readme.includes(repo)) {
    add('missing', 'repository', 'README.md', null, repo, 'README does not mention the canonical repository URL.')
  }

  const versionClaims = [...readme.matchAll(/(?:\bversion\b|\brelease\b|\bstable\s*[·:-])\s*(?:version\s*)?v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/gi)].map((match) => match[1])
  if (manifest.version && versionClaims.length && !versionClaims.includes(manifest.version)) {
    add('stale', 'version', 'README.md', [...new Set(versionClaims)], manifest.version, 'README contains explicit release/version claims but none match package.json.')
  } else if (manifest.version && versionClaims.includes(manifest.version)) {
    cover('version', 'verified', ['package.json', 'README.md'], 'An explicit README release/version claim matches package.json.')
  } else {
    cover('version', 'manual-review', ['package.json', 'README.md'], 'README has no unambiguous release/version claim; badges and dependency versions are intentionally ignored.')
  }

  if (manifest.description) {
    cover(
      'description',
      readme.includes(manifest.description) ? 'verified-exact' : 'manual-review',
      ['package.json', 'README.md'],
      readme.includes(manifest.description)
        ? 'README contains the exact package description.'
        : 'Description equivalence is semantic and requires review; exact prose is not required.',
    )
  } else {
    cover('description', 'unsupported', ['package.json'], 'package.json does not define a description.')
  }

  for (const [field, values] of [
    ['homepage', urlValues(manifest.homepage)],
    ['bugs', urlValues(manifest.bugs)],
    ['funding', urlValues(manifest.funding)],
  ]) {
    if (!values.length) {
      cover(field, 'unsupported', ['package.json'], `package.json does not define a canonical ${field} URL.`)
    } else {
      const missing = values.filter((value) => !readme.includes(value))
      cover(
        field,
        missing.length ? 'not-represented' : 'verified',
        ['package.json', 'README.md'],
        missing.length ? `README does not repeat ${missing.length} canonical ${field} URL(s); decide whether that surface should expose them.` : `README contains the canonical ${field} URL(s).`,
      )
    }
  }

  const bins = binNames(manifest.bin, manifest.name)
  if (bins.length) {
    const installLines = readme
      .split('\n')
      .filter((line) => /\b(?:npx|npm\s+exec|pnpm\s+dlx|yarn\s+dlx|bunx)\b/.test(line))
    const missingBins = bins.filter((name) => !installLines.some((line) => line.includes(name)))
    if (missingBins.length) {
      add('missing', 'install-command', 'README.md', installLines, missingBins, 'README install-command lines do not mention every package binary.')
    } else {
      cover('install-command', 'verified', ['package.json', 'README.md'], `README has an executable install command for: ${bins.join(', ')}.`)
    }
  } else {
    cover('install-command', 'unsupported', ['package.json'], 'No object-form package bin map defines an executable to verify.')
  }

  if (manifest.engines) {
    const engineTokens = Object.values(manifest.engines).filter((value) => typeof value === 'string')
    cover(
      'compatibility',
      engineTokens.some((token) => readme.includes(token)) ? 'verified-literal' : 'manual-review',
      ['package.json', 'README.md'],
      'Runtime compatibility wording may differ from semver engine syntax; review semantic agreement.',
    )
  } else {
    cover('compatibility', 'unsupported', ['package.json'], 'No engines field provides an authoritative runtime compatibility boundary.')
  }
} else {
  cover('README', 'unsupported', ['package.json'], 'No README.md was found, so documentation metadata cannot be compared.')
}

const skillCandidates = [
  path.join(root, 'SKILL.md'),
  manifest.name ? path.join(root, 'skills', manifest.name.replace(/^@[^/]+\//, ''), 'SKILL.md') : null,
].filter(Boolean)
for (const file of skillCandidates) {
  const text = readText(file)
  if (text === null) continue
  const relative = path.relative(root, file)
  checked.push(relative)
  const meta = frontmatter(text)
  const expected = manifest.name.replace(/^@[^/]+\//, '')
  if (meta.name && meta.name !== expected) {
    add('mismatch', 'name', relative, meta.name, expected, 'Skill name differs from the unscoped package name.')
  }
  if (meta.description && manifest.description) {
    cover('skill-description', meta.description === manifest.description ? 'verified-exact' : 'manual-review', ['package.json', relative], 'Skill descriptions include trigger context, so semantic equivalence requires review.')
  }
}

const result = {
  root,
  authority: {
    source: 'package.json',
    name: manifest.name ?? null,
    version: manifest.version ?? null,
    description: manifest.description ?? null,
    repository: repo ?? null,
    homepage: manifest.homepage ?? null,
    bugs: manifest.bugs ?? null,
    funding: manifest.funding ?? null,
    bin: manifest.bin ?? null,
    engines: manifest.engines ?? null,
  },
  checked: [...new Set(checked)],
  findings,
  coverage,
  scope: 'Deterministic comparisons only. Review coverage entries marked manual-review, not-represented, not-repeated, or unsupported before declaring global metadata consistency.',
}

if (jsonOutput) {
  console.log(JSON.stringify(result, null, 2))
} else {
  console.log(`Metadata audit: ${root}`)
  console.log(`Authority: package.json (${manifest.name ?? 'unnamed'} ${manifest.version ?? 'unversioned'})`)
  console.log(`Checked: ${result.checked.join(', ')}`)
  if (!findings.length) console.log('Deterministic findings: none')
  for (const finding of findings) {
    console.log(`[${finding.kind.toUpperCase()}] ${finding.file} ${finding.field}: ${JSON.stringify(finding.actual)} -> ${JSON.stringify(finding.expected)}`)
  }
  const unresolved = coverage.filter((item) => !item.status.startsWith('verified'))
  console.log(`Coverage requiring review: ${unresolved.length}`)
  for (const item of unresolved) console.log(`[${item.status.toUpperCase()}] ${item.field}: ${item.message}`)
}

if (strict && findings.length) process.exitCode = 1
