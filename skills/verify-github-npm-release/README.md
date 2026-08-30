# Verify GitHub and npm Release

> Audit a claimed GitHub and npm release across Git, tags, release state, registry metadata, install commands, CI, and optional catalogs—without changing anything.

[![npm version](https://img.shields.io/npm/v/verify-github-npm-release.svg)](https://www.npmjs.com/package/verify-github-npm-release)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Verify GitHub and npm Release gives an AI coding agent a strict read-only release audit. It establishes one expected release identity, checks local and remote evidence independently, preserves authentication and timeout failures as `blocked`, and requires every critical artifact to match before returning `verified`.

It never repairs a finding, installs or executes the published package, changes a dist-tag, creates a tag or release, pushes, or publishes.

```sh
npx --yes --package=verify-github-npm-release@latest verify-github-npm-release --target codex
```

**[npm package](https://www.npmjs.com/package/verify-github-npm-release) · [source](https://github.com/montasim/skills/tree/main/skills/verify-github-npm-release) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- A release is claimed complete and needs independent evidence before handoff.
- GitHub tag, release, npm version, dist-tag, and package executable might disagree.
- CI must be tied to the released commit rather than a nearby successful run.
- A catalog's repository, package, version, or install command must align with public artifacts.
- A partially published release needs a precise pass, warning, fail, or blocked report.

Use `publish-verified-github-release` to draft or change release notes. Use `release-agent-skill` when verification closes an authorized multi-stage shipment.

## Install and invoke

Node.js 18 or newer and Git are required for local checks. Online checks need npm registry access and GitHub access; private targets may require authentication.

```sh
npx --yes --package=verify-github-npm-release@latest verify-github-npm-release \
  --target codex --scope project
```

The shared installer supports Codex, Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--target all` or an exact `--path` as needed.

```text
Use $verify-github-npm-release to verify owner/project package-name 1.2.3, tag package-name-v1.2.3, latest dist-tag, CI, and catalog.json. Do not execute or change the package.
```

```text
/verify-github-npm-release Audit this claimed release and return a row for every check with observed and expected values.
```

## Release identity

The audit resolves these values before evaluating state:

1. Local project path
2. GitHub repository in `owner/name` form
3. npm package name
4. Expected semantic version
5. Expected Git tag
6. Expected npm dist-tag
7. Advertised install command
8. Optional catalog path or public record

When authoritative files disagree, the disagreement remains a finding instead of being silently resolved.

## Run the deterministic verifier

```sh
node /absolute/skill/root/scripts/verify-release.mjs \
  --repo owner/repository \
  --package package-name \
  --version 1.2.3 \
  --tag package-name-v1.2.3 \
  --dist-tag latest \
  --install-command "npx --yes --package=package-name@1.2.3 executable" \
  --catalog /absolute/project/catalog.json
```

Add `--offline` only for a local preflight; skipped network checks cannot produce a completed release audit. Every Git, GitHub, and npm subprocess has a bounded timeout.

## Critical checks

| Check | Passing evidence |
| --- | --- |
| Local and remote tag | Both dereference to the expected release commit |
| GitHub release | Exists for the expected tag and is not an unintended draft or prerelease |
| npm exact version | Public registry contains the requested immutable version |
| npm dist-tag | Requested alias resolves to that exact version |
| Install command | Names the exact package/version and a published executable |
| Repository alignment | Current branch, upstream, and remote commit relationships are observable and consistent |
| CI | A successful run belongs to the released commit when CI is configured |
| Catalog | Repository, package, version, and command match when catalog verification is requested |

An `@latest` command is conditional even when it currently passes because the alias can move. An immutable `package@version` command is stronger release proof.

## Result states and verdict

| State | Meaning |
| --- | --- |
| `pass` | Direct evidence matches the expected identity |
| `warning` | Optional evidence is absent, ambiguous, skipped, or weaker than ideal |
| `fail` | Direct evidence contradicts the expected identity |
| `blocked` | Required tooling, credentials, network, identity, or a bounded command prevented the check |

The final verdict is `verified`, `not verified`, or `blocked`. Every row includes observed value, expected value, and evidence source; suggested fixes are guidance only.

## Read-only boundary

Safe evidence commands include `git status`, `git rev-parse`, `git ls-remote`, `gh api`, `gh release view`, `gh run list`, and `npm view`. `npx`, package installation, lifecycle scripts, and app startup execute code and are deliberately excluded from this verifier's default contract.

## Bundled resources and installer

```text
verify-github-npm-release/
├── SKILL.md
├── agents/openai.yaml
└── scripts/
    ├── release-checks.mjs
    └── verify-release.mjs
```

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or `--path`. Installation performs no audit and contacts no remote service.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/verify-github-npm-release
npm run pack:check --workspace skills/verify-github-npm-release
```

## Limits and safety

- Network and authentication errors are not evidence that an artifact is absent.
- Catalog checks validate identifiers, not deployed catalog presentation.
- A dirty working tree is reported separately from the immutable released commit.
- The skill never publishes, tags, pushes, installs, executes, repairs, or edits release state.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports verification maintenance. Licensed under the [MIT License](LICENSE).
