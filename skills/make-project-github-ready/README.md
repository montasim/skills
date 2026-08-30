# Make Project GitHub Ready

Install one portable skill for Codex, Claude Code, or both that audits and prepares professional GitHub repositories with explicit mutation boundaries.

[![npm version](https://img.shields.io/npm/v/make-project-github-ready.svg)](https://www.npmjs.com/package/make-project-github-ready)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Make Project GitHub Ready inventories a local project, designs evidence-based repository metadata, makes authorized local readiness improvements, and applies remote GitHub changes only after explicit approval. It keeps local edits, repository creation, metadata changes, and pushes visibly separate.

## Install

Requires Node.js 18 or newer and a filesystem-backed Codex or Claude Code skill directory.

From this source checkout:

```sh
npm ci
npm test
node ./bin/make-project-github-ready.js --target codex --scope project
```

This installs the skill into `.agents/skills/make-project-github-ready` in the current project. The npm package and executable retain their established `make-project-github-ready` names.

From npm:

```sh
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target codex
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target claude
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target both
```

Start a new agent session after installation so the host refreshes its skill catalog.

## Use

In Codex:

```text
Use $make-project-github-ready to audit this project and prepare a safe GitHub repository setup plan.
```

In Claude Code:

```text
/make-project-github-ready Audit this project and prepare a safe GitHub repository setup plan.
```

The bundled local auditor provides a bounded inventory before human review:

```sh
node skills/make-project-github-ready/scripts/audit-github-project.mjs --path . --json
```

## Capabilities

- Inventory recognized manifests, community files, workflows, Git state, and obvious sensitive filenames.
- Flag missing repository metadata, stale pre-publication wording, and selected CI text mismatches.
- Propose a factual description, verified homepage, focused topics, visibility, and default branch.
- Prepare local community, security, manifest, and CI changes when authorized.
- Create or configure GitHub repositories only after explicit authorization.
- Read back repository settings, branch SHAs, workflows, and community profile after changes.
- Report partial remote success without attempting destructive compensation.

## Installer options

| Option | Behavior |
| --- | --- |
| `--target codex\|claude\|both` | Required installation host |
| `--scope user\|project` | User installation by default; project-local when requested |
| `--path /absolute/skills/root` | Custom skills root for exactly one target |
| `--dry-run` | Print destinations without writing |
| `--force` | Atomically replace an existing directory installation |
| `--help` | Show installer help |
| `--version` | Print the package version |

User installations go to `~/.agents/skills` for Codex and `${CLAUDE_CONFIG_DIR:-~/.claude}/skills` for Claude Code. Project installations go to `.agents/skills` and `.claude/skills` in the current directory. The installer refuses to replace symlinks or non-directories, including with `--force`.

## How installation works

The npm executable copies the portable `skills/make-project-github-ready` directory into the selected host's skill root. Installation does not inspect a project, create a repository, change GitHub metadata, or push commits; those actions occur only when the installed skill is invoked with explicit authority.

## Limits and safety

- Filename checks do not prove that a repository or its history contains no secrets.
- Workflow text checks do not prove CI semantics or runtime success.
- A configured Git remote does not prove GitHub ownership, visibility, or repository settings.
- The skill requires explicit authorization before repository creation, metadata mutations, visibility changes, branch changes, or pushes.
- It never invents deployment URLs, security contacts, licenses, badges, or support channels.

## Development

```sh
npm ci
npm test
npm run pack:check
```

`npm test` runs auditor regressions, installer safety tests, and package-contract checks. `npm run pack:check` previews the files that would be published; only `bin/` and `skills/` are included alongside npm-required package metadata and documentation.

The `prepublishOnly` gate runs both commands before npm publication.

## Updating and removing

Rerun the `@latest` installation command with `--force` to replace an older installation. The installer safely migrates an existing `make-project-github-ready` skill directory to `make-project-github-ready`. To uninstall, remove only the `make-project-github-ready` directory from the relevant user or project skill root listed above.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, the local workflow, required checks, and pull-request guidance.

## Support and security

Read [SUPPORT.md](SUPPORT.md) and use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), never through a public issue. The SupportKori link is funding, not technical support.

## Project links

- [npm package](https://www.npmjs.com/package/make-project-github-ready)
- [Source repository](https://github.com/montasim/skills/tree/main/skills/make-project-github-ready)
- [Issue tracker](https://github.com/montasim/skills/issues)
- [Security policy](SECURITY.md)

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain the repository-readiness workflows.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Make Project GitHub Ready is available under the [MIT License](LICENSE).
