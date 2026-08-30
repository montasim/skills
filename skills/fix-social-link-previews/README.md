# Fix Social Link Previews

> Install one portable skill for Codex, Claude Code, or both that audits, creates, repairs, and verifies large-image social previews for web apps and websites.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/fix-social-link-previews.svg)](https://www.npmjs.com/package/fix-social-link-previews)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Fix Social Link Previews gives coding agents an evidence-based workflow for link-card reliability. It inspects crawler-visible HTML, validates Open Graph and Twitter Card metadata, follows the referenced image response, checks raster type and dimensions, repairs framework-native metadata, and creates a branded 1200×630 asset when one is missing.

The skill does not simulate or control proprietary WhatsApp, Slack, Discord, LinkedIn, Facebook, or X layouts. It proves that a site is eligible for a large-image preview and separates implementation failures from stale platform caches.

Version 0.3.0 catches WebP compatibility risks, declared-versus-served MIME mismatches, stale deployment origins, conflicting social images, and misleading cache-buster workflows. The package is released from the [central source](https://github.com/montasim/skills/tree/main/skills/fix-social-link-previews) under its namespaced Git tag.

## What it handles

- Raw server-response checks using a social-crawler user agent
- Open Graph, Twitter Card, canonical, title, and description validation
- Public image response, redirect, MIME type, size, and dimension checks
- WebP compatibility warnings and declared-versus-served MIME checks
- Canonical and Open Graph URL checks against the audited production route
- Detection of metadata that exists only after client hydration
- Framework-aware repairs without introducing a second SEO system
- Branded, versioned PNG or JPEG preview assets
- Cache diagnosis that treats query variants as temporary probes, not permanent share URLs
- Human-readable and JSON checker output for agents and CI

## Install

### Requirements

- Node.js 18 or newer
- Codex, Claude Code, or both with filesystem-backed skills

Run the package without a global install and choose one host:

```sh
npx --yes fix-social-link-previews@latest --target codex
npx --yes fix-social-link-previews@latest --target claude
```

Install for both hosts in one transaction:

```sh
npx --yes fix-social-link-previews@latest --target both
```

Use `--scope project` for repository-local installation, `--path /absolute/skills/root` for one custom destination, `--dry-run` to inspect the plan, and `--force` to replace an existing installation.

Restart each selected host or begin a new session after installation.

## Use the skill

Invoke it explicitly in Codex:

```text
Use $fix-social-link-previews to audit this web app and create or repair its large-image social preview.
```

For Claude Code:

```text
/fix-social-link-previews Audit this site and fix its social preview if necessary.
```

The agent will inspect the repository, run the deterministic checker, preserve a valid implementation, or make the smallest framework-native repair. It will run relevant project checks and report what remains controlled by the deployment or social platform.

## Run the checker directly

Audit a deployed page:

```sh
node skills/fix-social-link-previews/scripts/check-social-preview.mjs https://example.com/
```

Audit built HTML and resolve relative assets against a production origin:

```sh
node skills/fix-social-link-previews/scripts/check-social-preview.mjs dist/index.html \
  --base-url https://example.com/
```

Add `--json` for machine-readable output.

| Exit code | Meaning                                                  |
| --------- | -------------------------------------------------------- |
| `0`       | No metadata or asset findings                            |
| `1`       | Errors or warnings require review                        |
| `2`       | Invalid invocation, unreadable input, or request failure |

The checker parses the raw response. It does not rely on browser hydration and does not reproduce a platform's private card-selection or cache behavior.

## How it works

```text
Repository or URL
       |
       v
Crawler-visible metadata audit
       |
       +-- valid ----------> preserve and report
       |
       +-- incomplete -----> repair framework metadata
       |
       +-- missing --------> create branded raster + metadata
                                  |
                                  v
                         build and re-audit
```

The installed package contains one shared behavior contract for Codex and Claude Code:

```text
skills/fix-social-link-previews/
├── SKILL.md
├── agents/openai.yaml
├── references/
│   ├── framework-patterns.md
│   └── social-preview-standard.md
└── scripts/
    └── check-social-preview.mjs
```

## Development

```sh
git clone https://github.com/montasim/skills.git montasim-skills
cd montasim-skills
npm ci
npm test --workspace skills/fix-social-link-previews
npm run pack:check --workspace skills/fix-social-link-previews
```

| Command              | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `npm test`           | Run checker, installer, and package-contract tests |
| `npm run pack:check` | Preview the exact npm archive contents             |

GitHub Actions runs both commands for pushes to `main` and pull requests.

## Limits and safety

- A valid implementation can still display an old card until a platform cache expires or is refreshed.
- Card layout, cropping, text truncation, and large-image eligibility remain platform-controlled.
- Protected deployments and expiring image URLs are not reliable crawler targets.
- The checker recognizes WebP but flags it as a cross-platform compatibility risk; use PNG or JPEG for dependable messaging previews.
- Framework guidance follows the target project's installed version and conventions rather than hard-coding one SEO library.
- The skill does not deploy, commit, push, publish, or use authenticated cache debuggers without explicit authorization.

## Support and security

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible checker, installer, or framework-routing defects. Include the sanitized target URL, relevant response headers, Node.js version, expected result, and actual result. Never post private deployment URLs, credentials, cookies, or signed asset URLs.

Report vulnerabilities privately according to [SECURITY.md](SECURITY.md).

## Contributing

Focused issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the required checks and evidence expectations.

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain crawler compatibility research, framework guidance, and the verification suite.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Fix Social Link Previews is available under the [MIT License](LICENSE).
