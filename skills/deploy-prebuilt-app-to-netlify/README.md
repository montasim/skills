# Deploy Prebuilt App to Netlify

> Build locally, inspect the actual deploy artifacts, upload them to an existing Netlify site with `--no-build`, and verify the live result.

[![npm version](https://img.shields.io/npm/v/deploy-prebuilt-app-to-netlify.svg)](https://www.npmjs.com/package/deploy-prebuilt-app-to-netlify)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Deploy Prebuilt App to Netlify gives an AI coding agent a guarded manual-deploy workflow for times when the repository should be built locally rather than by Netlify's remote pipeline. It identifies static, SPA, hybrid, and SSR artifacts; checks that publish and function directories are complete and safe; uploads absolute paths to the already linked site; and separates “uploaded” from “verified live.”

```sh
npx --yes --package=deploy-prebuilt-app-to-netlify@latest deploy-prebuilt-app-to-netlify --target codex
```

**[npm package](https://www.npmjs.com/package/deploy-prebuilt-app-to-netlify) · [source](https://github.com/montasim/skills/tree/main/skills/deploy-prebuilt-app-to-netlify) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- Netlify build minutes should not be consumed and a fresh local build can be uploaded directly.
- A monorepo deploy needs an explicit package filter and absolute artifact paths.
- SSR or hybrid output includes client assets plus generated Netlify functions.
- A draft or production manual deploy must be smoke-tested after upload.

Use `make-app-netlify-ready` when the task is configuration audit, build-contract repair, adapter work, or deployment preparation without a remote upload.

## Install and invoke

Node.js 18 or newer is required for the installer and offline preflight. An authorized deployment also needs Netlify CLI access and an authenticated, already linked site.

```sh
npx --yes --package=deploy-prebuilt-app-to-netlify@latest deploy-prebuilt-app-to-netlify \
  --target codex --scope project
```

The shared installer supports Codex, Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--target all` or an exact `--path` when needed.

```text
Use $deploy-prebuilt-app-to-netlify to create a fresh local build, upload a draft deploy to the linked site, and verify the root and one nested route.
```

```text
/deploy-prebuilt-app-to-netlify Deploy this reviewed build to production with --no-build. Confirm the site, target, and artifact directories immediately before upload.
```

## Deployment workflow

1. Inspect repository instructions, dirty Git state, manifests, lockfiles, framework config, `netlify.toml`, and generated output.
2. Resolve the app root, build command, publish directory, runtime model, functions, monorepo filter, linked site, and draft or production target.
3. Confirm authentication and existing linkage without printing tokens or secret environment values.
4. Produce a fresh build with the repository's declared package manager.
5. Run the bundled offline preflight and manually inspect the artifact tree.
6. Upload absolute publish and function paths with `netlify deploy --no-build`; add `--prod` only for an explicitly live update.
7. Wait for Netlify to report the deploy live, then safely request the root, a nested route, and relevant SSR or API surfaces.
8. Report the public and unique deploy URLs, uploaded directories, checks, and dirty or unpushed Git state.

## Run the artifact preflight

```sh
node /absolute/skill/root/scripts/preflight.mjs /absolute/project/root \
  --publish /absolute/project/root/dist/client \
  --functions /absolute/project/root/.netlify/functions \
  --json
```

Omit `--functions` for a static or client-only build. The preflight checks directory safety, expected entry artifacts, empty output, environment-file exposure, and obvious incomplete runtime shapes. It never authenticates or uploads and cannot prove framework runtime correctness.

## Manual upload shape

After paths and CLI behavior are verified, the skill uses the equivalent of:

```sh
netlify deploy \
  --filter <package-name-or-path> \
  --no-build \
  --dir <absolute-publish-directory> \
  --functions <absolute-functions-directory> \
  --message "Manual deploy: <reason>"
```

`--filter`, `--functions`, and `--prod` are included only when the detected contract requires them. `--trigger` is not substituted because it starts Netlify's remote build pipeline.

## Authorization boundary

An explicit manual-deploy request authorizes only the resolved linked site and target. Creating or linking a site, changing domains or environment variables, triggering a remote build, promoting or rolling back a deploy, deleting resources, committing, and pushing remain separate actions.

Before a production upload, the agent states the linked site, `production` target, and artifact directories. Missing linkage or ambiguous production intent blocks the upload instead of prompting through an unsafe guess.

## Bundled resources and installer

```text
deploy-prebuilt-app-to-netlify/
├── SKILL.md
├── agents/openai.yaml
└── scripts/preflight.mjs
```

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or `--path`. Installation does not build, authenticate, inspect a Netlify account, or deploy.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/deploy-prebuilt-app-to-netlify
npm run pack:check --workspace skills/deploy-prebuilt-app-to-netlify
```

## Limits and safety

- A successful compiler exit is insufficient when configured publish or function artifacts are missing.
- Build-minute exhaustion is not justification for uploading stale output.
- Safe smoke tests use non-mutating requests and do not create records, send emails, or alter production data.
- Success requires both Netlify's live result and public route verification.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance. Do not publish deploy tokens, site secrets, private logs, or environment values.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports maintenance. Licensed under the [MIT License](LICENSE).
