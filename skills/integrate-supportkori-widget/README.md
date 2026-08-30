# Integrate SupportKori Widget

> Install a portable Agent Skill that audits or integrates a theme-consistent SupportKori widget in websites and browser extensions.

[![npm version](https://img.shields.io/npm/v/integrate-supportkori-widget.svg)](https://www.npmjs.com/package/integrate-supportkori-widget)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: UNLICENSED](https://img.shields.io/badge/license-UNLICENSED-lightgrey.svg)](#license)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Integrate SupportKori Widget gives coding agents a bounded workflow for auditing, adding, repairing, and verifying one native-looking SupportKori trigger per application surface. It covers framework lifecycle behavior, hydration, browser-extension policy, content security policy, responsive placement, theme consistency, and runtime evidence without treating a static source match as proof that the widget works.

The skill is read-only for audit requests. It edits a target project only when the user explicitly asks for implementation or repair.

## Install

Requires Node.js 18 or newer.

```sh
npx --yes --package=integrate-supportkori-widget@latest integrate-supportkori-widget --target codex
npx --yes --package=integrate-supportkori-widget@latest integrate-supportkori-widget --target claude
npx --yes --package=integrate-supportkori-widget@latest integrate-supportkori-widget --target both
```

Use `--scope project` for a project-local installation, or `--path <directory>` for an exact skills root. Restart the selected host or begin a new session after installation.

## Invoke

In Codex:

```text
Use $integrate-supportkori-widget to audit this project's user-facing surfaces and repair the SupportKori integration where needed.
```

In Claude Code:

```text
/integrate-supportkori-widget Audit this project's user-facing surfaces and repair the SupportKori integration where needed.
```

## What it handles

- Website, marketing-site, extension popup, options-page, and side-panel surfaces
- Existing SupportKori identifiers and support URLs without silently replacing them
- Framework-safe client lifecycle mounting and cleanup
- Manifest V3, remote-script, iframe, content-security-policy, and framing constraints
- Theme tokens, keyboard focus, responsive placement, dark mode, and the visible `Support` trigger
- Static auditing followed by proportionate browser and runtime verification

## Installer options

| Option | Purpose |
| --- | --- |
| `--target codex\|claude\|both` | Select the host; required |
| `--scope user\|project` | Install globally for the user or inside the current project |
| `--path <directory>` | Install into one exact custom skills root |
| `--dry-run` | Print the installation plan without writing |
| `--force` | Replace an existing regular skill directory |
| `--help` | Show complete CLI help |

The installer copies only the portable skill payload. It does not inspect an application, inject provider scripts, open a browser, deploy code, or change SupportKori account settings.

## Development

From the repository root:

```sh
npm ci
npm test --workspace skills/integrate-supportkori-widget
npm run pack:check --workspace skills/integrate-supportkori-widget
```

The tests cover the deterministic source auditor, package contract, installer safety, project and custom destinations, dry runs, and replacement guards. The publish payload is limited to `bin/`, the portable `skills/` directory, and npm-required package metadata.

## Limits

- Static analysis cannot prove provider availability, visual consistency, or successful iframe behavior.
- Extension policy or provider framing rules can make an embedded panel impossible; the skill reports that boundary rather than weakening security controls.
- Runtime and visual acceptance require the target project's actual browser environment.
- Deployment and remote SupportKori configuration always require separate authorization.

## Support and security

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately through [GitHub Security Advisories](https://github.com/montasim/skills/security/advisories/new). Do not include credentials, private URLs, or customer data in public reports.

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain the workflow and its verification guidance.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

This package is published as `UNLICENSED`. Public source and npm availability do not grant permission to copy, modify, or redistribute it. Contact the maintainer before reuse outside the package's intended installation workflow.
