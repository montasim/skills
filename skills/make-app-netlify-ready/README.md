# Make App Netlify Ready

[![npm version](https://img.shields.io/npm/v/make-app-netlify-ready.svg)](https://www.npmjs.com/package/make-app-netlify-ready)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Install a portable agent skill that audits a web application's Netlify build contract, identifies framework-specific deployment risks, and prepares evidence-backed local configuration repairs.

It helps Codex and Claude Code distinguish static, SPA, hybrid, and SSR deployments before changing configuration, while keeping remote Netlify actions behind explicit authorization.

## Install

Requires Node.js 18 or newer. Python 3.11 or newer is required when the installed skill runs its deterministic TOML-aware Netlify auditor.

### From this source checkout

```bash
npm ci
npm test
node ./bin/make-app-netlify-ready.js --target codex --scope project
```

This installs the skill into `.agents/skills/make-app-netlify-ready` in the current project.

### From npm

Codex, user scope:

```bash
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target codex
```

Claude Code, user scope:

```bash
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target claude
```

Install for both agents:

```bash
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target both
```

Use `--scope project` to install into the current repository. Use `--path <skills-root>` with exactly one target to choose an explicit skills directory. Add `--dry-run` to inspect the destination or `--force` to atomically replace an existing copy.

Start a new agent session after installation so the host refreshes its skill catalog.

## Use

In Codex:

```text
Use $make-app-netlify-ready to audit this app and prepare its Netlify configuration.
```

In Claude Code:

```text
/make-app-netlify-ready audit this app and prepare its Netlify configuration
```

## Capabilities

- Detects the package manager, framework, runtime model, build command, and publish-directory contract.
- Audits `netlify.toml`, output paths, routing assumptions, and version-sensitive adapter requirements.
- Guides minimal configuration repairs and local build and route verification.
- Keeps deployment, dashboard changes, environment updates, and other remote actions behind explicit authorization.

## How installation works

The npm executable copies the portable `skills/make-app-netlify-ready` directory into the selected host's skill root. Installation does not inspect an application, install a framework adapter, change Netlify settings, or trigger a deployment. Those actions occur only when the installed skill is invoked and the user authorizes the relevant scope.

## Limits

The bundled audit is read-only and heuristic. It does not prove deployed runtime behavior, generated function correctness, output freshness, remote environment configuration, or domain readiness. The skill requires the project's own toolchain for complete build and route verification.

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

`npm test` exercises the installer, its safety boundaries, and the bundled Netlify auditor against a deterministic fixture. `npm run pack:check` previews the publish archive, and `prepublishOnly` runs both checks before publication.

## Updating and removing

Rerun the `@latest` installation command with `--force` to replace an older installation. To uninstall, remove only the `make-app-netlify-ready` directory from the relevant user or project skill root.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, the local workflow, required checks, and pull-request guidance.

## Support and security

Read [SUPPORT.md](SUPPORT.md) and use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), never through a public issue. The SupportKori link is funding, not technical support.

## Project links

- [npm package](https://www.npmjs.com/package/make-app-netlify-ready)
- [Source repository](https://github.com/montasim/skills/tree/main/skills/make-app-netlify-ready)
- [Issue tracker](https://github.com/montasim/skills/issues)
- [Security policy](SECURITY.md)

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain framework compatibility and deployment verification guidance.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Make App Netlify Ready is available under the [MIT License](LICENSE).
