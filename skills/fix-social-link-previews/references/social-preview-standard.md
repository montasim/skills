# Social preview standard

Last reviewed against the linked primary specifications and framework documentation: 2026-08-30.

## Acceptance gates

A large-image implementation is clean only when the raw crawler-visible document contains coherent page metadata and the referenced image is publicly retrievable.

### Required page signals

- A non-empty document title and meta description.
- One canonical URL for the page.
- `og:type`, `og:title`, `og:description`, `og:url`, and `og:image`.
- `twitter:card` with `summary_large_image`.
- Twitter title, description, and image, either explicit or intentionally aligned with Open Graph.

### Required image signals

- Absolute HTTPS URL for deployed pages.
- Successful response after redirects.
- Raster MIME type: PNG or JPEG for broad compatibility. Treat WebP as a compatibility finding even when it is technically valid and publicly retrievable because messaging crawler support is inconsistent.
- `og:image:type` must match the fetched image response when declared.
- Recommended dimensions: 1200×630, approximately 1.91:1.
- Meaningful `og:image:alt` and `twitter:image:alt`.
- No authentication, cookies, expiring signature, crawler block, or HTML error response.

Treat dimensions below 600×315, a portrait or square-only image, SVG-only delivery, a missing MIME type, and conflicting duplicate tags as findings. Platform limits change; do not present a file-size threshold as universal law. Flag unusually large assets for review.

## Raw HTML rule

Social crawlers commonly do not execute application JavaScript. Metadata that appears only after hydration is not reliable. Validate the original HTTP response or built HTML, not the browser DOM alone.

## Content quality

- Keep the title specific and recognizable.
- Describe the product's concrete job in plain language.
- Do not stuff keywords or duplicate the URL as the title or description.
- Use route-specific facts for article, product, or skill pages.
- Keep image text short enough to survive thumbnail rendering and cropping.

Length heuristics are warnings, not standards. A clear short title can outperform a padded title, and platforms truncate at different lengths.

## Caching diagnosis

When raw metadata and image responses are correct but a platform shows an older card:

1. Audit the clean shared page URL first and confirm it is exactly the intended route.
2. Confirm the deployed HTML references the new asset.
3. Use a new versioned asset filename for changed images.
4. Use the platform's official re-scrape/debugger when available and authorized.
5. For diagnosis, share a harmless query-string variant of the page URL to test a fresh cache key.

The query-string variant is evidence of caching, not a permanent fix. Do not tell users they must keep sharing it, and do not change canonical URLs merely to manipulate a chat cache.

## Severity model

- **Error:** prevents or materially undermines a preview, such as missing core OG tags, crawler-invisible metadata, unreachable image, HTML served as an image, or non-absolute deployed image URL.
- **Warning:** may reduce quality or interoperability, such as missing alt text, nonstandard dimensions, duplicate equivalent tags, or unusually large assets.
- **Info:** verified facts useful for diagnosis, such as final redirect URL, MIME type, dimensions, and crawler/user-agent differences.

The bundled checker reports evidence. The agent remains responsible for framework correctness, brand quality, and the final diff.

## Primary sources and drift rule

- [The Open Graph protocol](https://ogp.me/)
- [Next.js metadata and Open Graph images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Nuxt `useSeoMeta`](https://nuxt.com/docs/api/composables/use-seo-meta)

Social platforms control card eligibility, rendering, image support, and caches, and their rules can change without notice. Recheck current official platform guidance when a provider contradicts this standard; preserve correct Open Graph metadata and label provider-specific behavior as observed evidence rather than a universal guarantee.
