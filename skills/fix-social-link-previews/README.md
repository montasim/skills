# Fix Social Link Previews

> Audit and repair crawler-visible Open Graph and Twitter Card previews without confusing valid metadata with platform cache behavior.

[![npm version](https://img.shields.io/npm/v/fix-social-link-previews.svg)](https://www.npmjs.com/package/fix-social-link-previews)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Fix Social Link Previews gives an AI coding agent a raw-response-first workflow for missing, small, stale, or inaccessible link cards. It verifies canonical, Open Graph, and Twitter metadata; follows the preview asset response; checks MIME type and dimensions; chooses the target framework's native metadata surface; and distinguishes implementation defects from a messaging platform's private rendering and cache.

```sh
npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target codex
```

**[npm package](https://www.npmjs.com/package/fix-social-link-previews) · [source](https://github.com/montasim/skills/tree/main/skills/fix-social-link-previews) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- Shared URLs show no image, the wrong image, or a small card.
- Metadata exists in the browser DOM but not in the server response seen by crawlers.
- `og:image` redirects, requires authentication, serves HTML, or declares the wrong MIME type.
- A site relies on SVG or WebP where broad messaging-crawler support is needed.
- A clean implementation still shows an old card and cache behavior must be diagnosed safely.

The skill does not promise an exact WhatsApp, Slack, Discord, LinkedIn, Facebook, or X layout. Those platforms control rendering, eligibility, cropping, truncation, and caching.

## Install and invoke

Node.js 18 or newer is required for the installer and deterministic checker.

```sh
npx --yes --package=fix-social-link-previews@latest fix-social-link-previews \
  --target codex --scope project
```

The shared installer also supports Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--target all` for every preset or `--path /absolute/skills/root` for another compatible host.

```text
Use $fix-social-link-previews to audit the deployed home page and repair its large-image preview. Verify the raw response and asset.
```

```text
/fix-social-link-previews Check whether this valid implementation is hidden by a stale platform cache. Do not deploy.
```

## What it verifies

| Surface | Required evidence |
| --- | --- |
| Page | Title, description, canonical URL, coherent Open Graph fields, and `summary_large_image` Twitter metadata in raw HTML |
| Image | Public HTTPS response, PNG or JPEG, matching MIME declaration, useful alt text, and large-card dimensions |
| Routing | Canonical and `og:url` identify the audited route rather than an old deployment origin |
| Framework | Metadata is emitted through the project's existing server, head, or prerender mechanism |
| Cache diagnosis | The clean URL is valid before a query variant or official re-scrape tool is used as a diagnostic |

The preferred broad-compatibility asset is a branded 1200×630 PNG or JPEG with critical content kept away from crop-prone edges.

## Run the checker directly

```sh
# Deployed page
node /absolute/skill/root/scripts/check-social-preview.mjs https://example.com/

# Built HTML with a production base for relative URLs
node /absolute/skill/root/scripts/check-social-preview.mjs dist/index.html \
  --base-url https://example.com/
```

Add `--json` for machine-readable evidence.

| Exit | Meaning |
| --- | --- |
| `0` | The deterministic audit is clean |
| `1` | Metadata or asset findings require review |
| `2` | Invocation, input, or request failure |

The checker validates raw metadata and image responses. It does not reproduce proprietary platform caches or card-selection algorithms.

## Repair workflow

1. Detect framework, router, rendering model, public asset path, SEO authority, and verified production origin.
2. Inspect raw server or built HTML before trusting a hydrated browser DOM.
3. Preserve a clean implementation; otherwise repair incomplete, conflicting, client-only, or stale metadata.
4. Create a versioned branded raster only from verified project identity and visual assets.
5. Integrate through the incumbent framework mechanism rather than adding a second SEO system.
6. Run project checks, inspect built output, rerun the checker, and verify deployed URLs only when deployment is in scope.
7. If implementation passes but a platform remains stale, use its official debugger or a temporary query variant without changing the canonical URL.

## Bundled resources

```text
fix-social-link-previews/
├── SKILL.md
├── agents/openai.yaml
├── references/
│   ├── framework-patterns.md
│   └── social-preview-standard.md
└── scripts/check-social-preview.mjs
```

The framework reference covers static HTML, Vite, TanStack Start, Next.js, React Router, Astro, SvelteKit, Nuxt, server frameworks, and deployment asset paths while deferring to installed versions and current official documentation.

## Installer, development, and safety

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or an exact `--path`. Installation copies the skill; it does not audit a site or change metadata.

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/fix-social-link-previews
npm run pack:check --workspace skills/fix-social-link-previews
```

- Protected pages and expiring image signatures are not reliable crawler targets.
- WebP is recognized but reported as an interoperability risk; SVG-only social images are not accepted as broad-compatible proof.
- The skill does not deploy, commit, push, publish, invalidate caches, or use authenticated preview debuggers without explicit authorization.

## Support, contribution, and license

For public bug reports, include the sanitized URL, relevant response headers, Node.js version, expected result, and actual result—never cookies, credentials, private deployments, or signed asset URLs. Use [GitHub Issues](https://github.com/montasim/skills/issues), and follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports compatibility research. Licensed under the [MIT License](LICENSE).
