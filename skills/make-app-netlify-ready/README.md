# Make App Netlify Ready

> Establish and repair a reproducible Netlify build contract for static, SPA, hybrid, SSR, and monorepo applications—without deploying.

[![npm version](https://img.shields.io/npm/v/make-app-netlify-ready.svg)](https://www.npmjs.com/package/make-app-netlify-ready)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Make App Netlify Ready gives an AI coding agent a framework-aware way to diagnose build failures, missing deployed pages, incorrect publish paths, monorepo base-directory mistakes, SPA rewrites, and incomplete SSR output. It derives the contract from manifests, lockfiles, framework configuration, `netlify.toml`, adapters, and fresh artifacts instead of copying a provider preset blindly.

Local preparation is the whole scope. Deployments, site linkage, dashboard settings, domains, and remote environment changes remain separate actions.

```sh
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target codex
```

**[npm package](https://www.npmjs.com/package/make-app-netlify-ready) · [source](https://github.com/montasim/skills/tree/main/skills/make-app-netlify-ready) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- Netlify reports that the base or publish directory does not exist.
- A Vite SPA works at `/` but deep links return 404.
- A client output folder is being mistaken for a complete SSR or hybrid deployment.
- Next.js, Astro, SvelteKit, Nuxt, or TanStack Start needs a version-appropriate adapter contract.
- A monorepo needs its repository root, app root, effective base, build command, and publish path resolved separately.

Use `deploy-prebuilt-app-to-netlify` only after the application is locally ready and a draft or production manual upload is explicitly requested.

## Install and invoke

Node.js 18 or newer is required for the installer. Python 3 is required for the bundled TOML-aware auditor; the target app's own package manager and framework toolchain are required for complete verification.

```sh
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready \
  --target codex --scope project
```

The shared installer supports Codex, Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--target all` or an exact `--path` as needed.

Use the same command with the target for your host:

```sh
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target claude
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target gemini
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target antigravity
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target antigravity-cli
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target zcode
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target cursor
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target copilot
npx --yes --package=make-app-netlify-ready@latest make-app-netlify-ready --target opencode
```

```text
Use $make-app-netlify-ready to diagnose this monorepo's Netlify base-directory error, implement the smallest local repair, and verify a production build. Do not deploy.
```

```text
/make-app-netlify-ready Audit whether this app is static, SPA, hybrid, or SSR and report the effective build contract without editing.
```

## Build contract

The skill resolves these values explicitly:

| Field | Question answered |
| --- | --- |
| Package manager | Which lockfile and native commands are authoritative? |
| App directory | Which workspace package is deployable? |
| Effective base | From where does Netlify resolve commands and paths? |
| Build command | Which repository command produces deploy artifacts? |
| Publish directory | Which path, relative to the effective base, contains public output? |
| Runtime model | Static, client-routed SPA, hybrid, or SSR? |
| Adapter/plugin | Which maintained integration matches the installed framework version? |
| Functions | Which generated functions or edge functions complete the runtime? |
| Environment | Which variable names are required, without exposing their values? |
| Routing | Which redirects or framework-managed rewrites own deep links? |

A successful compiler exit does not pass when the effective publish directory is absent, empty, or missing required runtime artifacts.

## Run the deterministic audit

```sh
python3 /absolute/skill/root/scripts/audit_netlify.py /absolute/app/root --json
```

The auditor checks framework and configuration heuristics, path relationships, routing rules, and common contract mistakes. It does not prove output freshness, generated function correctness, remote environment values, live routing, or deployed behavior.

## Preparation workflow

1. Inspect repository instructions and preserve unrelated working-tree changes.
2. Locate the deployable app and separate repository root, workspace root, app root, and Netlify base.
3. Read manifests, lockfiles, framework config, `netlify.toml`, redirects, functions, and existing host configuration.
4. Run the auditor, classify the runtime, and consult the recorded framework pattern for the installed version.
5. For implementation requests, make the smallest repository-native configuration or adapter repair.
6. Run the application's own production build and inspect the actual output shape.
7. Verify the root and a representative nested route using a runtime appropriate to static, SPA, or SSR output.
8. Rerun the audit and report local evidence, remaining environment requirements, and the intentionally unperformed remote deployment.

An SPA catch-all is added only when client routing owns unknown routes. It is never used to hide SSR, hybrid, adapter, or publish-directory failures.

## Bundled resources and installer

```text
make-app-netlify-ready/
├── SKILL.md
├── agents/openai.yaml
├── references/framework-patterns.md
└── scripts/audit_netlify.py
```

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or `--path`. Installation does not inspect an app, add an adapter, connect a site, or deploy.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/make-app-netlify-ready
npm run pack:check --workspace skills/make-app-netlify-ready
```

## Limits and safety

- Framework output and Netlify adapter behavior are version-sensitive; current official docs and fresh artifacts override stale defaults.
- Secrets are never copied into `netlify.toml`, logs, commits, or reports.
- A local success supports “deployment-ready,” not “deployed successfully.”
- Site creation, linkage, settings, environment variables, domains, and deployment require separate authorization.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports framework compatibility work. Licensed under the [MIT License](LICENSE).
