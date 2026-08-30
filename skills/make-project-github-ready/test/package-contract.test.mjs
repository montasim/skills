import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'

test('exposes one dependency-free installer and one portable skill', async () => {
  const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'))
  assert.equal(pkg.name, 'make-project-github-ready')
  assert.equal(pkg.version, '0.1.0')
  assert.equal(pkg.bin['make-project-github-ready'], 'bin/make-project-github-ready.js')
  assert.deepEqual(pkg.files, ['bin/', 'skills/'])
  assert.equal(pkg.engines.node, '>=18')
  assert.equal(pkg.publishConfig.access, 'public')
  assert.equal(pkg.dependencies, undefined)
  const skill = await fs.readFile('skills/make-project-github-ready/SKILL.md', 'utf8')
  assert.match(skill, /^---\nname: make-project-github-ready\n/)
  assert(!skill.includes('TODO'))
  const metadata = await fs.readFile('skills/make-project-github-ready/agents/openai.yaml', 'utf8')
  assert.match(metadata, /\$make-project-github-ready/)
})
