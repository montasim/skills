import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'

test('exposes one dependency-free installer and one portable skill', async () => {
  const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'))
  assert.equal(pkg.name, 'verify-github-npm-release')
  assert.equal(pkg.version, '0.1.1')
  assert.equal(pkg.bin['verify-github-npm-release'], 'bin/verify-github-npm-release.js')
  assert.deepEqual(pkg.files, ['bin/', 'skills/'])
  assert.equal(pkg.engines.node, '>=18')
  assert.equal(pkg.publishConfig.access, 'public')
  assert.equal(pkg.dependencies, undefined)
  const skill = await fs.readFile('skills/verify-github-npm-release/SKILL.md', 'utf8')
  assert.match(skill, /^---\nname: verify-github-npm-release\n/)
  assert(!skill.includes('TODO'))
  const metadata = await fs.readFile('skills/verify-github-npm-release/agents/openai.yaml', 'utf8')
  assert.match(metadata, /\$verify-github-npm-release/)
})
