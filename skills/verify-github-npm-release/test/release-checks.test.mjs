import assert from 'node:assert/strict'
import test from 'node:test'

import { evaluateInstallCommand, runCommand } from '../skills/verify-github-npm-release/scripts/release-checks.mjs'

const metadata = {
  version: '1.2.3',
  bin: { 'fixture-cli': 'bin/fixture.js' },
  'dist-tags': { latest: '1.2.3', next: '2.0.0-beta.1' },
}

test('terminates a subprocess at the configured timeout', () => {
  const result = runCommand(
    process.execPath,
    ['-e', 'setTimeout(() => {}, 1000)'],
    { cwd: process.cwd(), timeoutMs: 100 },
  )
  assert.equal(result.ok, false)
  assert.equal(result.timedOut, true)
  assert.match(result.detail, /timed out after 100ms/)
})

test('passes an immutable exact-version install command', () => {
  const result = evaluateInstallCommand({
    installCommand: 'npx --yes --package=fixture-cli@1.2.3 fixture-cli',
    packageName: 'fixture-cli',
    version: '1.2.3',
    distTag: 'latest',
    npmMetadata: metadata,
  })
  assert.equal(result.state, 'pass')
})

test('reports a verified dist-tag alias as conditional', () => {
  const result = evaluateInstallCommand({
    installCommand: 'npx --yes --package=fixture-cli@latest fixture-cli',
    packageName: 'fixture-cli',
    version: '1.2.3',
    distTag: 'latest',
    npmMetadata: metadata,
  })
  assert.equal(result.state, 'warning')
  assert.match(result.detail, /currently resolves to 1\.2\.3/)
})

test('accepts direct npx package shorthand with a verified mutable alias', () => {
  const result = evaluateInstallCommand({
    installCommand: 'npx --yes fix-social-link-previews@latest --target codex',
    packageName: 'fix-social-link-previews',
    version: '0.1.0',
    distTag: 'latest',
    npmMetadata: {
      version: '0.1.0',
      bin: { 'fix-social-link-previews': 'bin/fix-social-link-previews.js' },
      'dist-tags': { latest: '0.1.0' },
    },
  })
  assert.equal(result.state, 'warning')
  assert.match(result.detail, /currently resolves to 0\.1\.0/)
})

test('fails a dist-tag alias that does not resolve to the release', () => {
  const result = evaluateInstallCommand({
    installCommand: 'npx --yes --package=fixture-cli@next fixture-cli',
    packageName: 'fixture-cli',
    version: '1.2.3',
    distTag: 'next',
    npmMetadata: metadata,
  })
  assert.equal(result.state, 'fail')
})
