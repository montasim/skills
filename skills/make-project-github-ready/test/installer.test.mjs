import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const packageName = 'make-project-github-ready'
const skillName = 'make-project-github-ready'
const bin = path.resolve('bin', `${packageName}.js`)

async function temporary(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix))
}

test('prints help and version without requiring a target', async () => {
  const help = await exec(process.execPath, [bin, '--help'])
  const version = await exec(process.execPath, [bin, '--version'])
  assert.match(help.stdout, /--target <codex\|claude\|both>/)
  assert.equal(version.stdout.trim(), '0.1.1')
})

test('requires an explicit target', async () => {
  await assert.rejects(exec(process.execPath, [bin]), /--target is required/)
})

test('installs to a custom root, refuses duplicates, and supports force', async () => {
  const root = await temporary('make-github-ready-install-')
  try {
    await exec(process.execPath, [bin, '--target', 'codex', '--path', root])
    const skill = path.join(root, skillName, 'SKILL.md')
    assert.match(await fs.readFile(skill, 'utf8'), /name: make-project-github-ready/)
    await assert.rejects(exec(process.execPath, [bin, '--target', 'codex', '--path', root]), /already exists/)
    await exec(process.execPath, [bin, '--target', 'codex', '--path', root, '--force'])
    assert.match(await fs.readFile(skill, 'utf8'), /# Make Project GitHub Ready/)
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test('dry-run reports the plan without creating a destination', async () => {
  const root = await temporary('make-github-ready-dry-')
  try {
    const result = await exec(process.execPath, [bin, '--target', 'claude', '--path', root, '--dry-run'])
    assert.match(result.stdout, /\[dry-run\] claude/)
    await assert.rejects(fs.access(path.join(root, skillName)))
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test('installs for both hosts at project scope', async () => {
  const root = await temporary('make-project-github-ready-')
  try {
    const result = await exec(process.execPath, [bin, '--target', 'both', '--scope', 'project'], { cwd: root })
    assert.match(result.stdout, /for codex/)
    assert.match(result.stdout, /for claude/)
    await fs.access(path.join(root, '.agents', 'skills', skillName, 'SKILL.md'))
    await fs.access(path.join(root, '.claude', 'skills', skillName, 'SKILL.md'))
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

test('refuses symlink and non-directory replacement even with force', async () => {
  const root = await temporary('make-github-ready-guard-')
  const external = await temporary('make-github-ready-external-')
  try {
    await fs.symlink(external, path.join(root, skillName))
    await assert.rejects(exec(process.execPath, [bin, '--target', 'codex', '--path', root, '--force']), /Refusing to replace symlink/)
    await fs.rm(path.join(root, skillName))
    await fs.writeFile(path.join(root, skillName), 'not a directory')
    await assert.rejects(exec(process.execPath, [bin, '--target', 'codex', '--path', root, '--force']), /Refusing to replace non-directory/)
  } finally {
    await fs.rm(root, { recursive: true, force: true })
    await fs.rm(external, { recursive: true, force: true })
  }
})
