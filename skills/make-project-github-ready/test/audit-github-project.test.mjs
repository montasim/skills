import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const auditor = new URL('../skills/make-project-github-ready/scripts/audit-github-project.mjs', import.meta.url)

function write(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}

function fixture({ workflow, support }) {
  const root = mkdtempSync(join(tmpdir(), 'github-project-audit-'))
  write(root, 'package.json', JSON.stringify({
    name: 'fixture-project',
    version: '1.0.0',
    description: 'Fixture project.',
    engines: { node: '>=18' },
  }))
  write(root, 'package-lock.json', JSON.stringify({
    name: 'fixture-project',
    version: '1.0.0',
    lockfileVersion: 3,
    packages: { '': { name: 'fixture-project', version: '1.0.0' } },
  }))
  write(root, 'README.md', '# Fixture\n')
  write(root, 'SECURITY.md', '# Security\n')
  write(root, 'SUPPORT.md', support)
  write(root, '.github/workflows/ci.yml', workflow)
  return root
}

function audit(root) {
  const env = { ...process.env }
  delete env.NODE_TEST_CONTEXT
  const result = spawnSync(process.execPath, [auditor.pathname, '--path', root, '--json'], { encoding: 'utf8', env })
  assert.equal(result.status, 0, result.stderr)
  assert.ok(result.stdout.trim(), JSON.stringify({ stderr: result.stderr, error: result.error?.message }))
  return JSON.parse(result.stdout)
}

test('detects nondeterministic CI install, missing minimum Node coverage, and stale wording', () => {
  const root = fixture({
    workflow: 'jobs:\n  test:\n    steps:\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n      - run: npm install\n',
    support: '# Support\n\nUse GitHub Issues after the repository is published.\n',
  })
  try {
    const report = audit(root)
    const codes = report.findings.map((item) => item.check)
    assert.ok(codes.includes('ci-lockfile-install'))
    assert.ok(codes.includes('ci-node-coverage'))
    assert.ok(codes.includes('stale-publication-wording'))
    assert.ok(report.auditScope.notProven.includes('absence of secrets or sensitive content'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('accepts npm ci and explicit coverage of the minimum supported Node major', () => {
  const root = fixture({
    workflow: 'jobs:\n  test:\n    strategy:\n      matrix:\n        node: [18, 20, 22]\n    steps:\n      - uses: actions/setup-node@v4\n        with:\n          node-version: ${{ matrix.node }}\n      - run: npm ci\n',
    support: '# Support\n\nUse GitHub Issues for confirmed bugs.\n',
  })
  try {
    const report = audit(root)
    const codes = report.findings.map((item) => item.check)
    assert.ok(!codes.includes('ci-lockfile-install'))
    assert.ok(!codes.includes('ci-node-coverage'))
    assert.ok(!codes.includes('stale-publication-wording'))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
