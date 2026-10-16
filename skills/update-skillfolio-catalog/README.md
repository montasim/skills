# Update Skillfolio Catalog

> Synchronize one verified Agent Skill with a local Skillfolio application's real authorities, generated runtime catalog, README index, and sitemap.

[![npm version](https://img.shields.io/npm/v/update-skillfolio-catalog.svg)](https://www.npmjs.com/package/update-skillfolio-catalog)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Update Skillfolio Catalog gives an AI coding agent a schema-discovery workflow for catalog maintenance. It verifies the skill identity from primary source or release evidence, traces runtime data through generators and route consumers, edits the minimum authoritative inputs, regenerates projections, and checks that source, install, detail-route, README, and sitemap links agree.

This package is public and independently installable from npm. Invoking it updates an explicitly identified local Skillfolio checkout; it does not silently publish, push, release, or deploy that catalog.

```sh
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target codex
```

**[npm package](https://www.npmjs.com/package/update-skillfolio-catalog) · [source](https://github.com/montasim/skills/tree/main/skills/update-skillfolio-catalog) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- A published or verified skill must be added to a Skillfolio catalog.
- One existing entry needs a version, repository, package, install command, compatibility, category, or presentation update.
- Runtime JSON is generated from several authorities and must not be edited directly.
- Detail routes, README indexes, and sitemaps need to remain synchronized with the catalog entry.

Use `release-agent-skill` when this local catalog update is one separately authorized stage of a larger package and GitHub release.

## Install and invoke

Node.js 18 or newer is required for the installer and repository generators. Python 3 is required for the bundled entry validator; the target app's declared package manager is required for its own checks.

```sh
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog \
  --target codex --scope project
```

The shared installer supports Codex, Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--target all` or an exact `--path` when needed.

Use the matching target for your host:

```sh
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target codex
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target claude
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target gemini
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target antigravity
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target antigravity-cli
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target zcode
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target cursor
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target copilot
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target opencode
```

```text
Use $update-skillfolio-catalog to add the published package@example-version to /absolute/path/to/skillfolio. Update exactly one skill and do not push or deploy.
```

```text
/update-skillfolio-catalog Synchronize this skill's verified npm and GitHub release facts with the local catalog, generated route data, README index, and sitemap.
```

## Evidence accepted

- A local skill root containing `SKILL.md`
- A canonical GitHub repository, tag, or release URL
- An npm package name or package URL
- An explicit local Skillfolio application path

Stable version, package, executable, repository, install command, and supported hosts come from primary evidence. Badge images, screenshots, stale README sentences, and branch names are not treated as release facts.

## Catalog workflow

1. Resolve the source identity and the intended Skillfolio app without assuming filenames or directory layout.
2. Trace imported runtime data to its generator, types, list/detail routes, README index, sitemap, and editing authorities.
3. Inspect sibling records to learn field order, value types, slug rules, ordering, taxonomy, and link conventions.
4. Run the validator before editing to capture the baseline.
5. Update exactly one skill identity across the minimum authoritative records.
6. Run the existing generator and inspect the projection for unrelated movement.
7. Synchronize the established README table and sitemap workflow when they exist.
8. Run generator check mode, entry validation, formatting, typecheck, focused tests, crawler generation, production build, and representative route inspection.

## Generated-catalog authority model

When the target repository uses this monorepo's pattern, ownership is split deliberately:

| Authority | Owns |
| --- | --- |
| Root `catalog.json` | Managed release, package, version, repository, distribution, provenance, and license facts |
| `categories.json` | Outcome-based category names and definitions |
| `skill-presentation.json` | Display name, category assignment, featured state, summary, description, and uses |
| `external-skills.json` | Skills whose release identity is maintained outside the monorepo |
| `skills.generated.json` | Generated runtime and review projection; never the manual editing target |

Other Skillfolio applications may use different authorities. The skill discovers and follows the target application's actual data flow rather than forcing this schema.

## Run the entry validator

```sh
python3 /absolute/skill/root/scripts/validate_catalog_entry.py \
  --app /absolute/path/to/skillfolio --entry skill-slug
```

The validator checks discoverable JSON-backed runtime shape, duplicates, URLs, README index references, and sitemap presence. It cannot decide editing authority, verify every rendered detail, or replace typecheck, build, route, and source-release verification.

## Completion gate

The entry is complete only when identity and version match primary sources; package, slug, repository, and URLs are unique; generated output matches its inputs; source and install links resolve; the README and sitemap agree; and the target app's relevant checks pass or isolate a pre-existing failure.

## Bundled resources and installer

```text
update-skillfolio-catalog/
├── SKILL.md
├── agents/openai.yaml
├── references/
│   ├── entry-acceptance.md
│   └── generated-catalogs.md
└── scripts/validate_catalog_entry.py
```

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or `--path`. Installation does not locate a catalog, edit data, commit, open a pull request, or deploy.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/update-skillfolio-catalog
npm run pack:check --workspace skills/update-skillfolio-catalog
```

## Limits and safety

- Local files are evidence for their inspected revision, not proof of a public release.
- Conflicting authoritative values block synchronization instead of being guessed.
- “Publish to Skillfolio” means update and verify the local catalog unless external publication is separately authorized.
- Commits, pushes, pull requests, npm publication, GitHub releases, deployments, and remote settings remain out of scope by default.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports catalog compatibility work. Licensed under the [MIT License](LICENSE).
