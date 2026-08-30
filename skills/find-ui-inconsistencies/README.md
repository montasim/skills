# Find UI Inconsistencies

> Install one portable skill for Codex, Claude Code, or both that audits visual and interaction consistency across a web frontend.

[![npm version](https://img.shields.io/npm/v/find-ui-inconsistencies.svg)](https://www.npmjs.com/package/find-ui-inconsistencies)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Find UI Inconsistencies gives coding agents an evidence-backed review workflow for typography, spacing, color, layout, shared components, responsive behavior, loading and empty states, motion, and visible accessibility states. It preserves intentional visual direction and separates systemic defects from subjective taste.

The skill defaults to a read-only audit. It implements fixes only when the user explicitly asks.

## Install

Requires Node.js 18 or newer.

From this source checkout:

```sh
npm ci
npm test
node ./bin/find-ui-inconsistencies.js --target codex --scope project
```

This installs the skill into `.agents/skills/find-ui-inconsistencies` in the current project.

From npm:

```sh
npx --yes --package=find-ui-inconsistencies@latest find-ui-inconsistencies --target codex
npx --yes --package=find-ui-inconsistencies@latest find-ui-inconsistencies --target claude
npx --yes --package=find-ui-inconsistencies@latest find-ui-inconsistencies --target both
```

Restart the selected host or begin a new session after installation.

## Invoke

In Codex:

```text
Use $find-ui-inconsistencies to audit this frontend across representative routes, states, and viewports.
```

In Claude Code:

```text
/find-ui-inconsistencies Audit this frontend across representative routes, states, and viewports.
```

## What it evaluates

- Typography roles, line height, density, and hierarchy
- Color roles, contrast, borders, shadows, and emphasis
- Containers, grids, spacing rhythm, alignment, and breakpoints
- Shared buttons, inputs, cards, navigation, badges, tables, and dialogs
- Loading skeletons compared with their loaded components
- Empty, error, selected, disabled, focus, hover, and long-content states
- Motion consistency and reduced-motion behavior
- Screenshot provenance so older images are not reported as current defects

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

The npm executable copies the portable `skills/find-ui-inconsistencies` directory into the selected host's skill root. Installation does not open an application, capture screenshots, audit a frontend, or modify source files. The installed skill defaults to a read-only audit when later invoked.

## Development

```sh
npm ci
npm test
npm run pack:check
```

The configured publish payload is limited to `bin/` and `skills/`; npm also includes required package metadata, this README, and the license. Tests and other local development files are excluded.

`npm test` exercises the package contract, installer targets, duplicate protection, forced replacement, dry-run behavior, rollback-related safety, and unsafe paths. `npm run pack:check` previews the publish archive, and `prepublishOnly` runs both checks before publication.

## Limits

- A complete responsive audit requires representative routes, viewports, themes, and application states.
- Historical screenshots are labeled as such until confirmed against the current source or runtime.
- Visual consistency does not mean replacing intentional hierarchy with uniform styling.
- The skill does not commit, push, deploy, or mutate external design tools without explicit authorization.

## Updating and removing

Rerun the `@latest` installation command with `--force` to replace an older installation. To uninstall, remove only the `find-ui-inconsistencies` directory from the relevant user or project skill root.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, the local workflow, required checks, and pull-request guidance.

## Support and security

Read [SUPPORT.md](SUPPORT.md) and use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), never through a public issue. The SupportKori link is funding, not technical support.

## Project links

- [npm package](https://www.npmjs.com/package/find-ui-inconsistencies)
- [Source repository](https://github.com/montasim/skills/tree/main/skills/find-ui-inconsistencies)
- [Issue tracker](https://github.com/montasim/skills/issues)
- [Security policy](SECURITY.md)

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain the workflow and its verification guidance.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Find UI Inconsistencies is available under the [MIT License](LICENSE).
