# Web integration patterns

Read this file before adding or structurally repairing SupportKori in a website or web application.

## Start from the official contract

SupportKori's website widget is currently loaded from `https://supportkori.com/widget.js`. The installation element carries:

- `data-id`: the SupportKori username or project identifier;
- `data-message`: set to `Support` for this skill's requested trigger copy;
- `data-color`: a bootstrap color, not a substitute for app-specific styling;
- `data-position`: the supported corner.

Use the exact identifier already present in the project or the snippet supplied by the user. Do not guess it from a repository name, author name, or hostname.

The provider instructs sites to install the snippet once and states that its panel opens on the current page. Re-check the official setup page if the script contract or generated markup appears to have changed:

<https://www.supportkori.com/help/article/setup-widget>

## Choose the host-framework pattern

### Static HTML and site builders

- Place one asynchronous provider script near the end of `body` or in the platform's one global footer-script location.
- Do not install it both per page and globally.
- Keep app-owned style overrides after the site's base theme. Account for provider styles that may be injected later by using a stable app wrapper or narrowly increased selector specificity, not `!important` everywhere.

### Client-rendered single-page applications

- Own the integration in one root-level component or hook.
- Insert the script only after the browser DOM is available.
- Give the script a stable ID and return early when an active instance already exists.
- On unmount or hot reload, remove only artifacts owned by this integration. Never indiscriminately delete unrelated iframes, buttons, or styles.
- If the provider replaces or appends the trigger asynchronously, apply accessibility and theme enhancements after it appears. Prefer a bounded `MutationObserver` that disconnects after success over polling forever.

### SSR and hydration frameworks

DOM-mutating third-party widgets can change server-rendered markup before hydration finishes. Do not render an ordinary provider `<script>` inside server-owned content and assume it is hydration-safe.

Use one of these client-aware patterns:

- the framework's script primitive with an after-interactive/client strategy; or
- a client-only component that inserts the script in its mount lifecycle.

Keep the script outside a subtree the framework will reconcile when possible. Make initialization idempotent across route transitions, strict-mode development mounts, hot reloads, and partial navigation. A production build and browser console check are required before calling the result healthy.

## Keep enhancement code narrow

When the provider's generated trigger needs adaptation:

1. Locate it through the provider's stable selector or the exact script-owned relationship.
2. Preserve provider click behavior rather than recreating payment or panel logic.
3. Normalize the visible copy to `Support` and ensure exactly one coffee icon.
4. Add `type="button"` when the trigger is a button inside forms.
5. Supply an accessible name, visible focus state, and meaningful expanded state if the provider does not.
6. Avoid replacing `innerHTML` with untrusted content. Build any app-owned SVG or text with DOM methods or framework markup.

Provider selectors such as `.sk-widget-btn` and `.sk-widget-iframe-container` are implementation details, not a permanent API. Verify them in the running app before relying on them.

## CSP and framing

If the app defines Content Security Policy headers or meta tags, inspect them before changing anything. The widget can require, at minimum, permission for its script origin and embedded panel origin. Add the narrowest provider origin to the relevant directives; do not weaken unrelated directives or introduce wildcards.

If an iframe is blocked, inspect both sides:

- the app's `frame-src` or applicable fallback directive; and
- the provider response's `Content-Security-Policy: frame-ancestors` and `X-Frame-Options` headers.

Do not claim a CSP fix works until a browser run proves that the panel loads without violations.

## Avoid these failure modes

- A default yellow pill that ignores the application's tokens.
- Copy such as `Support montasim`, `Support me`, or `Buy me a coffee` when the requested label is `Support`.
- A normal anchor or `window.open` that sends the user to SupportKori.
- One script per route, page component, or render.
- An effect without idempotence or cleanup.
- A global selector such as `button`, `iframe`, or `svg` used to theme provider markup.
- A copied widget component from another app without re-deriving its appearance from the current app.
