# Publish Verified GitHub Release

> Turn a verified change range into useful GitHub release notes, then create or edit only the explicitly authorized release.

[![npm version](https://img.shields.io/npm/v/publish-verified-github-release.svg)](https://www.npmjs.com/package/publish-verified-github-release)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Publish Verified GitHub Release helps an AI coding agent write release notes from the target tag, comparison range, manifests, commits, documentation, and checks actually run. It keeps drafting separate from GitHub mutation and refuses to turn unverified package, compatibility, or test claims into release copy.

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target codex
```

**[npm package](https://www.npmjs.com/package/publish-verified-github-release) · [source](https://github.com/montasim/skills/tree/main/skills/publish-verified-github-release) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- A version tag needs outcome-focused notes rather than a rewritten commit log.
- Draft or existing notes must be checked against the actual release range.
- A named GitHub release should be created or edited after explicit approval.
- Installation, migration, breaking-change, or verification sections should appear only when evidence supports them.

Use `verify-github-npm-release` for a read-only audit of an existing release. Use `release-agent-skill` when GitHub release creation is one stage of a complete Agent Skill shipment.

## Install

The shared installer supports these nine Agent Skills hosts:

| AI agent | Installation command |
| --- | --- |
| OpenAI Codex | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target codex` |
| Claude Code | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target claude` |
| Gemini CLI | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target gemini` |
| Google Antigravity | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target antigravity` |
| Antigravity CLI | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target antigravity-cli` |
| ZCode | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target zcode` |
| Cursor | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target cursor` |
| GitHub Copilot | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target copilot` |
| OpenCode | `npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target opencode` |

Install every supported host with `--target all`.

The installer and bundled evidence collector require Node.js 18 or newer. Git is required for repository evidence; authenticated GitHub access is needed only for an authorized remote mutation.

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release \
  --target codex --scope project
```


Draft only:

## Invoke it

```text
Use $publish-verified-github-release to draft notes for v1.4.0 from v1.3.2. Do not change GitHub.
```

Authorized update:

```text
/publish-verified-github-release Update the v1.4.0 GitHub release with evidence from the tag. Do not move or create tags.
```

## Release-note workflow

1. Resolve repository, target tag, comparison base, release state, and mutation boundary.
2. Collect evidence from the target ref so working-tree metadata cannot silently describe a different build.
3. Cross-check commits, manifests, lockfiles, changelogs, documentation, checks, and relevant remote state.
4. Draft a concise summary and user-value highlights; add breaking changes, installation, migration, verification, and links only when supported.
5. If publication is authorized, verify GitHub identity, repository, tag target, flags, and package claims before mutation.
6. Create or edit the named release and read it back to verify URL, tag, target commit, state, and rendered structure.

The result names the comparison range, evidence used, uncertainty, validation performed, and external actions actually completed.

## Collect target-ref evidence directly

```sh
node /absolute/skill/root/scripts/collect-release-evidence.mjs /absolute/repository \
  --tag v1.4.0 --base v1.3.2
```

The dependency-light collector reads package and Git evidence from the requested ref. It does not run tests, publish packages, query every registry, or create releases.

## What strong notes contain

| Section | Included when |
| --- | --- |
| Summary | The release purpose and audience are established |
| Highlights | User-visible outcomes are supported by the verified range |
| Breaking changes | A compatibility break and affected users are proven |
| Install or upgrade | The exact command is valid for the target version |
| Verification | The listed commands actually ran against the target code |
| Links | Package, comparison, tag, or docs URLs resolve to canonical sources |

Empty sections are omitted. Generic celebration, unsupported superlatives, contributor guesses, and exhaustive internal refactor lists are excluded.

## Authorization boundaries

| Request | Allowed behavior |
| --- | --- |
| “Draft release notes” | Inspect and draft; no GitHub mutation |
| “Create this GitHub release” | Mutate only the resolved repository and named release |
| “Edit the existing release” | Preserve the tag unless separately authorized |

Package publication, tag creation, pushes, deployments, and changes to another repository remain separate actions.

## Bundled resources and installer

```text
publish-verified-github-release/
├── SKILL.md
├── agents/openai.yaml
├── references/release-note-standard.md
└── scripts/collect-release-evidence.mjs
```

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a comma-separated `--target`, or `--path`. Installation copies the portable skill only; it does not inspect a repository or contact GitHub.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/publish-verified-github-release
npm run pack:check --workspace skills/publish-verified-github-release
```

Tests cover provider presets, exact-path installation, guarded replacement, dry runs, unsafe destinations, package structure, and collector behavior.

## Limits and safety

- A missing or ambiguous tag, base, version, or repository blocks a trustworthy release narrative.
- Test, compatibility, and package-publication results appear only when directly verified.
- Existing tags are never silently moved.
- Credentials are not written to notes, project files, or logs.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports maintenance. Licensed under the [MIT License](LICENSE).
