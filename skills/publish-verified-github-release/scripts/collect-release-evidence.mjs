#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const usage = `Usage: collect-release-evidence.mjs [repository-root] [--tag <tag>] [--base <ref>]

Collect local Git and package evidence for release-note drafting.

Options:
  --tag <tag>  Inspect the specified release tag.
  --base <ref> Set the comparison base.
  -h, --help   Show this help.`

function parseArgs(argv) {
  const parsed = { root: '.', targetTag: null, explicitBase: null }
  let hasRoot = false
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') return { help: true }
    if (arg === '--tag' || arg === '--base') {
      const value = argv[index + 1]
      if (!value || value.startsWith('-')) throw new Error(`${arg} requires a value.`)
      if (arg === '--tag') parsed.targetTag = value
      else parsed.explicitBase = value
      index += 1
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`)
    } else if (hasRoot) {
      throw new Error('Expected at most one repository-root argument.')
    } else {
      parsed.root = arg
      hasRoot = true
    }
  }
  return parsed
}

let parsedArgs
try {
  parsedArgs = parseArgs(process.argv.slice(2))
} catch (error) {
  console.error(error.message)
  console.error(usage)
  process.exit(2)
}
if (parsedArgs.help) {
  console.log(usage)
  process.exit(0)
}
const root = path.resolve(parsedArgs.root)

function git(command, { optional = false } = {}) {
  try {
    return execFileSync('git', command, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (error) {
    if (optional) return null
    const detail = error.stderr?.toString().trim() || error.message
    throw new Error(`git ${command.join(' ')} failed: ${detail}`)
  }
}

function parseJson(text, label) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Cannot parse ${label}: ${error.message}`)
  }
}

try {
  const repositoryRoot = git(['rev-parse', '--show-toplevel'])
  const { targetTag, explicitBase } = parsedArgs
  const head = git(['rev-parse', 'HEAD'])
  const branch = git(['branch', '--show-current'], { optional: true })
  const remote = git(['remote', 'get-url', 'origin'], { optional: true })
  const status = git(['status', '--porcelain'])
  const latestTag = git(['describe', '--tags', '--abbrev=0'], { optional: true })

  const targetCommit = targetTag
    ? git(['rev-parse', '--verify', '--quiet', `${targetTag}^{commit}`], { optional: true })
    : head
  if (targetTag && !targetCommit) {
    console.error(`Requested tag does not exist or is not a commit: ${targetTag}`)
    process.exit(2)
  }

  const targetRef = targetTag ?? 'HEAD'
  let base = explicitBase
  if (base && !git(['rev-parse', '--verify', '--quiet', `${base}^{commit}`], { optional: true })) {
    console.error(`Requested base does not exist or is not a commit: ${base}`)
    process.exit(2)
  }
  if (!base && targetTag) {
    base = git(['describe', '--tags', '--abbrev=0', `${targetTag}^`], { optional: true })
  }
  if (!base && !targetTag && latestTag) base = latestTag

  const range = base ? `${base}..${targetRef}` : targetRef
  const logFormat = '%H%x09%h%x09%s%x09%an'
  const logText = git(['log', '--no-merges', `--format=${logFormat}`, range], { optional: true }) ?? ''
  const commits = logText
    ? logText.split('\n').map((line) => {
        const [sha, shortSha, subject, author] = line.split('\t')
        return { sha, shortSha, subject, author }
      })
    : []

  const relativePackage = path.relative(repositoryRoot, path.join(root, 'package.json')).split(path.sep).join('/')
  const packageText = git(['show', `${targetRef}:${relativePackage}`], { optional: true })
  const manifest = parseJson(packageText, `${targetRef}:${relativePackage}`)
  const changelogNames = ['CHANGELOG.md', 'CHANGELOG', 'HISTORY.md', 'RELEASES.md']
  const changelogs = changelogNames.filter((name) => fs.existsSync(path.join(root, name)))

  const evidence = {
    repository: {
      root: repositoryRoot,
      packageRoot: root,
      remote,
      branch,
      head,
      clean: status.length === 0,
      changedPaths: status ? status.split('\n') : [],
    },
    release: {
      targetTag,
      targetRef,
      targetCommit,
      latestTag,
      base,
      range,
      targetTagExists: Boolean(targetTag),
    },
    package: manifest
      ? {
          source: `${targetRef}:${relativePackage}`,
          name: manifest.name ?? null,
          version: manifest.version ?? null,
          description: manifest.description ?? null,
          repository: manifest.repository ?? null,
          homepage: manifest.homepage ?? null,
          engines: manifest.engines ?? null,
          scripts: manifest.scripts ?? {},
        }
      : null,
    changelogs,
    commits,
    caveats: [
      'Package metadata is read from the requested target ref, not the working tree.',
      'Changelog names indicate working-tree files; inspect target content before quoting it.',
      'Test scripts are listed but not executed by this collector.',
      'Remote GitHub release state and package-registry state are not queried.',
    ],
  }

  console.log(JSON.stringify(evidence, null, 2))
} catch (error) {
  console.error(error.message)
  process.exit(2)
}
