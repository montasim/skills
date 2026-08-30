# Fix Project Metadata Mismatches

> Find and repair drift in project names, versions, descriptions, URLs, install commands, and compatibility claims across local authorities and derived files.

[![npm version](https://img.shields.io/npm/v/fix-project-metadata-mismatches.svg)](https://www.npmjs.com/package/fix-project-metadata-mismatches)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Fix Project Metadata Mismatches gives an AI coding agent an authority-first workflow for repeated project identity and release facts. It does not choose the most common string. Instead, it establishes the authoritative source for each field, labels downstream values as mismatched, stale, unsupported, or missing, and updates authorities before lockfiles, generated output, documentation, and catalogs.

Audits are read-only. Local synchronization happens only when requested; publishing and external service changes are never implied.

```sh
npx --yes --package=fix-project-metadata-mismatches@latest fix-project-metadata-mismatches --target codex
```

**[npm package](https://www.npmjs.com/package/fix-project-metadata-mismatches) · [source](https://github.com/montasim/skills/tree/main/skills/fix-project-metadata-mismatches) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- `package.json`, lockfiles, `SKILL.md`, docs, and catalogs disagree on a version or name.
- Repository, homepage, issue, or install URLs still point to an old project.
- A renamed package's executable or documented command drifted from the manifest.
- Compatibility claims are broader than CI, runtime constraints, or tested hosts prove.
- Release preparation needs local metadata aligned before commit, tag, or publication.

Use `make-project-github-ready` for community files, repository visibility, GitHub topics, and remote settings. Use `release-agent-skill` when synchronization is one stage of an end-to-end release.

## Install and invoke

Node.js 18 or newer is required for the installer and bundled metadata auditor. The target repository's own package manager may be needed to regenerate lockfiles or derived metadata.

```sh
npx --yes --package=fix-project-metadata-mismatches@latest fix-project-metadata-mismatches \
  --target codex --scope project
```

The shared installer supports Codex, Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--target all` or an exact `--path` as needed.

```text
Use $fix-project-metadata-mismatches to audit this repository's package identity, versions, URLs, install commands, and compatibility claims. Report only.
```

```text
/fix-project-metadata-mismatches Synchronize local manifests, lockfiles, SKILL.md, README, and catalog with the verified package identity. Do not publish.
```

## Authority model

| Field | Preferred evidence |
| --- | --- |
| Package identity and version | Package/build manifest, then its native lockfile |
| Repository and issue URLs | Manifest fields and configured Git remote, with remote identity verified when needed |
| Skill identity | `SKILL.md` frontmatter |
| Compatibility | Executable constraints, CI matrices, framework config, and tested environments |
| Install command | Actual package name, shipped binary, package manager, and published source |
| Description | Current observable behavior supported by source and documentation |

Authority is established per field. Conflicting authoritative sources are reported rather than resolved by frequency or guesswork.

## Run the deterministic audit

```sh
node /absolute/skill/root/scripts/audit-metadata.mjs /absolute/project/root \
  --strict --json
```

The Node.js auditor checks deterministic relationships in projects with a package manifest. Review every item marked `manual-review`, `not-represented`, `not-repeated`, or `unsupported`: zero deterministic findings is not proof that every description, compatibility statement, generated surface, or external URL is correct.

## Finding classes

| Class | Meaning |
| --- | --- |
| `Mismatch` | Two authoritative or derived surfaces disagree |
| `Stale` | A downstream value retains an older verified fact |
| `Unsupported` | A claim lacks repository or runtime evidence |
| `Missing` | A required downstream representation is absent |

For every finding, the skill reports the file, observed value, expected value, evidence source, and proposed local correction.

## Synchronization workflow

1. Resolve the project root and applicable repository instructions.
2. Inventory only surfaces relevant to the requested fields.
3. Establish and state canonical values with their evidence.
4. Update authorities first.
5. Regenerate lockfiles and derived files with native tools.
6. Update documentation and catalogs while adapting descriptions to each surface's role.
7. Rerun the audit and focused project checks, then inspect the diff for unrelated replacements.

Ambiguous identity, ownership, licensing, public URLs, or compatibility policy requires user direction before high-impact changes.

## Bundled resources and installer

```text
fix-project-metadata-mismatches/
├── SKILL.md
├── agents/openai.yaml
└── scripts/audit-metadata.mjs
```

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or `--path`. Installation does not audit or change the selected project.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/fix-project-metadata-mismatches
npm run pack:check --workspace skills/fix-project-metadata-mismatches
```

## Limits and safety

- Meaning can be synchronized without forcing identical prose across manifests, catalog cards, and long-form docs.
- A local majority is not an authority.
- The skill does not commit, push, publish, tag, create releases, deploy, or change external services.
- It never turns an unverified compatibility, release, or publication claim into an asserted fact.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports maintenance. Licensed under the [MIT License](LICENSE).
