# Framework integration patterns

Last reviewed against the linked primary framework documentation: 2026-08-30.

Use the project's installed version and existing conventions as the authority. These patterns identify the correct integration surface; they are not permission to add a second SEO system.

## Static HTML and Vite SPA

Put crawler-critical metadata in the source HTML template or prerendered output. Do not rely on a client-side head component unless the deployment prerenders it.

Place static assets in the framework's public directory and verify the final root-relative path after base-path handling.

## TanStack Start

Use route `head` metadata and the root head renderer already used by the application. Keep absolute URL construction in a shared site configuration. Build and inspect the server-rendered response.

## Next.js

Use the App Router metadata API or the Pages Router head mechanism already present. Prefer static metadata for a site-wide card and route-aware metadata generation for dynamic pages. Set a verified metadata base before relying on relative image paths.

## Remix and React Router framework mode

Use route meta exports and preserve parent/child metadata composition. Verify the server response for each relevant route.

## Astro

Put shared tags in the layout head and route-specific values in page props or content collections. Static builds must contain the tags in generated HTML.

## SvelteKit

Use `<svelte:head>` in the applicable layout or page and verify SSR is enabled for crawler-facing routes.

## Nuxt

Use the project's Nuxt SEO/head composables or configuration. Avoid mixing module-generated tags with manual duplicates.

## Other server frameworks

Use the template or response-head mechanism that writes metadata before the HTML leaves the server. For a CMS, prefer its supported SEO fields or extension points instead of editing generated output.

## Deployment configuration

- Netlify: static public assets normally deploy with the client output; add targeted headers only when needed.
- Vercel: verify public asset paths and any image route runtime behavior.
- Base-path deployments: test the final absolute URL, not only the local root-relative path.
- Protected previews: social crawlers cannot fetch assets behind deployment authentication.

Never add provider configuration without confirming that provider is active for the target project.

## Primary sources and drift rule

- [Next.js metadata and Open Graph images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [React Router route metadata](https://reactrouter.com/how-to/meta)
- [SvelteKit SEO guidance](https://svelte.dev/docs/kit/seo)
- [Nuxt `useSeoMeta`](https://nuxt.com/docs/api/composables/use-seo-meta)
- [TanStack Start head management](https://tanstack.com/start/latest/docs/framework/react/guide/head-management)

Framework metadata APIs and rendering behavior change. If the installed version is newer than the reviewed guidance, a linked page moved, or built HTML contradicts this reference, recheck the target framework's current official documentation and treat the actual server response as authoritative.
