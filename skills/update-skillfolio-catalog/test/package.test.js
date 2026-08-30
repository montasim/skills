import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cli = path.join(root, 'bin', 'update-skillfolio-catalog.js')
const run = (args, options = {}) => spawnSync(process.execPath, [cli, ...args], { cwd: options.cwd || root, env: { ...process.env, ...options.env }, encoding: 'utf8' })

test('public package contract contains only portable payload roots', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.bin['update-skillfolio-catalog'], 'bin/update-skillfolio-catalog.js')
  assert.deepEqual(pkg.files, ['bin/', 'skills/'])
  assert.equal(pkg.engines.node, '>=18')
  assert.notEqual(pkg.private, true)
  assert.deepEqual(pkg.publishConfig, { access: 'public' })
  const skill = fs.readFileSync(path.join(root, 'skills/update-skillfolio-catalog/SKILL.md'), 'utf8')
  assert.match(skill, /^---\nname: update-skillfolio-catalog\n/)
  const metadata = fs.readFileSync(path.join(root, 'skills/update-skillfolio-catalog/agents/openai.yaml'), 'utf8')
  assert.match(metadata, /\$update-skillfolio-catalog/)
})

test('help, version, and required target behave predictably', () => {
  assert.match(run(['--help']).stdout, /--target/)
  assert.equal(run(['--version']).stdout.trim(), '0.1.0')
  const missing = run([])
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /--target is required/)
})

test('project installation, refusal, force, and dry-run work', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'skillfolio-skill-project-'))
  try {
    const first = run(['--target', 'claude', '--scope', 'project'], { cwd: project })
    assert.equal(first.status, 0, first.stderr)
    const installed = path.join(project, '.claude/skills/update-skillfolio-catalog/SKILL.md')
    assert.ok(fs.existsSync(installed))
    assert.equal(run(['--target', 'claude', '--scope', 'project'], { cwd: project }).status, 1)
    fs.writeFileSync(installed, 'stale')
    assert.equal(run(['--target', 'claude', '--scope', 'project', '--force'], { cwd: project }).status, 0)
    assert.match(fs.readFileSync(installed, 'utf8'), /^---/)
    const dryRoot = path.join(project, 'custom')
    const dry = run(['--target', 'codex', '--path', dryRoot, '--dry-run'])
    assert.equal(dry.status, 0)
    assert.equal(fs.existsSync(dryRoot), false)
  } finally {
    fs.rmSync(project, { recursive: true, force: true })
  }
})

test('both project targets install into their host-specific skill roots', () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'skillfolio-skill-both-'))
  try {
    const result = run(['--target', 'both', '--scope', 'project'], { cwd: sandbox })
    assert.equal(result.status, 0, result.stderr)
    assert.ok(fs.existsSync(path.join(sandbox, '.agents/skills/update-skillfolio-catalog/SKILL.md')))
    assert.ok(fs.existsSync(path.join(sandbox, '.claude/skills/update-skillfolio-catalog/SKILL.md')))
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true })
  }
})

test('unsafe root and multi-target path are rejected', () => {
  assert.equal(run(['--target', 'codex', '--path', path.parse(root).root]).status, 1)
  assert.equal(run(['--target', 'both', '--path', path.join(os.tmpdir(), 'skills')]).status, 1)
})

test('bundled catalog validator runs against a safe fixture', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'skillfolio-catalog-'))
  try {
    fs.mkdirSync(path.join(fixture, 'src/data'), { recursive: true })
    fs.mkdirSync(path.join(fixture, 'public'), { recursive: true })
    const records = [
      { name: 'Existing Skill', slug: 'existing-skill', description: 'Existing entry', version: '1.0.0', repository: 'https://github.com/example/existing-skill' },
      { name: 'Example Skill', slug: 'example-skill', description: 'Example entry', version: '0.1.0', repository: 'https://github.com/example/example-skill' }
    ]
    fs.writeFileSync(path.join(fixture, 'src/data/skills.json'), JSON.stringify(records))
    fs.writeFileSync(path.join(fixture, 'README.md'), '# Catalog\n\nExample Skill\n')
    fs.writeFileSync(path.join(fixture, 'public/sitemap.xml'), '<urlset><url><loc>https://example.test/skills/example-skill</loc></url></urlset>')
    const script = path.join(root, 'skills/update-skillfolio-catalog/scripts/validate_catalog_entry.py')
    const result = spawnSync('python3', [script, '--app', fixture, '--entry', 'example-skill', '--json'], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const report = JSON.parse(result.stdout)
    assert.equal(report.selected_count, 1)
    assert.deepEqual(report.findings, [])
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true })
  }
})

test('catalog validator rejects missing and duplicate target identities', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'skillfolio-catalog-invalid-'))
  try {
    fs.mkdirSync(path.join(fixture, 'src/data'), { recursive: true })
    const records = [
      { name: 'Example Skill', slug: 'example-skill', description: 'First', version: '0.1.0', repository: 'https://github.com/example/example-skill' },
      { name: 'Duplicate Slug', slug: 'example-skill', description: 'Second', version: '0.2.0', repository: 'https://github.com/example/duplicate' }
    ]
    fs.writeFileSync(path.join(fixture, 'src/data/skills.generated.json'), JSON.stringify(records))
    const script = path.join(root, 'skills/update-skillfolio-catalog/scripts/validate_catalog_entry.py')
    const duplicate = spawnSync('python3', [script, '--app', fixture, '--entry', 'example-skill', '--json'], { encoding: 'utf8' })
    assert.equal(duplicate.status, 1, duplicate.stderr)
    const duplicateCodes = JSON.parse(duplicate.stdout).findings.map((item) => item.code)
    assert.ok(duplicateCodes.includes('entry-ambiguous'))
    assert.ok(duplicateCodes.includes('duplicate-identity'))

    const missing = spawnSync('python3', [script, '--app', fixture, '--entry', 'missing-skill', '--json'], { encoding: 'utf8' })
    assert.equal(missing.status, 1, missing.stderr)
    assert.ok(JSON.parse(missing.stdout).findings.some((item) => item.code === 'entry-missing'))
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true })
  }
})
