# Release Agent Skill

> Coordinate one Agent Skill from verified source through package publication, namespaced GitHub release, optional catalog sync, and independent consumer verification.

[![npm version](https://img.shields.io/npm/v/release-agent-skill.svg)](https://www.npmjs.com/package/release-agent-skill)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Release Agent Skill gives an AI coding agent an explicit state machine for end-to-end Agent Skill shipment. It coordinates metadata, repository readiness, portable installer tests, archive inspection, npm publication, tags, release notes, GitHub releases, catalogs, and final readback while specialist skills own the details of their stage.

The orchestrator never turns “prepare” into permission to publish. Every external channel remains separately authorized and a completed mutation is not called verified until provider or consumer evidence matches it.

```sh
npx --yes --package=release-agent-skill@latest release-agent-skill --target codex
```

**[npm package](https://www.npmjs.com/package/release-agent-skill) · [source](https://github.com/montasim/skills/tree/main/skills/release-agent-skill) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- One Agent Skill needs an end-to-end Git, GitHub, npm, release, and optional catalog shipment.
- A partial release must resume without repeating immutable or already verified stages.
- Host compatibility, package contents, release identity, and authorization must be tracked together.
- A final answer must distinguish ready, authorized, completed, verified, and blocked stages.

Use a specialist directly for a single job: `fix-project-metadata-mismatches`, `make-project-github-ready`, `publish-verified-github-release`, `update-skillfolio-catalog`, or `verify-github-npm-release`.

## Install

The shared installer supports these nine Agent Skills hosts:

| AI agent | Installation command |
| --- | --- |
| OpenAI Codex | `npx --yes --package=release-agent-skill@latest release-agent-skill --target codex` |
| Claude Code | `npx --yes --package=release-agent-skill@latest release-agent-skill --target claude` |
| Gemini CLI | `npx --yes --package=release-agent-skill@latest release-agent-skill --target gemini` |
| Google Antigravity | `npx --yes --package=release-agent-skill@latest release-agent-skill --target antigravity` |
| Antigravity CLI | `npx --yes --package=release-agent-skill@latest release-agent-skill --target antigravity-cli` |
| ZCode | `npx --yes --package=release-agent-skill@latest release-agent-skill --target zcode` |
| Cursor | `npx --yes --package=release-agent-skill@latest release-agent-skill --target cursor` |
| GitHub Copilot | `npx --yes --package=release-agent-skill@latest release-agent-skill --target copilot` |
| OpenCode | `npx --yes --package=release-agent-skill@latest release-agent-skill --target opencode` |

Install every supported host with `--target all`.

Node.js 18 or newer is required for local validation. Publication may also require Git, authenticated GitHub access, npm authentication, and destination-specific tools.

```sh
npx --yes --package=release-agent-skill@latest release-agent-skill \
  --target codex --scope project
```


Prepare only:

## Invoke it

```text
Use $release-agent-skill to prepare package version 0.2.0, validate every installer target, inspect the archive, and draft release notes. Do not commit, push, publish, tag, or release.
```

End-to-end shipment:

```text
/release-agent-skill Ship package-name 0.2.0 to npm and GitHub, update the local Skillfolio catalog, and verify every authorized stage.
```

## Release state model

| State | Meaning |
| --- | --- |
| `pending` | Required but not yet assessed |
| `ready` | Local evidence satisfies the stage gate |
| `authorized` | The exact external mutation is approved |
| `completed` | The action returned success but still needs independent readback |
| `verified` | Registry, GitHub, CI, installer, or catalog evidence matches the release identity |
| `blocked` | A prerequisite, permission, identity conflict, or failed check prevents progress |

Every requested stage receives one state. A later successful step never hides an earlier unverified or failed step.

## Gate sequence

1. **Skill contract:** directory/frontmatter identity, trigger description, workflow, resources, scripts, and output are structurally valid.
2. **Host compatibility:** portable `SKILL.md` behavior is separated from host-specific presentation and every advertised install target is tested.
3. **Repository state:** branch, remote, version, URLs, install commands, license, tests, and user changes agree.
4. **Package state:** name/version are unused, the exact archive is safe, and a clean packed-artifact install works.
5. **Release state:** immutable namespaced tag targets the reviewed commit and notes contain only verified claims.
6. **Consumer verification:** npm exact version and dist-tag, clean invocation, GitHub release, CI, and authorized catalog surfaces match.

Namespaced skill tags use:

```text
<package-name>-v<package-version>
```

## Run the structural preflight

```sh
node /absolute/skill/root/scripts/preflight.mjs /absolute/project/root --json
```

The preflight is an early structural gate. It does not query npm or GitHub, inspect the final archive, run project tests, check CI, or prove release readiness.

## Specialist routing

| Stage | Specialist | Evidence expected |
| --- | --- | --- |
| Identity, version, URLs, install commands | `fix-project-metadata-mismatches` | Authorities and derived files agree |
| GitHub/community readiness | `make-project-github-ready` | Local readiness plus authorized remote readback |
| Release notes and GitHub release | `publish-verified-github-release` | Evidence-backed notes and verified release state |
| Local Skillfolio synchronization | `update-skillfolio-catalog` | Authorities, projection, routes, and app checks agree |
| Final release audit | `verify-github-npm-release` | Critical release checks return evidence-backed passes |

The orchestrator directly owns stage order, authorization, package archive inspection, npm publication gating, partial-failure recovery, and final handoff.

## Publication behavior

- Existing npm versions are immutable; a collision blocks publication and requires a new version decision.
- npm web authentication or OTP stays in the official flow and is never pasted into project files or logs.
- A successful npm publish is immediately checked through public registry metadata and a clean consumer path.
- Tags point to the reviewed release commit and are never silently moved.
- Catalog deployment remains separate from a local catalog update.
- If npm succeeds but a later stage fails, the immutable published artifact is reported before any retry.

## Bundled resources and installer

```text
release-agent-skill/
├── SKILL.md
├── agents/openai.yaml
├── references/release-gates.md
└── scripts/preflight.mjs
```

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or `--path`. Installation performs no release action.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/release-agent-skill
npm run pack:check --workspace skills/release-agent-skill
```

## Limits and safety

- The orchestrator cannot replace missing registry ownership, GitHub permissions, or destination authentication.
- It never weakens tests, deletes user changes, rewrites history, or bypasses registry safeguards to make a release pass.
- Network propagation and external caches are reported as limitations rather than silently treated as success.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports release compatibility work. Licensed under the [MIT License](LICENSE).
