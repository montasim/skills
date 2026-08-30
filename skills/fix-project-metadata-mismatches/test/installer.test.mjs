import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const name = manifest.name
const cli = path.join(root, manifest.bin[name])
const sourceSkill = path.join(root, 'skills', name)

function run(args, options = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: options.cwd || root,
    env: { ...process.env, ...options.env },
    encoding: 'utf8',
  })
}

function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `${name}-test-`))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  return directory
}

test('help and version are available without a target', () => {
  const help = run(['--help'])
  assert.equal(help.status, 0)
  assert.match(help.stdout, /--target <codex\|claude\|both>/)
  const version = run(['--version'])
  assert.equal(version.status, 0)
  assert.equal(version.stdout.trim(), manifest.version)
  assert.equal(run([]).status, 2)
})

test('installs to an exact custom root', (t) => {
  const rootDir = temporary(t)
  const result = run(['--target', 'codex', '--path', rootDir])
  assert.equal(result.status, 0, result.stderr)
  assert.ok(fs.existsSync(path.join(rootDir, name, 'SKILL.md')))
  assert.equal(fs.readFileSync(path.join(rootDir, name, 'SKILL.md'), 'utf8'), fs.readFileSync(path.join(sourceSkill, 'SKILL.md'), 'utf8'))
})

test('refuses duplicates and force replaces them', (t) => {
  const rootDir = temporary(t)
  assert.equal(run(['--target', 'claude', '--path', rootDir]).status, 0)
  const marker = path.join(rootDir, name, 'stale.txt')
  fs.writeFileSync(marker, 'stale')
  const duplicate = run(['--target', 'claude', '--path', rootDir])
  assert.equal(duplicate.status, 2)
  assert.match(duplicate.stderr, /already installed/)
  const forced = run(['--target', 'claude', '--path', rootDir, '--force'])
  assert.equal(forced.status, 0, forced.stderr)
  assert.equal(fs.existsSync(marker), false)
})

test('dry-run does not create a destination', (t) => {
  const rootDir = path.join(temporary(t), 'skills')
  const result = run(['--target', 'codex', '--path', rootDir, '--dry-run'])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Would install/)
  assert.equal(fs.existsSync(rootDir), false)
})

test('project scope installs both target layouts', (t) => {
  const project = temporary(t)
  const result = run(['--target', 'both', '--scope', 'project'], { cwd: project })
  assert.equal(result.status, 0, result.stderr)
  assert.ok(fs.existsSync(path.join(project, '.agents', 'skills', name, 'SKILL.md')))
  assert.ok(fs.existsSync(path.join(project, '.claude', 'skills', name, 'SKILL.md')))
})

test('custom path rejects both targets', () => {
  const result = run(['--target', 'both', '--path', '/tmp/unused'])
  assert.equal(result.status, 2)
  assert.match(result.stderr, /single target/)
})

test('rejects a symlink destination', (t) => {
  const rootDir = temporary(t)
  const elsewhere = path.join(rootDir, 'elsewhere')
  fs.mkdirSync(elsewhere)
  fs.symlinkSync(elsewhere, path.join(rootDir, name))
  const result = run(['--target', 'codex', '--path', rootDir, '--force'])
  assert.equal(result.status, 2)
  assert.match(result.stderr, /symlink/)
})

test('package contract exposes only installer and nested skill', () => {
  assert.equal(manifest.version, '0.1.0')
  assert.equal(manifest.type, 'module')
  assert.equal(manifest.engines.node, '>=18')
  assert.equal(manifest.license, 'MIT')
  assert.equal(manifest.author, 'Montasim')
  assert.equal(manifest.publishConfig.access, 'public')
  assert.deepEqual(manifest.files, ['bin/', 'skills/'])
  assert.equal(manifest.bin[name], `bin/${name}.js`)
  assert.equal(fs.existsSync(path.join(sourceSkill, 'SKILL.md')), true)
  const skill = fs.readFileSync(path.join(sourceSkill, 'SKILL.md'), 'utf8')
  assert.match(skill, new RegExp(`^---\\nname: ${name}\\ndescription: .+\\nlicense: MIT\\n---`))
  const files = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: root, encoding: 'utf8' })
  const packed = JSON.parse(files)[0].files.map((entry) => entry.path)
  assert.equal(packed.some((entry) => entry.startsWith('test/')), false)
  assert.equal(packed.includes('README.md'), true)
  assert.equal(packed.includes('LICENSE'), true)
})
