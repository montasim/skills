# Update Skillfolio Catalog

[![npm version](https://img.shields.io/npm/v/update-skillfolio-catalog.svg)](https://www.npmjs.com/package/update-skillfolio-catalog)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Install a portable agent skill that adds or updates a verified agent skill in a local Skillfolio catalog while preserving the application's authority boundaries, schema, indexes, sitemap, and validation workflow.

It helps Codex and Claude Code trace the live catalog into its consumers, verify package and repository evidence, and synchronize exactly one entry without treating a local catalog update as permission to push or deploy.

## Install

Requires Node.js 18 or newer. Python 3.9 or newer is required when the installed skill runs its bundled catalog validator.

### From this source checkout

```bash
npm ci
npm test
node ./bin/update-skillfolio-catalog.js --target codex --scope project
```

This installs the skill into `.agents/skills/update-skillfolio-catalog` in the current project. The npm package, executable, installed directory, and invocation share the same name.

### From npm

Codex, user scope:

```bash
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target codex
```

Claude Code, user scope:

```bash
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target claude
```

Install for both agents:

```bash
npx --yes --package=update-skillfolio-catalog@latest update-skillfolio-catalog --target both
```

Use `--scope project` to install into the current repository. Use `--path <skills-root>` with exactly one target to choose an explicit skills directory. Add `--dry-run` to inspect the destination or `--force` to atomically replace an existing copy.

Start a new agent session after installation so the host refreshes its skill catalog.

## Use

In Codex:

```text
Use $update-skillfolio-catalog to synchronize this published skill with my local Skillfolio app.
```

In Claude Code:

```text
/update-skillfolio-catalog synchronize this published skill with my local Skillfolio app
```

## Capabilities

- Verifies skill identity, version, repository, package, install command, and agent compatibility from primary evidence.
- Discovers catalog authorities and generators, then traces runtime data into list and detail routes before editing.
- Updates one skill identity in authoritative inputs, regenerates derived output, and synchronizes an existing README index and sitemap workflow when present.
- Runs deterministic duplicate, shape, URL, README, and sitemap checks alongside the app's own formatting, type, test, and build commands.
- Keeps commits, pull requests, package publication, and deployment behind explicit authorization.

## How installation works

The npm executable copies the portable `skills/update-skillfolio-catalog` directory into the selected host's skill root. Installation does not locate a Skillfolio checkout, edit its catalog, commit changes, open a pull request, or deploy the application. Those actions occur only when the installed skill is invoked with the relevant local path and authority.

## Limits

The bundled validator discovers JSON-backed runtime catalogs heuristically. It does not determine editing authority by itself and does not replace generator inspection, TypeScript checks, production builds, route inspection, or source verification. The workflow updates a local Skillfolio checkout by default and does not grant permission to push or deploy changes.

## Installer options

| Option | Meaning |
| --- | --- |
| `--target codex\|claude\|both` | Required agent destination |
| `--scope user\|project` | User scope by default; project scope uses the current directory |
| `--path <skills-root>` | Exact skills root for one target |
| `--dry-run` | Show resolved destinations without writing |
| `--force` | Atomically replace an existing installation |
| `--help` / `--version` | Print CLI information |

## Development

```bash
npm ci
npm test
npm run pack:check
```

`npm test` exercises the installer, its safety boundaries, and the bundled catalog validator against a deterministic fixture. `npm run pack:check` previews the publish archive, and `prepublishOnly` runs both checks before publication.

## Updating and removing

Rerun the `@latest` installation command with `--force` to replace an older installation. To uninstall, remove only the `update-skillfolio-catalog` directory from the relevant user or project skill root.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, the local workflow, required checks, and pull-request guidance.

## Support and security

Read [SUPPORT.md](SUPPORT.md) and use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), never through a public issue. The SupportKori link is funding, not technical support.

## Project links

- [npm package](https://www.npmjs.com/package/update-skillfolio-catalog)
- [Source repository](https://github.com/montasim/skills/tree/main/skills/update-skillfolio-catalog)
- [Issue tracker](https://github.com/montasim/skills/issues)
- [Security policy](SECURITY.md)

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain catalog compatibility and verification guidance.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Update Skillfolio Catalog is available under the [MIT License](LICENSE).
