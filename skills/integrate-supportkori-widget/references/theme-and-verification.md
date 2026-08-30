# Theme and verification criteria

Read this file before styling the SupportKori trigger and before reporting a repaired integration as healthy.

## Derive the treatment from the current app

Inspect the incumbent interface before writing CSS:

- global styles, reset, and theme token declarations;
- native primary, secondary, utility, and floating actions;
- font families, weights, sizes, and tracking;
- semantic colors in every supported color scheme;
- border widths, corner radii, shadows, and elevation conventions;
- icon library, stroke weight, and icon-to-label spacing;
- focus, hover, active, disabled, and reduced-motion behavior;
- safe areas, sticky controls, chat widgets, toasts, cookie notices, and mobile navigation near the intended corner.

Prefer existing semantic CSS variables or component variants. If no tokens exist, sample the nearest comparable action and keep new values local to the widget. The result should look authored by the same team, not merely recolored.

Never move a finished treatment from one app into another without repeating this inspection.

## Trigger acceptance criteria

The visible trigger must:

- contain one recognizable coffee-cup icon and the exact visible text `Support`;
- remain legible at normal and high contrast in every supported theme;
- use an accessible control element, keyboard activation, and a visible focus indicator;
- expose an accessible name and, when practical, `aria-expanded` and a panel relationship;
- provide a practical pointer target, normally at least 40–44 CSS pixels in its compact dimension;
- avoid covering essential content at narrow widths and respect `env(safe-area-inset-*)` when applicable;
- use motion consistent with the app and respect `prefers-reduced-motion`;
- avoid provider-default yellow unless yellow is genuinely part of the app's design system.

Keep decorative SVGs `aria-hidden="true"` when the adjacent text provides the name. Do not use an emoji as the primary icon when the app has a coherent vector icon language.

## Embedded panel acceptance criteria

- Activation leaves the address bar unchanged and does not open a new browser tab or window.
- One panel or iframe becomes visible, is not clipped by the app shell, and sits above intended content without eclipsing higher-priority dialogs.
- The panel remains reachable on small viewports and does not create horizontal page overflow.
- Close behavior works with the visible close control and keyboard when the provider supports it.
- Focus does not become lost behind the panel. Do not invent a focus trap around a cross-origin iframe unless it can be implemented safely.
- A second activation does not create another script, trigger, overlay, or iframe.

## Runtime verification sequence

Use the project's normal commands and tooling; do not add a browser dependency solely for this skill unless the user authorizes it.

1. Run relevant lint, typecheck, unit tests, and a production build.
2. Start the production-equivalent app when practical.
3. Inspect the DOM after load:
   - one SupportKori script or app-owned integration root;
   - one visible trigger;
   - one coffee icon;
   - exact `Support` text;
   - no stale legacy trigger.
4. Activate the trigger and confirm:
   - the page URL is unchanged;
   - one panel or iframe opens inside the current page;
   - the SupportKori content loads rather than showing a framing or network error.
5. Check the console and network log for hydration errors, CSP violations, duplicate initialization, mixed content, and failed provider requests.
6. Repeat at a desktop viewport and the narrowest supported mobile viewport.
7. Repeat in each supported color scheme and with keyboard navigation.
8. Reload and navigate between representative routes to catch duplicate lifecycle initialization.

## Evidence and reporting

Keep static and runtime conclusions separate:

- Static inspection can prove where code, tokens, and likely risk patterns exist.
- A successful build can prove compilation, not provider behavior.
- A browser run can prove the tested local environment and viewport.
- A live read-only check can prove the currently deployed revision only when its identity is known.

Use `healthy` only after both visual and runtime acceptance pass. Otherwise choose the most precise non-healthy outcome and list what remains unverified.
