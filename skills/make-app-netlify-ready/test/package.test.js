import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cli = path.join(root, 'bin', 'make-app-netlify-ready.js')
const run = (args, options = {}) => spawnSync(process.execPath, [cli, ...args], { cwd: options.cwd || root, env: { ...process.env, ...options.env }, encoding: 'utf8' })

test('package contract contains only publishable payload roots', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.bin['make-app-netlify-ready'], 'bin/make-app-netlify-ready.js')
  assert.deepEqual(pkg.files, ['bin/', 'skills/'])
  assert.equal(pkg.engines.node, '>=18')
  assert.ok(fs.existsSync(path.join(root, 'skills/make-app-netlify-ready/SKILL.md')))
})

test('help, version, and required target behave predictably', () => {
  assert.match(run(['--help']).stdout, /--target/)
  assert.equal(run(['--version']).stdout.trim(), '0.1.0')
  const missing = run([])
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /--target is required/)
})

test('project installation, refusal, force, and dry-run work', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'netlify-skill-project-'))
  try {
    const first = run(['--target', 'codex', '--scope', 'project'], { cwd: project })
    assert.equal(first.status, 0, first.stderr)
    const installed = path.join(project, '.agents/skills/make-app-netlify-ready/SKILL.md')
    assert.ok(fs.existsSync(installed))
    assert.equal(run(['--target', 'codex', '--scope', 'project'], { cwd: project }).status, 1)
    fs.writeFileSync(installed, 'stale')
    assert.equal(run(['--target', 'codex', '--scope', 'project', '--force'], { cwd: project }).status, 0)
    assert.match(fs.readFileSync(installed, 'utf8'), /^---/)
    const dryRoot = path.join(project, 'custom')
    const dry = run(['--target', 'claude', '--path', dryRoot, '--dry-run'])
    assert.equal(dry.status, 0)
    assert.equal(fs.existsSync(dryRoot), false)
  } finally {
    fs.rmSync(project, { recursive: true, force: true })
  }
})

test('both project targets install into their host-specific skill roots', () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'netlify-skill-both-'))
  try {
    const result = run(['--target', 'both', '--scope', 'project'], { cwd: sandbox })
    assert.equal(result.status, 0, result.stderr)
    assert.ok(fs.existsSync(path.join(sandbox, '.agents/skills/make-app-netlify-ready/SKILL.md')))
    assert.ok(fs.existsSync(path.join(sandbox, '.claude/skills/make-app-netlify-ready/SKILL.md')))
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true })
  }
})

test('unsafe root and multi-target path are rejected', () => {
  assert.equal(run(['--target', 'codex', '--path', path.parse(root).root]).status, 1)
  assert.equal(run(['--target', 'both', '--path', path.join(os.tmpdir(), 'skills')]).status, 1)
})

test('bundled Netlify auditor runs against a safe fixture', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'netlify-audit-'))
  try {
    fs.mkdirSync(path.join(fixture, 'dist'))
    fs.writeFileSync(path.join(fixture, 'dist/index.html'), '<!doctype html>')
    fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ scripts: { build: 'vite build' }, devDependencies: { vite: '8.2.0' } }))
    fs.writeFileSync(path.join(fixture, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': {}, 'node_modules/vite': { version: '8.2.0' } } }))
    fs.writeFileSync(path.join(fixture, 'netlify.toml'), '[build]\ncommand = "npm run build"\npublish = "dist"\n')
    const script = path.join(root, 'skills/make-app-netlify-ready/scripts/audit_netlify.py')
    const result = spawnSync('python3', [script, fixture, '--json'], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const report = JSON.parse(result.stdout)
    assert.equal(report.framework, 'vite')
    assert.equal(report.output_exists, true)
    assert.deepEqual(report.findings, [])
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true })
  }
})

test('Netlify auditor resolves a monorepo base before the publish directory', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'netlify-monorepo-audit-'))
  try {
    fs.mkdirSync(path.join(fixture, 'apps/web/dist'), { recursive: true })
    fs.writeFileSync(path.join(fixture, 'apps/web/dist/index.html'), '<!doctype html>')
    fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ scripts: { build: 'vite build' }, devDependencies: { vite: '8.2.0' } }))
    fs.writeFileSync(path.join(fixture, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': {}, 'node_modules/vite': { version: '8.2.0' } } }))
    fs.writeFileSync(path.join(fixture, 'netlify.toml'), '[build]\nbase = "apps/web"\ncommand = "npm run build"\npublish = "dist"\n')
    const script = path.join(root, 'skills/make-app-netlify-ready/scripts/audit_netlify.py')
    const result = spawnSync('python3', [script, fixture, '--json'], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const report = JSON.parse(result.stdout)
    assert.equal(report.configured.base, 'apps/web')
    assert.equal(report.output_exists, true)
    assert.deepEqual(report.findings, [])
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true })
  }
})

test('Netlify auditor rejects unsafe SPA fallback ordering and SSR fallback use', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'netlify-routing-audit-'))
  try {
    fs.mkdirSync(path.join(fixture, 'dist/client'), { recursive: true })
    fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ scripts: { build: 'vite build' }, dependencies: { '@tanstack/react-start': '1.132.0', '@netlify/vite-plugin-tanstack-start': '1.3.17' } }))
    fs.writeFileSync(path.join(fixture, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': {}, 'node_modules/@tanstack/react-start': { version: '1.132.0' } } }))
    fs.writeFileSync(path.join(fixture, 'netlify.toml'), '[build]\ncommand = "npm run build"\npublish = "dist/client"\n\n[[redirects]]\nfrom = "/*"\nto = "/index.html"\nstatus = 200\n\n[[redirects]]\nfrom = "/legacy"\nto = "/new"\nstatus = 301\n')
    const script = path.join(root, 'skills/make-app-netlify-ready/scripts/audit_netlify.py')
    const result = spawnSync('python3', [script, fixture, '--json'], { encoding: 'utf8' })
    assert.equal(result.status, 1, result.stderr)
    const codes = JSON.parse(result.stdout).findings.map((item) => item.code)
    assert.ok(codes.includes('spa-fallback-order'))
    assert.ok(codes.includes('spa-fallback-runtime'))
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true })
  }
})
