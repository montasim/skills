# Verify GitHub and npm Release

Install one portable skill for Codex, Claude Code, or both that audits an existing GitHub and npm release without changing it.

[![npm version](https://img.shields.io/npm/v/verify-github-npm-release.svg)](https://www.npmjs.com/package/verify-github-npm-release)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Verify GitHub and npm Release compares a claimed release identity across local Git state, GitHub tags and releases, npm versions and dist-tags, advertised install commands, CI, and an optional catalog. It reports direct evidence as pass, warning, fail, or blocked while preserving a strict read-only boundary.

## Install

Requires Node.js 18 or newer and a filesystem-backed Codex or Claude Code skill directory.

From this source checkout:

```sh
npm ci
npm test
node ./bin/verify-github-npm-release.js --target codex --scope project
```

This installs the skill into `.agents/skills/verify-github-npm-release` in the current project.

From npm:

```sh
npx --yes --package=verify-github-npm-release@latest verify-github-npm-release --target codex
npx --yes --package=verify-github-npm-release@latest verify-github-npm-release --target claude
npx --yes --package=verify-github-npm-release@latest verify-github-npm-release --target both
```

Start a new agent session after installation so the host refreshes its skill catalog.

## Use

In Codex:

```text
Use $verify-github-npm-release to audit version 1.2.3 of this project across GitHub and npm.
```

In Claude Code:

```text
/verify-github-npm-release Audit version 1.2.3 of this project across GitHub and npm.
```

The skill resolves an expected repository, package, version, Git tag, npm dist-tag, install command, and optional catalog before collecting evidence. Its bundled verifier can also produce machine-readable output:

```sh
node skills/verify-github-npm-release/scripts/verify-release.mjs \
  --repo owner/repository \
  --package package-name \
  --version 1.2.3 \
  --install-command "npx --yes --package=package-name@1.2.3 executable" \
  --json
```

## Capabilities

- Compare local and upstream commits with local and GitHub tags.
- Verify a non-draft GitHub release and exact npm version.
- Confirm a requested npm dist-tag resolves to the expected version.
- Cross-check the advertised command against published executable metadata.
- Require successful CI evidence when the repository defines workflows.
- Check optional JSON catalog identifiers without modifying the catalog.
- Bound subprocesses with timeouts and distinguish contradictions from blocked checks.

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

The npm executable copies the portable `skills/verify-github-npm-release` directory into the selected host's skill root. Installation performs no release audit and contacts no remote service. GitHub and npm evidence is collected only when the installed skill is invoked.

## Limits and safety

- The audit does not execute the published package or its lifecycle scripts.
- Network, authentication, missing tooling, and timeouts can block conclusions.
- A mutable install alias such as `@latest` is only conditionally valid even when it currently resolves correctly.
- Catalog checks compare identifiers in valid JSON; they do not prove catalog presentation or deployment.
- The skill never repairs, publishes, tags, pushes, or edits release state.

## Development

```sh
npm ci
npm test
npm run pack:check
```

`npm test` runs the release evaluator, verifier regression tests, installer safety tests, and package-contract checks. `npm run pack:check` previews the files that would be published; only `bin/` and `skills/` are included alongside npm-required package metadata and documentation.

The `prepublishOnly` gate runs both commands before npm publication.

## Updating and removing

Rerun the `@latest` installation command with `--force` to replace an older installation. To uninstall, remove only the `verify-github-npm-release` directory from the relevant user or project skill root listed above.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, the local workflow, required checks, and pull-request guidance.

## Support and security

Read [SUPPORT.md](SUPPORT.md) and use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), never through a public issue. The SupportKori link is funding, not technical support.

## Project links

- [npm package](https://www.npmjs.com/package/verify-github-npm-release)
- [Source repository](https://github.com/montasim/skills/tree/main/skills/verify-github-npm-release)
- [Issue tracker](https://github.com/montasim/skills/issues)
- [Security policy](SECURITY.md)

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain the verification workflows.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Verify GitHub and npm Release is available under the [MIT License](LICENSE).
