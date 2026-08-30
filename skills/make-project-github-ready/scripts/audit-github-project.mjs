#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: node audit-github-project.mjs [--path <directory>] [--json]

Read-only local inventory of repository files, obvious filename risks, package metadata, and selected CI text patterns. No network requests or writes are made; policy quality and secret contents are not verified.`)
  process.exit(0)
}

function value(flag, fallback) {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : args[index + 1]
}

const root = resolve(value('--path', process.cwd()))
const jsonOnly = args.includes('--json')
const findings = []
const add = (level, check, message, path) => findings.push({ level, check, message, ...(path ? { path } : {}) })

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: root, encoding: 'utf8' })
  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  }
}

function file(path) {
  return existsSync(join(root, path))
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'))
  } catch (error) {
    add('error', path, `Could not parse JSON: ${error.message}`)
    return null
  }
}

function minimumNodeMajor(range) {
  if (typeof range !== 'string') return null
  const candidates = []
  for (const branch of range.split('||')) {
    const match = branch.trim().match(/^(?:>=|\^|~)?\s*(\d+)(?:(?:\.\d+){0,2}|\.x)?(?:\s|$)/)
    if (match) candidates.push(Number(match[1]))
  }
  return candidates.length ? Math.min(...candidates) : null
}

function listFiles(directory, depth = 0) {
  const absolute = join(root, directory)
  if (!existsSync(absolute) || depth > 3) return []
  const output = []
  for (const entry of readdirSync(absolute)) {
    if (['.git', 'node_modules', 'dist', 'build', '.next', 'coverage', 'vendor'].includes(entry)) continue
    const path = join(absolute, entry)
    const rel = relative(root, path)
    if (statSync(path).isDirectory()) output.push(...listFiles(rel, depth + 1))
    else output.push(rel)
  }
  return output.sort()
}

if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`Directory does not exist: ${root}`)
  process.exit(2)
}

const packageJson = file('package.json') ? readJson('package.json') : null
const manifests = [
  'package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'composer.json',
].filter(file)
const community = [
  'CONTRIBUTING.md', 'SECURITY.md', 'SUPPORT.md', 'CODE_OF_CONDUCT.md',
  '.github/CONTRIBUTING.md', '.github/SECURITY.md', '.github/SUPPORT.md',
  '.github/CODE_OF_CONDUCT.md', '.github/PULL_REQUEST_TEMPLATE.md',
].filter(file)
const workflows = listFiles('.github/workflows').filter((path) => /\.ya?ml$/i.test(path))
const workflowSources = workflows.map((path) => ({
  path,
  source: readFileSync(join(root, path), 'utf8'),
}))
const suspicious = listFiles('.').filter((path) => {
  if (path.startsWith('.git/') || path.startsWith('node_modules/')) return false
  if (/(^|\/)\.env\.(example|sample|template)$/i.test(path)) return false
  return /(^|\/)(\.env($|\.)|id_rsa$|id_ed25519$)|\.(pem|p12|pfx|key)$/i.test(path)
})
const communityDocs = [
  'README.md', ...community,
].filter((path, index, all) => all.indexOf(path) === index)

for (const path of communityDocs) {
  const source = readFileSync(join(root, path), 'utf8')
  if (/(?:after|once|when)\s+(?:the\s+)?(?:github\s+)?repo(?:sitory)?\s+(?:is|has been|gets)\s+published/i.test(source)) {
    add('warning', 'stale-publication-wording', 'Documentation still describes the repository as awaiting publication.', path)
  }
}

const gitRoot = run('git', ['rev-parse', '--show-toplevel'])
const isGit = gitRoot.ok
let git = { repository: false }
if (isGit) {
  const branch = run('git', ['branch', '--show-current'])
  const status = run('git', ['status', '--porcelain=v1'])
  const remotes = run('git', ['remote', '-v'])
  const head = run('git', ['rev-parse', 'HEAD'])
  git = {
    repository: true,
    root: gitRoot.stdout,
    branch: branch.stdout || null,
    head: head.ok ? head.stdout : null,
    clean: status.ok && status.stdout === '',
    changes: status.stdout ? status.stdout.split('\n') : [],
    remotes: remotes.stdout ? remotes.stdout.split('\n') : [],
  }
  if (!git.branch) add('warning', 'default-branch', 'HEAD is detached or the current branch could not be resolved.')
  if (!git.clean) add('notice', 'working-tree', 'The working tree has local changes; preserve and review them before committing.')
  if (git.remotes.length === 0) add('notice', 'remote', 'No Git remote is configured.')
} else {
  add('warning', 'git', 'The target is not a Git repository.')
}

if (manifests.length === 0) add('warning', 'manifest', 'No recognized project manifest was found.')
if (!file('README.md')) add('warning', 'readme', 'README.md is missing.')
if (!file('LICENSE') && !file('LICENSE.md') && !file('COPYING')) {
  add('notice', 'license', 'No license file was found; obtain an explicit licensing decision before adding one.')
}
if (!file('SECURITY.md') && !file('.github/SECURITY.md')) {
  add('notice', 'security-policy', 'No security policy was found.')
}
if (workflows.length === 0) add('notice', 'ci', 'No GitHub Actions workflow was found.')
if (suspicious.length > 0) {
  add('warning', 'sensitive-files', `Review possible credential files before making the repository public: ${suspicious.join(', ')}`)
}

if (packageJson) {
  if (!packageJson.name) add('warning', 'package-name', 'package.json has no name.')
  if (!packageJson.description) add('notice', 'description', 'package.json has no description.')
  const repository = typeof packageJson.repository === 'string'
    ? packageJson.repository
    : packageJson.repository?.url
  if (!repository) add('notice', 'repository-url', 'package.json has no repository URL.')
  if (packageJson.homepage && !/^https?:\/\//.test(packageJson.homepage)) {
    add('warning', 'homepage', 'package.json homepage is not an absolute HTTP(S) URL.')
  }

  const packageLock = file('package-lock.json')
  if (packageLock && workflowSources.length > 0) {
    const usesNpmCi = workflowSources.some(({ source }) => /\bnpm\s+ci(?:\s|$)/m.test(source))
    const usesNpmInstall = workflowSources.some(({ source }) => /\bnpm\s+(?:install|i)(?:\s|$)/m.test(source))
    if (!usesNpmCi) {
      add(
        usesNpmInstall ? 'warning' : 'notice',
        'ci-lockfile-install',
        usesNpmInstall
          ? 'package-lock.json exists, but CI text uses npm install instead of the deterministic npm ci command.'
          : 'package-lock.json exists, but no npm ci command was found in GitHub Actions workflow text.',
      )
    }
  }

  const engineRange = packageJson.engines?.node
  const minimum = minimumNodeMajor(engineRange)
  if (engineRange && workflowSources.length > 0) {
    if (minimum === null) {
      add('notice', 'ci-node-coverage', `Could not derive a minimum Node major from engines.node=${JSON.stringify(engineRange)}.`)
    } else {
      const majors = new Set()
      for (const { source } of workflowSources) {
        for (const match of source.matchAll(/node-version\s*:\s*['"]?(\d+)/g)) majors.add(Number(match[1]))
        for (const match of source.matchAll(/(?:node|node-version)\s*:\s*\[([^\]]+)\]/g)) {
          for (const number of match[1].match(/\d+/g) || []) majors.add(Number(number))
        }
      }
      if (majors.size === 0) {
        add('notice', 'ci-node-coverage', `engines.node declares ${engineRange}, but no literal CI Node major could be resolved from workflow text.`)
      } else if (!majors.has(minimum)) {
        add('warning', 'ci-node-coverage', `engines.node supports Node ${minimum}, but CI workflow text covers only: ${[...majors].sort((a, b) => a - b).join(', ')}.`)
      }
    }
  }
}

const report = {
  root,
  status: findings.some((item) => item.level === 'error')
    ? 'blocked'
    : findings.some((item) => item.level === 'warning')
      ? 'needs-attention'
      : 'ready-for-review',
  project: {
    manifests,
    package: packageJson && {
      name: packageJson.name || null,
      description: packageJson.description || null,
      repository: packageJson.repository || null,
      homepage: packageJson.homepage || null,
      scripts: packageJson.scripts || {},
    },
  },
  git,
  files: { community, workflows, suspicious },
  findings,
  auditScope: {
    checked: [
      'recognized file presence',
      'obvious sensitive filename patterns',
      'package metadata and package-lock presence',
      'literal npm install and Node-version patterns in GitHub Actions text',
      'stale pre-publication wording in known community documents',
    ],
    notProven: [
      'community-policy completeness or correctness',
      'absence of secrets or sensitive content',
      'workflow semantics or runtime success',
      'GitHub repository identity, ownership, settings, or remote state',
    ],
  },
  boundary: 'Local read-only file and text-pattern audit; no GitHub requests or filesystem writes performed. Manually inspect policy content, secrets, CI behavior, and remote GitHub state.',
}

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`GitHub project audit: ${report.status}`)
  console.log(`Path: ${root}`)
  console.log(`Git: ${git.repository ? `${git.branch || 'detached'} @ ${git.head || 'unknown'}` : 'not detected'}`)
  console.log(`Workflows: ${workflows.length}; community files: ${community.length}`)
  for (const item of findings) console.log(`- ${item.level.toUpperCase()} ${item.check}: ${item.message}`)
  console.log('\nNo files or GitHub settings were changed.')
}

process.exit(findings.some((item) => item.level === 'error') ? 2 : 0)
