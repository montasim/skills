import assert from 'node:assert/strict'
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const verifier = new URL('../skills/verify-github-npm-release/scripts/verify-release.mjs', import.meta.url)

test('classifies a timed-out Git subprocess as blocked', () => {
  const root = mkdtempSync(join(tmpdir(), 'release-timeout-'))
  const bin = join(root, 'bin')
  mkdirSync(bin)
  const fakeGit = join(bin, 'git')
  writeFileSync(fakeGit, '#!/bin/sh\nsleep 2\n')
  chmodSync(fakeGit, 0o755)
  const env = { ...process.env, PATH: `${bin}:${process.env.PATH}` }
  delete env.NODE_TEST_CONTEXT

  try {
    const result = spawnSync(process.execPath, [
      verifier.pathname,
      '--path', root,
      '--repo', 'example/fixture',
      '--package', 'fixture-cli',
      '--version', '1.2.3',
      '--install-command', 'npx --yes --package=fixture-cli@1.2.3 fixture-cli',
      '--timeout-ms', '100',
      '--offline',
      '--json',
    ], { encoding: 'utf8', env })
    assert.equal(result.status, 2, JSON.stringify({ stdout: result.stdout, stderr: result.stderr, error: result.error?.message }))
    const report = JSON.parse(result.stdout)
    assert.equal(report.verdict, 'blocked')
    const localGit = report.checks.find((item) => item.id === 'local-git')
    assert.equal(localGit.state, 'blocked')
    assert.match(localGit.detail, /timed out after 100ms/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
