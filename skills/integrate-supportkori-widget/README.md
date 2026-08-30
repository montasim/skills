# Integrate SupportKori Widget

> Add or repair one theme-consistent, policy-aware SupportKori experience on each intended web or extension surface.

[![npm version](https://img.shields.io/npm/v/integrate-supportkori-widget.svg)](https://www.npmjs.com/package/integrate-supportkori-widget)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: UNLICENSED](https://img.shields.io/badge/license-UNLICENSED-lightgrey.svg)](#license)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Integrate SupportKori Widget gives an AI coding agent a SupportKori-specific audit and implementation workflow. It maps each website, extension popup, options page, side panel, or companion site separately; preserves the existing SupportKori identifier; fits the trigger to the incumbent design system; and refuses unsafe Manifest V3, CSP, iframe, or remote-code workarounds.

The intended visible result is exactly one accessible coffee-cup trigger labeled **Support** that opens the provider experience inside the current app when the platform safely permits it.

```sh
npx --yes --package=integrate-supportkori-widget@latest integrate-supportkori-widget --target codex
```

**[npm package](https://www.npmjs.com/package/integrate-supportkori-widget) · [source](https://github.com/montasim/skills/tree/main/skills/integrate-supportkori-widget) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- A SupportKori trigger is missing, duplicated, provider-default, theme-inconsistent, or externally navigating.
- A third-party widget causes hydration, lifecycle, CSP, or duplicate-initialization problems.
- A browser extension needs separate decisions for its companion website and extension-owned pages.
- The integration must be verified across keyboard use, themes, viewports, route changes, and provider runtime behavior.

This is not a generic donation-button skill. It follows SupportKori's widget contract and reports `platform-blocked` when the requested embedded behavior would violate extension policy, framing rules, or security boundaries.

## Install and invoke

Node.js 18 or newer is required for the installer and source auditor.

```sh
npx --yes --package=integrate-supportkori-widget@latest integrate-supportkori-widget \
  --target codex --scope project
```

The shared installer also supports Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--target all` for every preset or `--path /absolute/skills/root` for another compatible host.

```text
Use $integrate-supportkori-widget to audit the landing page and extension popup. Repair only surfaces that can safely keep the SupportKori panel in-app.
```

```text
/integrate-supportkori-widget Restyle the existing trigger to match this app, then verify dark mode, mobile placement, focus, and duplicate initialization.
```

## Surface outcomes

Every in-scope surface receives one explicit result:

| Outcome | Meaning |
| --- | --- |
| `missing` | No usable SupportKori integration exists |
| `present-but-unverified` | Static evidence exists, but visual or runtime acceptance is incomplete |
| `theme-inconsistent` | The trigger conflicts with the app's design language |
| `functionally-broken` | Loading, CSP, hydration, duplication, or panel behavior fails |
| `opens-externally` | Activation navigates away instead of opening in the app |
| `platform-blocked` | Policy, framing, or permission constraints prevent a safe embedded result |
| `healthy` | Static, visual, interaction, and runtime acceptance all pass |

The deterministic auditor alone never upgrades a surface to `healthy`.

## Integration workflow

1. Map every requested surface and inspect its framework, lifecycle, manifest, CSP, styling, and theme authorities.
2. Run the bundled source auditor and manually confirm its findings.
3. For websites, load the provider script once through a framework-safe client lifecycle and keep initialization idempotent.
4. For Manifest V3 extensions, keep executable code packaged locally; do not load `widget.js` into an extension execution context.
5. Preserve provider behavior while adapting one trigger to the app's tokens, icon language, focus treatment, dark mode, responsive placement, and safe areas.
6. Run project checks and verify one integration root, one trigger, one icon, exact `Support` text, unchanged URL, one in-app panel, and no hydration or CSP errors.

## Run the source auditor

```sh
node /absolute/skill/root/scripts/audit-supportkori-widget.mjs \
  --path /absolute/path/to/project --json
```

The auditor finds source-level integration signals and risks. It cannot prove visual consistency, provider availability, iframe permissions, deployment health, or browser runtime behavior.

## Browser-extension boundary

Manifest V3 extension logic cannot execute SupportKori's remotely hosted widget script in an extension page or isolated content-script context. A remote SupportKori page may be framed only when packaged code remains privileged, the frame is isolated, CSP is narrow, provider headers allow framing, user data is protected, and store policy remains satisfied. Otherwise the skill reports the block and presents alternatives instead of weakening security controls.

## Bundled resources

```text
integrate-supportkori-widget/
├── SKILL.md
├── agents/openai.yaml
├── references/
│   ├── extension-constraints.md
│   ├── integration-patterns.md
│   └── theme-and-verification.md
└── scripts/audit-supportkori-widget.mjs
```

## Installer, development, and limits

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or an exact `--path`. Installation copies the skill only; it does not inject a script, open a browser, deploy code, or change SupportKori settings.

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/integrate-supportkori-widget
npm run pack:check --workspace skills/integrate-supportkori-widget
```

Runtime health still depends on the target application, provider availability, browser policy, and tested deployment. Deployment and remote account changes always require separate authorization.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects, and follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance. Never publish credentials, private URLs, extension user data, or provider account details.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports maintenance.

## License

This package is `UNLICENSED`. Public GitHub source and npm availability do not grant permission to copy, modify, or redistribute it. See the repository's [licensing policy](https://github.com/montasim/skills/blob/main/LICENSING.md) and contact the maintainer before reuse outside the package's intended installation workflow.
