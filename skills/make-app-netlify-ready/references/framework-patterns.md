# Netlify framework patterns

Use these patterns as an evidence checklist, not as unconditional templates. They were checked against official Netlify documentation on 2026-08-07. Verify the linked current guidance before changing version-sensitive adapters or runtime configuration.

## Common patterns

| Framework/runtime | Typical build command | Typical publish directory | Runtime notes |
| --- | --- | --- | --- |
| Vite static or SPA | `vite build` | `dist` | Add `/* /index.html 200` only for a client-routed SPA that needs history fallback. |
| Next.js | `next build` | `.next` | Netlify's OpenNext adapter handles App Router, SSR, ISR, middleware, and images with zero-config support. Static export uses `out` and has a different contract. |
| Astro | `astro build` | `dist` | Static Astro can deploy without an adapter. SSR, Netlify Image CDN integration, and Netlify platform features generally require the maintained Netlify adapter. |
| SvelteKit | `vite build` | `build` | Use the maintained Netlify adapter for server-rendered behavior. |
| Nuxt 3 | `nuxt build` | `dist` | Inspect generated platform output and installed adapter behavior rather than assuming a purely static site. |
| TanStack Start 1.132+ | `vite build` | `dist/client` | Configure `@netlify/vite-plugin-tanstack-start`; SSR and server routes are emitted for Netlify functions. |
| TanStack Start 1.121–1.131 | `vite build` | `dist` | Use the older `target: 'netlify'` integration described by Netlify. |
| TanStack Start before 1.121 | `vinxi build` | version-specific | Use the legacy server preset guidance; upgrade analysis is preferable to blindly copying old configuration. |

## Routing checks

### Static sites

Require deploy-ready HTML in the publish directory. Netlify needs an entry document such as `index.html` for a conventional static root. Confirm generated asset paths remain valid under the intended base path.

### Single-page applications

Add a history fallback only when client-side routing owns unknown application routes:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Place specific redirects before the fallback. Do not apply this rule to Next.js, TanStack Start, Astro SSR, SvelteKit SSR, or another adapter-managed runtime.

### SSR and hybrid applications

Verify the framework adapter/plugin and generated Netlify functions or framework artifacts. The client asset directory alone is not the complete runtime. A static file server cannot prove server functions, middleware, streaming, ISR, or route handlers work.

### Monorepos

Record the repository root, package directory, base directory, and publish directory separately. Netlify resolves publish paths relative to its effective base. Prefer the target repository's existing workspace commands and avoid changing unrelated packages.

## Primary sources

- Netlify framework overview: https://docs.netlify.com/build/frameworks/overview/
- TanStack Start on Netlify: https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/
- Next.js on Netlify: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- Astro on Netlify: https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/
- Monorepo configuration: https://docs.netlify.com/build/configure-builds/monorepos/
- Netlify 404 and SPA routing guide: https://docs.netlify.com/resources/troubleshooting/page-not-found-error-guide/

## Drift rule

Framework adapters and output conventions change. If a manifest version is newer than this reference, if a plugin is deprecated, or if generated output contradicts the table, treat current official framework and Netlify documentation plus the actual build artifacts as authoritative.
