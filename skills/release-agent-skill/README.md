# Release Agent Skill

> Install one portable skill for Codex, Claude Code, or both that validates, packages, publishes, releases, and verifies Agent Skills.

[![npm version](https://img.shields.io/npm/v/release-agent-skill.svg)](https://www.npmjs.com/package/release-agent-skill)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Release Agent Skill coordinates the release path from a standards-compliant `SKILL.md` to verified GitHub, npm, and optional catalog surfaces. It keeps preparation separate from external mutations and requires explicit authority for each publish, push, release, deployment, or catalog stage.

## Install

Requires Node.js 18 or newer.

From this source checkout:

```sh
npm ci
npm test
node ./bin/release-agent-skill.js --target codex --scope project
```

This installs the skill into `.agents/skills/release-agent-skill` in the current project.

From npm:

```sh
npx --yes --package=release-agent-skill@latest release-agent-skill --target codex
npx --yes --package=release-agent-skill@latest release-agent-skill --target claude
npx --yes --package=release-agent-skill@latest release-agent-skill --target both
```

Restart the selected host or begin a new session after installation.

## Invoke

In Codex:

```text
Use $release-agent-skill to prepare and verify this Agent Skill release without publishing yet.
```

In Claude Code:

```text
/release-agent-skill Prepare and verify this Agent Skill release without publishing yet.
```

## Workflow

- Validate open Agent Skills structure and host portability
- Synchronize version, package, install-command, and catalog metadata
- Run project tests and inspect the exact npm archive
- Check Git, npm, GitHub, CI, and optional catalog release gates
- Draft evidence-based release notes
- Execute only explicitly authorized external stages
- Verify the release from a clean consumer perspective
- Report completed and pending stages without overstating readiness

The bundled structural preflight distinguishes local structural success from full release readiness. Network, CI, archive, test, and catalog gates remain explicit.

## Installer options

| Option | Purpose |
| --- | --- |
| `--target codex\|claude\|both` | Select the host; required |
| `--scope user\|project` | Install globally for the user or inside the current project |
| `--path <directory>` | Install into one exact custom skills root |
| `--dry-run` | Print the installation plan without writing |
| `--force` | Replace an existing regular skill directory |
| `--help` | Show complete CLI help |

The installer refuses unsafe symlink and non-directory destinations. Combined installation preflights both destinations and rolls back incomplete replacements when an installation fails.

## How installation works

The npm executable copies the portable `skills/release-agent-skill` directory into the selected host's skill root. Installation does not publish a package, create a repository or release, push a tag, deploy an application, or edit a catalog. Each external stage remains separately authorization-gated when the installed skill is later invoked.

## Development

```sh
npm ci
npm test
npm run pack:check
```

The configured publish payload is limited to `bin/` and `skills/`; npm also includes required package metadata, this README, and the license. Tests and other local development files are excluded.

`npm test` exercises the package contract, installer targets, duplicate protection, forced replacement, dry-run behavior, rollback-related safety, and unsafe paths. `npm run pack:check` previews the publish archive, and `prepublishOnly` runs both checks before publication.

## Safety boundaries

- “Prepare” does not authorize commits, pushes, publication, releases, deployment, or catalog edits.
- Existing npm versions are immutable; the skill never attempts to overwrite them.
- Credentials and one-time passwords are never written into project files or logs.
- Partial publication is reported precisely before any retry.

## Updating and removing

Rerun the `@latest` installation command with `--force` to replace an older installation. To uninstall, remove only the `release-agent-skill` directory from the relevant user or project skill root.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, the local workflow, required checks, and pull-request guidance.

## Support and security

Read [SUPPORT.md](SUPPORT.md) and use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), never through a public issue. The SupportKori link is funding, not technical support.

## Project links

- [npm package](https://www.npmjs.com/package/release-agent-skill)
- [Source repository](https://github.com/montasim/skills/tree/main/skills/release-agent-skill)
- [Issue tracker](https://github.com/montasim/skills/issues)
- [Security policy](SECURITY.md)

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain release verification and compatibility guidance.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Release Agent Skill is available under the [MIT License](LICENSE).
