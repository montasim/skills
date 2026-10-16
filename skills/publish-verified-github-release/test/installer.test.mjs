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
  assert.match(help.stdout, /--target <provider\[,provider\.\.\.\]>/)
  assert.match(help.stdout, /gemini, antigravity, antigravity-cli, zcode, cursor, copilot, opencode/)
  const version = run(['--version'])
  assert.equal(version.status, 0)
  assert.equal(version.stdout.trim(), manifest.version)
  assert.equal(run([]).status, 2)
})

test('installs to an exact custom root without inventing a provider', (t) => {
  const rootDir = temporary(t)
  const result = run(['--path', rootDir])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /for custom/)
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

test('project scope preserves the legacy both alias', (t) => {
  const project = temporary(t)
  const result = run(['--target', 'both', '--scope', 'project'], { cwd: project })
  assert.equal(result.status, 0, result.stderr)
  assert.ok(fs.existsSync(path.join(project, '.agents', 'skills', name, 'SKILL.md')))
  assert.ok(fs.existsSync(path.join(project, '.claude', 'skills', name, 'SKILL.md')))
})

test('installs provider-native user layouts', (t) => {
  const home = temporary(t)
  const providers = {
    codex: ['.agents', 'skills'],
    claude: ['.claude', 'skills'],
    gemini: ['.gemini', 'skills'],
    antigravity: ['.gemini', 'config', 'skills'],
    'antigravity-cli': ['.gemini', 'antigravity-cli', 'skills'],
    zcode: ['.zcode', 'skills'],
    cursor: ['.cursor', 'skills'],
    copilot: ['.copilot', 'skills'],
    opencode: ['.config', 'opencode', 'skills'],
  }

  for (const [provider, parts] of Object.entries(providers)) {
    const result = run(['--target', provider], { env: { HOME: home } })
    assert.equal(result.status, 0, `${provider}: ${result.stderr}`)
    assert.ok(fs.existsSync(path.join(home, ...parts, name, 'SKILL.md')), provider)
  }
})

test('all installs every native user layout', (t) => {
  const home = temporary(t)
  const result = run(['--target', 'all'], { env: { HOME: home } })
  assert.equal(result.status, 0, result.stderr)
  for (const rootParts of [
    ['.agents', 'skills'],
    ['.claude', 'skills'],
    ['.gemini', 'skills'],
    ['.gemini', 'config', 'skills'],
    ['.gemini', 'antigravity-cli', 'skills'],
    ['.zcode', 'skills'],
    ['.cursor', 'skills'],
    ['.copilot', 'skills'],
    ['.config', 'opencode', 'skills'],
  ]) {
    assert.ok(fs.existsSync(path.join(home, ...rootParts, name, 'SKILL.md')), rootParts.join('/'))
  }
})

test('comma-separated providers install only the requested project layouts', (t) => {
  const project = temporary(t)
  const result = run(['--target', 'gemini,copilot,opencode', '--scope', 'project'], { cwd: project })
  assert.equal(result.status, 0, result.stderr)
  assert.ok(fs.existsSync(path.join(project, '.gemini', 'skills', name, 'SKILL.md')))
  assert.ok(fs.existsSync(path.join(project, '.github', 'skills', name, 'SKILL.md')))
  assert.ok(fs.existsSync(path.join(project, '.opencode', 'skills', name, 'SKILL.md')))
  assert.equal(fs.existsSync(path.join(project, '.claude', 'skills')), false)
})

test('installs Antigravity CLI and Cursor project layouts', (t) => {
  const project = temporary(t)
  const result = run(['--target', 'antigravity-cli,cursor', '--scope', 'project'], { cwd: project })
  assert.equal(result.status, 0, result.stderr)
  assert.ok(fs.existsSync(path.join(project, '.agent', 'skills', name, 'SKILL.md')))
  assert.ok(fs.existsSync(path.join(project, '.cursor', 'skills', name, 'SKILL.md')))
})

test('rejects undocumented ZCode project scope while supporting its user root', (t) => {
  const project = temporary(t)
  const result = run(['--target', 'zcode', '--scope', 'project'], { cwd: project })
  assert.equal(result.status, 2)
  assert.match(result.stderr, /zcode has no documented project-scope skill root/)
})

test('shared project roots are installed once and report every provider', (t) => {
  const project = temporary(t)
  const result = run(['--target', 'codex,antigravity', '--scope', 'project'], { cwd: project })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /for codex, antigravity/)
  assert.equal(result.stdout.trim().split('\n').length, 1)
})

test('rejects unknown providers with the supported provider list', () => {
  const result = run(['--target', 'future-agent'])
  assert.equal(result.status, 2)
  assert.match(result.stderr, /Unknown provider: future-agent/)
  assert.match(result.stderr, /gemini, antigravity/)
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
  assert.equal(manifest.version, '0.2.1')
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
