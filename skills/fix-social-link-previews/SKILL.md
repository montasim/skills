---
name: fix-social-link-previews
description: Audit, repair, and verify crawler-visible Open Graph and Twitter Card previews for websites. Use for missing, small, stale, or inaccessible link cards while preserving existing SEO and deployment behavior.
license: MIT
---

# Fix Social Link Previews

Ensure the target site has a crawler-visible, branded, large-image social preview and prove the implementation as far as the available environment allows.

## Resolve the input

- Accept a repository, local HTML file, deployed page URL, or any combination the user provides.
- When given only a repository, inspect it locally and use a production origin only when deployment configuration or verified project metadata establishes one.
- When deployed verification is requested but no production URL can be verified, continue with the local audit and ask for the URL before claiming production success.
- Treat Node.js 18 or newer as a requirement for the bundled checker. If it is unavailable, continue with repository and raw-response inspection, then report that the deterministic checker did not run.

## Set the boundary

- Resolve the project root with `git rev-parse --show-toplevel` when possible.
- Treat repository evidence and verified HTTP responses as authoritative.
- Preserve valid metadata and assets. Make the smallest framework-native repair.
- Do not deploy, commit, push, publish, invalidate production caches, or use authenticated preview debuggers unless the user explicitly authorizes it.
- Do not promise an exact WhatsApp, Slack, Discord, LinkedIn, Facebook, or X layout. Platforms own presentation, eligibility rules, and caching.
- Never use secret files or expose tokens while inspecting deployment configuration.

## Load the standards

Read [references/social-preview-standard.md](references/social-preview-standard.md) before auditing or editing. Read [references/framework-patterns.md](references/framework-patterns.md) only when choosing an implementation location for the detected framework.

## Inspect before editing

Identify:

- the framework, router, rendering model, public/static asset directory, and SEO abstraction;
- the canonical production origin from deployment config or verified project metadata;
- existing title, description, canonical, Open Graph, and Twitter Card declarations;
- existing logos, icons, colors, fonts, screenshots, and social images;
- whether metadata is present in the raw server response or added only after hydration;
- relevant deployment headers, redirects, base paths, and image optimization behavior.

Do not infer a production origin from a local port, repository remote, account name, or deployment provider alone.

## Run the deterministic audit

Resolve the absolute installed skill directory containing this `SKILL.md`, then run:

```sh
node "<skill-directory>/scripts/check-social-preview.mjs" <url-or-html-file>
```

Use `--json` for machine-readable output. For an HTML file, pass `--base-url https://example.com/` when relative URLs must be resolved and remote image verification is appropriate.

Exit codes are `0` for a clean audit, `1` for findings, and `2` for invalid invocation or internal failure. The checker validates raw metadata and image responses; it does not reproduce a platform cache or proprietary card-selection algorithm.

## Decide whether to preserve, repair, or create

Preserve when the raw response and asset pass the standard and the user only suspected a problem. Explain likely cache behavior without creating churn.

Repair when metadata exists but is incomplete, duplicated, client-only, relative on a deployed page, inconsistent across routes, or points to an invalid asset.

Create when no usable social preview exists. Derive content and visuals from verified brand and product evidence rather than generic copy or invented claims.

## Create the preview asset

- Prefer a static PNG or JPEG at 1200×630 for broad crawler compatibility.
- Reuse verified brand assets and the site's real palette and typography.
- Keep critical text and logos away from edges because platforms may crop thumbnails.
- Use a short product name, concrete value statement, and restrained supporting detail.
- Generate or render the raster with tools already present in the project. If image-generation tooling is available, use it only when the brand direction benefits from original raster artwork. For typography-led cards, prefer an HTML/SVG template rendered to PNG with an existing browser or image dependency.
- Do not ship SVG as the only social image. Do not create a screenshot of a messaging-app composer; create the image the composer consumes.
- Use a versioned filename when replacing a previously deployed image so crawlers receive a new asset URL.

If the environment cannot produce a production-safe raster, create the metadata integration only when the user supplies an existing image; otherwise report the missing asset as the blocker instead of shipping a fake or incompatible file.

## Integrate framework-native metadata

Follow the detected framework's established head/metadata mechanism. Keep one canonical source of truth for site URL, title, description, and preview image where the project architecture supports it.

At minimum provide crawler-visible:

- document title and meta description;
- canonical URL;
- `og:type`, `og:title`, `og:description`, `og:url`, and `og:image`;
- `og:image:secure_url`, `og:image:type`, width, height, and alt text when known;
- `twitter:card=summary_large_image`, title, description, image, and image alt text.

Use absolute HTTPS URLs in deployed metadata. Ensure route-specific pages use their own canonical URL and truthful copy while sharing a site-wide image only when appropriate.

Prefer PNG or JPEG for social metadata even when the visible page uses WebP. Treat a WebP-only social image as a compatibility finding because messaging crawlers do not support it consistently. Verify that `og:image:type` matches the fetched response and that the canonical and `og:url` identify the audited production route rather than an old deployment origin.

## Verify the repair

1. Run formatting, type, test, and production build commands appropriate to the repository.
2. Inspect the raw built or server-rendered HTML without relying on browser hydration.
3. Run the bundled checker against the local result.
4. When a deployed URL is in scope, fetch it with a social-crawler user agent and run the checker against production.
5. Confirm the image returns `200`, an accepted raster MIME type, expected dimensions, and no authentication or redirect loop.
6. Audit representative static and dynamic routes. When the site has a sitemap or content catalog, check every public route that may produce distinct metadata.
7. Review the diff and confirm unrelated SEO, routes, analytics, and deployment behavior remain unchanged.

Do not mark the task complete solely because the image opens in a browser. Do not mark a valid implementation broken solely because one chat application still shows a cached card.

### Diagnose a stale platform card

Always audit the clean public URL first. If its raw metadata and image pass but a messaging app still omits or shows an old image:

1. Confirm the clean URL returns the intended PNG or JPEG to the platform crawler user agent.
2. Use the platform's official re-scrape tool when one exists and the user authorizes it.
3. Optionally test a harmless query variant such as `?v=3` to prove that a fresh cache key renders differently.
4. Keep the canonical and `og:url` on the clean URL.

Describe a query variant as a temporary diagnostic cache-buster, never as the permanent URL the user must share. Prefer a versioned image filename when the underlying preview asset changes.

## Hand off

Report:

- whether the prior state was valid, missing, broken, client-only, or likely cached;
- metadata and asset changes made;
- checker and project commands run;
- the verified local or deployed URL;
- platform-controlled limitations and any cache-refresh action the user may need.
