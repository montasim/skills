#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { evaluateInstallCommand, runCommand } from './release-checks.mjs'

const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: node verify-release.mjs --repo <owner/name> --package <name> --version <semver> [options]

Options:
  --tag <tag>                 Expected Git tag (default: v<version>)
  --dist-tag <name>           Expected npm dist-tag (default: latest)
  --install-command <text>    Advertised npx/npm exec command to validate
  --catalog <file>            Local JSON catalog to check for aligned identifiers
  --path <directory>          Local repository path (default: current directory)
  --timeout-ms <milliseconds> Per-command timeout (default: 15000)
  --offline                   Skip GitHub and npm checks; local preflight only
  --json                      Print JSON only

This command is read-only. It never executes the published package.`)
  process.exit(0)
}

function value(flag, fallback = null) {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : args[index + 1]
}

const repo = value('--repo')
const packageName = value('--package')
const version = value('--version')
const tag = value('--tag', version ? `v${version}` : null)
const distTag = value('--dist-tag', 'latest')
const installCommand = value('--install-command')
const catalog = value('--catalog')
const cwd = resolve(value('--path', process.cwd()))
const offline = args.includes('--offline')
const jsonOnly = args.includes('--json')
const timeoutMs = Number(value('--timeout-ms', '15000'))

if (!repo || !packageName || !version || !/^[^/\s]+\/[^/\s]+$/.test(repo) || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version) || !Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 120000) {
  console.error('Required: --repo owner/name --package name --version semver')
  process.exit(2)
}

function run(command, commandArgs) {
  return runCommand(command, commandArgs, { cwd, timeoutMs })
}

const checks = []
const check = (id, state, expected, observed, source, detail = null) => {
  checks.push({ id, state, expected, observed, source, ...(detail ? { detail } : {}) })
}

const gitRoot = run('git', ['rev-parse', '--show-toplevel'])
let localCommit = null
let tagCommit = null
if (!gitRoot.ok) {
  check('local-git', 'blocked', 'Git repository', null, 'git rev-parse', gitRoot.detail)
} else {
  const head = run('git', ['rev-parse', 'HEAD'])
  const localTag = run('git', ['rev-parse', `${tag}^{commit}`])
  const status = run('git', ['status', '--porcelain=v1'])
  const upstream = run('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])
  localCommit = head.ok ? head.stdout : null
  tagCommit = localTag.ok ? localTag.stdout : null
  check('local-tag', localTag.timedOut ? 'blocked' : localTag.ok ? 'pass' : 'fail', tag, tagCommit, `git rev-parse ${tag}^{commit}`, localTag.detail || null)
  check('working-tree', status.timedOut ? 'blocked' : status.ok && status.stdout === '' ? 'pass' : 'warning', 'clean', status.ok ? status.stdout || 'clean' : null, 'git status --porcelain=v1', status.detail || null)
  if (!upstream.ok) {
    check('upstream', 'blocked', 'configured upstream', null, 'git rev-parse @{u}', upstream.detail)
    check('remote-identity', 'blocked', repo, null, 'Git remote', 'Upstream is unresolved.')
  } else {
    const upstreamCommit = run('git', ['rev-parse', '@{u}'])
    check('upstream', upstreamCommit.timedOut ? 'blocked' : upstreamCommit.ok && upstreamCommit.stdout === localCommit ? 'pass' : 'fail', localCommit, upstreamCommit.stdout || null, `git rev-parse ${upstream.stdout}`, upstreamCommit.detail || null)
    const remoteName = upstream.stdout.split('/')[0]
    const remoteUrl = run('git', ['remote', 'get-url', remoteName])
    const normalized = remoteUrl.stdout.replace(/\.git$/, '').replace(/^git@github\.com:/, 'https://github.com/')
    check('remote-identity', remoteUrl.timedOut ? 'blocked' : remoteUrl.ok && normalized.endsWith(`github.com/${repo}`) ? 'pass' : 'fail', repo, remoteUrl.stdout || null, `git remote get-url ${remoteName}`, remoteUrl.detail || null)
  }
}

let npmMetadata = null
if (offline) {
  check('github-tag', 'warning', tag, null, '--offline', 'Network check skipped.')
  check('github-release', 'warning', `published release ${tag}`, null, '--offline', 'Network check skipped.')
  check('npm-version', 'warning', version, null, '--offline', 'Registry check skipped.')
  check('npm-dist-tag', 'warning', `${distTag} -> ${version}`, null, '--offline', 'Registry check skipped.')
  check('ci', 'warning', `successful run for ${tagCommit || tag}`, null, '--offline', 'Network check skipped.')
} else {
  const remoteTag = run('gh', ['api', `repos/${repo}/git/ref/tags/${encodeURIComponent(tag)}`])
  if (!remoteTag.ok) {
    check('github-tag', 'blocked', tag, null, `gh api repos/${repo}/git/ref/tags/${tag}`, remoteTag.detail)
  } else {
    try {
      const parsed = JSON.parse(remoteTag.stdout)
      let remoteCommit = parsed.object?.sha || null
      if (parsed.object?.type === 'tag' && remoteCommit) {
        const annotated = run('gh', ['api', `repos/${repo}/git/tags/${remoteCommit}`])
        if (!annotated.ok) throw new Error(annotated.detail || 'Could not dereference annotated tag.')
        remoteCommit = JSON.parse(annotated.stdout).object?.sha || null
      }
      const state = tagCommit && remoteCommit === tagCommit ? 'pass' : tagCommit ? 'fail' : 'blocked'
      check('github-tag', state, tagCommit || tag, remoteCommit, `https://github.com/${repo}/tree/${tag}`)
    } catch (error) {
      check('github-tag', 'blocked', tag, null, 'GitHub API', error.message)
    }
  }

  const release = run('gh', ['api', `repos/${repo}/releases/tags/${encodeURIComponent(tag)}`])
  if (!release.ok) {
    check('github-release', 'blocked', `published release ${tag}`, null, `gh api repos/${repo}/releases/tags/${tag}`, release.detail)
  } else {
    try {
      const parsed = JSON.parse(release.stdout)
      const state = parsed.draft ? 'fail' : 'pass'
      check('github-release', state, 'non-draft release', parsed.draft ? 'draft' : parsed.prerelease ? 'prerelease' : 'published', parsed.html_url)
    } catch (error) {
      check('github-release', 'blocked', `published release ${tag}`, null, 'GitHub API', error.message)
    }
  }

  const npm = run('npm', ['view', `${packageName}@${version}`, 'version', 'bin', 'dist-tags', '--json'])
  if (!npm.ok) {
    check('npm-version', npm.timedOut ? 'blocked' : /E404/.test(npm.stderr) ? 'fail' : 'blocked', version, null, `npm view ${packageName}@${version}`, npm.detail)
    check('npm-dist-tag', 'blocked', `${distTag} -> ${version}`, null, 'npm registry', 'Package metadata unavailable.')
  } else {
    try {
      npmMetadata = JSON.parse(npm.stdout)
      check('npm-version', npmMetadata.version === version ? 'pass' : 'fail', version, npmMetadata.version || null, `https://www.npmjs.com/package/${packageName}/v/${version}`)
      check('npm-dist-tag', npmMetadata['dist-tags']?.[distTag] === version ? 'pass' : 'fail', version, npmMetadata['dist-tags']?.[distTag] || null, `npm view ${packageName} dist-tags`)
    } catch (error) {
      check('npm-version', 'blocked', version, null, 'npm registry', error.message)
      check('npm-dist-tag', 'blocked', version, null, 'npm registry', error.message)
    }
  }

  if (tagCommit) {
    const runs = run('gh', ['run', 'list', '--repo', repo, '--commit', tagCommit, '--limit', '20', '--json', 'workflowName,status,conclusion,url,headSha'])
    if (!runs.ok) {
      check('ci', 'blocked', `successful run for ${tagCommit}`, null, 'gh run list', runs.detail)
    } else {
      try {
        const parsed = JSON.parse(runs.stdout)
        const successful = parsed.find((item) => item.headSha === tagCommit && item.conclusion === 'success')
        check('ci', successful ? 'pass' : parsed.length ? 'fail' : 'warning', `successful run for ${tagCommit}`, successful?.url || (parsed.length ? 'runs found without success' : 'no runs found'), successful?.url || 'GitHub Actions')
      } catch (error) {
        check('ci', 'blocked', `successful run for ${tagCommit}`, null, 'GitHub Actions', error.message)
      }
    }
  } else {
    check('ci', 'blocked', `successful run for ${tag}`, null, 'local tag', 'Released commit is unresolved.')
  }
}

if (installCommand) {
  const result = evaluateInstallCommand({ installCommand, packageName, version, distTag, npmMetadata })
  check('install-command', result.state, `immutable ${packageName}@${version} or verified ${packageName}@${distTag} alias, plus a published bin`, installCommand, 'advertised install command', result.detail)
} else {
  check('install-command', 'warning', `command for ${packageName}@${version}`, null, 'input', 'No advertised install command supplied.')
}

if (catalog) {
  const path = resolve(cwd, catalog)
  if (!existsSync(path)) {
    check('catalog', 'blocked', `${repo}, ${packageName}, ${version}`, null, path, 'Catalog file does not exist.')
  } else {
    try {
      const text = readFileSync(path, 'utf8')
      JSON.parse(text)
      const missing = [repo, packageName, version].filter((token) => !text.includes(token))
      check('catalog', missing.length ? 'fail' : 'pass', `${repo}, ${packageName}, ${version}`, missing.length ? `missing: ${missing.join(', ')}` : 'aligned identifiers present', path)
    } catch (error) {
      check('catalog', 'blocked', 'valid JSON catalog', null, path, error.message)
    }
  }
}

const critical = ['local-git', 'local-tag', 'upstream', 'remote-identity', 'github-tag', 'github-release', 'npm-version', 'npm-dist-tag', 'install-command']
const workflowDirectory = resolve(cwd, '.github/workflows')
if (existsSync(workflowDirectory) && readdirSync(workflowDirectory).some((name) => /\.ya?ml$/i.test(name))) critical.push('ci')
if (catalog) critical.push('catalog')
const criticalChecks = checks.filter((item) => critical.includes(item.id))
const verdict = criticalChecks.some((item) => item.state === 'fail')
  ? 'not verified'
  : criticalChecks.some((item) => item.state === 'blocked')
    ? 'blocked'
    : offline || criticalChecks.some((item) => item.state === 'warning')
      ? 'incomplete'
      : 'verified'

const report = {
  verdict,
  release: { repo, package: packageName, version, tag, distTag, localCommit, tagCommit },
  checks,
  boundary: 'Read-only audit; the published package was not executed and no state was changed.',
}

if (jsonOnly) console.log(JSON.stringify(report, null, 2))
else {
  console.log(`Release audit: ${verdict}`)
  console.log(`${repo} · ${packageName}@${version} · ${tag}`)
  for (const item of checks) console.log(`- ${item.state.toUpperCase()} ${item.id}: ${item.observed ?? item.detail ?? 'no evidence'}`)
  console.log('\nNo files, tags, releases, packages, or GitHub settings were changed.')
}

process.exit(verdict === 'verified' || verdict === 'incomplete' ? 0 : verdict === 'not verified' ? 1 : 2)
