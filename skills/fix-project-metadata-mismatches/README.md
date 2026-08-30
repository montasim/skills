# Fix Project Metadata Mismatches

[![npm version](https://img.shields.io/npm/v/fix-project-metadata-mismatches.svg)](https://www.npmjs.com/package/fix-project-metadata-mismatches)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Install a portable agent skill that audits project identity and release metadata, reports drift, and synchronizes local files only when requested.

The skill is designed for both OpenAI Codex and Claude Code. It treats package manifests and other explicit configuration as evidence, distinguishes deterministic mismatches from manual review, and does not publish, push, tag, deploy, or edit external services.

## Install

### From this source checkout

Requires Node.js 18 or newer.

```sh
npm ci
npm test
node ./bin/fix-project-metadata-mismatches.js --target codex --scope project
```

This installs the skill into `.agents/skills/fix-project-metadata-mismatches` in the current project.

### From npm

Codex:

```sh
npx --yes --package=fix-project-metadata-mismatches@latest fix-project-metadata-mismatches --target codex
```

Claude Code:

```sh
npx --yes --package=fix-project-metadata-mismatches@latest fix-project-metadata-mismatches --target claude
```

Both:

```sh
npx --yes --package=fix-project-metadata-mismatches@latest fix-project-metadata-mismatches --target both
```

Restart the relevant agent after installation so it discovers the skill. Invoke it as `$fix-project-metadata-mismatches` in Codex or `/fix-project-metadata-mismatches` in Claude Code.

## What it does

- Establishes the authoritative source for names, versions, descriptions, URLs, install commands, and compatibility claims
- Audits repeated metadata across manifests, lockfiles, skill metadata, documentation, deployment files, and catalogs
- Classifies mismatches, stale values, unsupported claims, and missing fields
- Synchronizes local files in evidence-first order when explicitly requested
- Re-runs focused validation and reports unresolved ambiguity
- Includes a deterministic Node.js metadata auditor for Node projects

The bundled auditor covers deterministic relationships only. Semantic description equivalence, compatibility language, generated surfaces, and fields that are not repeated still require agent review.

## Installer options

```text
--target <codex|claude|both>  Required installation target
--scope <user|project>        Install scope; defaults to user
--path <directory>            Exact custom skills root for one target
--dry-run                     Preview destinations without writing
--force                       Replace an existing installation
--help                        Show help
--version                     Show package version
```

User installs go to `~/.agents/skills` for Codex and `${CLAUDE_CONFIG_DIR:-~/.claude}/skills` for Claude Code. Project installs go to `.agents/skills` and `.claude/skills` in the current directory.

The installer refuses duplicate installations unless `--force` is supplied, rejects unsafe symlink or non-directory destinations, and stages replacements before swapping them into place.

## How installation works

The npm executable copies the portable `skills/fix-project-metadata-mismatches` directory into the selected host's skill root. The host then loads `SKILL.md`; the installer does not run the metadata auditor against a project or change project files during installation.

## Examples

Audit without editing:

```text
Use $fix-project-metadata-mismatches to audit this project and report metadata drift.
```

Synchronize local files:

```text
Use /fix-project-metadata-mismatches to align the local package, lockfile, skill metadata, and README with the verified project identity.
```

## Requirements and limits

- Node.js 18 or newer is required for the installer and bundled audit script.
- The agent needs filesystem access to the project under review.
- Native project tools may be required to regenerate lockfiles or generated metadata.
- External publication and service mutations remain outside this skill.
- Ambiguous identity, ownership, licensing, public URLs, or compatibility policy require user direction.

## Development

```sh
npm ci
npm test
npm run pack:check
```

The published archive intentionally contains only the installer, the nested skill, this README, the license, and package metadata. Tests are excluded.

`npm test` exercises the installer contract, exact-path installation, duplicate protection, forced replacement, dry-run behavior, project installation, and unsafe destinations. `npm run pack:check` previews the npm archive, and `prepublishOnly` runs both checks before publication.

## Updating and removing

Rerun the `@latest` installation command with `--force` to replace an older installation. To uninstall, remove only the `fix-project-metadata-mismatches` directory from the relevant user or project skill root listed above.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, the local workflow, required checks, and pull-request guidance.

## Support and security

Read [SUPPORT.md](SUPPORT.md) and use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), never through a public issue. The SupportKori link is funding, not technical support.

## Project links

- [npm package](https://www.npmjs.com/package/fix-project-metadata-mismatches)
- [Source repository](https://github.com/montasim/skills/tree/main/skills/fix-project-metadata-mismatches)
- [Issue tracker](https://github.com/montasim/skills/issues)
- [Security policy](SECURITY.md)

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain the workflow and its verification guidance.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Fix Project Metadata Mismatches is available under the [MIT License](LICENSE).
