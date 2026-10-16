# Fix Social Link Previews

> Audit and repair crawler-visible Open Graph and Twitter Card previews without confusing valid metadata with platform cache behavior.

[![npm version](https://img.shields.io/npm/v/fix-social-link-previews.svg)](https://www.npmjs.com/package/fix-social-link-previews)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Fix Social Link Previews gives an AI coding agent a raw-response-first workflow for missing, small, stale, or inaccessible link cards. It checks the page metadata and the image response together, repairs framework-native metadata when needed, and separates implementation defects from a platform's private rendering and cache.

Use it when:

- a shared URL has no image, the wrong image, or a small card;
- metadata appears in the browser but not in the raw response seen by crawlers;
- `og:image` redirects, requires authentication, serves HTML, or declares the wrong MIME type;
- a site relies on SVG or WebP where broad messaging-crawler support is needed; or
- the implementation is valid but a platform still shows an old card.

The skill does not promise an exact WhatsApp, Slack, Discord, LinkedIn, Facebook, or X layout. Those platforms control rendering, eligibility, cropping, truncation, and caching.

**[npm package](https://www.npmjs.com/package/fix-social-link-previews) · [source](https://github.com/montasim/skills/tree/main/skills/fix-social-link-previews) · [issues](https://github.com/montasim/skills/issues)**

## Install

Node.js 18 or newer is required. Choose the command for the AI agent you use; the package and skill are the same in every case.

| AI agent | Installation command |
| --- | --- |
| OpenAI Codex | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target codex` |
| Claude Code | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target claude` |
| Gemini CLI | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target gemini` |
| Google Antigravity | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target antigravity` |
| Antigravity CLI | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target antigravity-cli` |
| ZCode | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target zcode` |
| Cursor | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target cursor` |
| GitHub Copilot | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target copilot` |
| OpenCode | `npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target opencode` |

Install for every supported preset at once:

```sh
npx --yes --package=fix-social-link-previews@latest fix-social-link-previews --target all
```

Add `--scope project` to install into the current repository instead of the user-level skill directory. Use an absolute `--path` when installing into another compatible Agent Skills root.

## Invoke it

After installation, ask the agent to inspect a repository, local HTML file, or deployed URL:

```text
Use $fix-social-link-previews to audit the deployed home page and repair its large-image preview. Verify the raw response and asset. Do not deploy.
```

For a cache investigation:

```text
/fix-social-link-previews Check whether this valid implementation is hidden by a stale platform cache. Audit the clean URL first and do not change canonical metadata.
```

The skill preserves valid metadata and assets, makes the smallest framework-native repair, and does not deploy, commit, push, publish, invalidate caches, or use authenticated preview debuggers without explicit authorization.

## What it checks

| Surface | Evidence required |
| --- | --- |
| Page | Title, description, canonical URL, coherent Open Graph fields, and `summary_large_image` Twitter metadata in raw HTML |
| Image | Public HTTPS response, PNG or JPEG, matching MIME declaration, useful alt text, and large-card dimensions |
| Routing | Canonical and `og:url` identify the audited route rather than an old deployment origin |
| Framework | Metadata is emitted through the project's existing server, head, or prerender mechanism |
| Cache diagnosis | The clean URL is valid before a query variant or official re-scrape tool is used as a diagnostic |

For broad compatibility, prefer a branded 1200×630 PNG or JPEG with critical content kept away from crop-prone edges.

## Deterministic checker

Run the bundled checker directly when you want a machine-readable audit or a repeatable CI check:

```sh
# Deployed page
node /absolute/skill/root/scripts/check-social-preview.mjs https://example.com/

# Built HTML with a production base for relative URLs
node /absolute/skill/root/scripts/check-social-preview.mjs dist/index.html \
  --base-url https://example.com/
```

Add `--json` for machine-readable evidence.

| Exit code | Meaning |
| --- | --- |
| `0` | The deterministic audit is clean |
| `1` | Metadata or asset findings require review |
| `2` | Invocation, input, or request failure |

The checker validates raw metadata and image responses. It does not reproduce proprietary platform caches or card-selection algorithms.

## Recommended workflow

1. Detect the framework, router, rendering model, public asset path, SEO authority, and verified production origin.
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

## Development and safety

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/fix-social-link-previews
npm run pack:check --workspace skills/fix-social-link-previews
```

Protected pages and expiring image signatures are not reliable crawler targets. WebP is recognized but reported as an interoperability risk; SVG-only social images are not accepted as broad-compatible proof.

Read the [contribution guide](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), [support policy](https://github.com/montasim/skills/blob/main/SUPPORT.md), and [security policy](https://github.com/montasim/skills/blob/main/SECURITY.md) before contributing. For bug reports, include a sanitized URL, relevant response headers, Node.js version, expected result, and actual result—never cookies, credentials, private deployments, or signed asset URLs.

Licensed under the [MIT License](LICENSE).
