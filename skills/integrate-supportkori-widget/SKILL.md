---
name: integrate-supportkori-widget
description: Audit or integrate this repository's established SupportKori widget in a website or browser extension. Use for SupportKori-specific markup, placement, CSP, extension permissions, or local verification.
---

# Integrate SupportKori Widget

Make each project surface expose one reliable, theme-consistent SupportKori trigger with a coffee icon and the label **Support**. Keep the support experience inside the current app whenever the platform can safely embed it.

## Requirements

The bundled deterministic auditor requires Node.js 18 or newer. Visual and runtime verification may also require the target project's declared browser tooling.

## Respect the task boundary

- Treat an audit, review, or status request as read-only.
- Edit the project only when the user asks to add, fix, repair, implement, or otherwise change the widget.
- Do not deploy, publish, push, or change remote SupportKori, hosting, or extension-store settings without explicit authorization.
- Preserve unrelated work in dirty repositories.
- Treat a web app, marketing site, extension popup, options page, side panel, and other extension pages as separate surfaces. Report and repair each surface independently.

## Audit first

1. Identify the repository root and every user-facing surface in scope.
2. Inspect project instructions and the framework, rendering model, manifest version, content security policy, styling entry points, theme tokens, dark mode, and existing button/icon conventions.
3. Run the bundled read-only auditor from this skill directory:

   ```bash
   node scripts/audit-supportkori-widget.mjs --path /absolute/path/to/project
   ```

   Add `--json` when machine-readable evidence is useful.
4. Confirm the auditor's findings manually. Static evidence cannot prove visual consistency, runtime loading, iframe behavior, provider availability, or deployment health.
5. Assign one outcome to each surface:
   - `missing`: no usable SupportKori integration is present.
   - `present-but-unverified`: an integration exists, but runtime or visual acceptance has not been completed.
   - `theme-inconsistent`: the trigger conflicts with the incumbent design system or still resembles the provider default.
   - `functionally-broken`: the trigger duplicates, fails to load, causes hydration/CSP errors, or does not open the panel.
   - `opens-externally`: activation navigates away or opens another tab instead of an in-app panel.
   - `platform-blocked`: the requested embedded behavior is prohibited by extension policy, CSP, or provider framing restrictions.
   - `healthy`: runtime behavior and the visual acceptance criteria both pass.

Do not infer `healthy` from the auditor alone.

## Load only the guidance needed

- Read [references/integration-patterns.md](references/integration-patterns.md) before adding or structurally repairing a web integration.
- Read [references/extension-constraints.md](references/extension-constraints.md) for any browser-extension repository or extension-owned page.
- Read [references/theme-and-verification.md](references/theme-and-verification.md) whenever styling, visual consistency, interaction behavior, or final verification is in scope.

## Implement the smallest native-looking solution

Maintain these invariants unless the project has a documented, stronger convention:

- Render exactly one SupportKori integration and one visible trigger.
- Show the project's coffee icon convention, or a small accessible coffee-cup SVG, followed only by `Support`.
- Keep activation in the current app and leave the current URL unchanged.
- Open the SupportKori experience in an embedded panel or iframe supplied or supported by the integration.
- Derive the trigger's color, type, border, radius, shadow, spacing, focus ring, hover state, dark-mode behavior, and responsive placement from the target app. Never reuse one generic visual treatment across unrelated apps.
- Mount remote scripts from a client lifecycle in SSR or hydration-based frameworks. Make initialization idempotent and clean up injected artifacts when the owning component unmounts.
- Preserve the existing SupportKori account/project identifier and support URL unless the user supplies a replacement.

If provider-generated markup cannot be configured directly, apply narrowly scoped styles and a small enhancement layer only after understanding the provider DOM. Avoid broad selectors and brittle global overrides.

## Verify proportionately

1. Run the project's existing lint, typecheck, tests, and production build when available.
2. Re-run the auditor and inspect the changed files.
3. Exercise the app in a real browser when runtime behavior or styling changed.
4. Confirm one trigger, coffee icon, exact `Support` label, keyboard focus, in-app opening, unchanged URL, one panel/iframe, no hydration or CSP errors, and usable responsive placement.
5. Check all supported color schemes and the narrowest practical viewport.
6. Validate a live URL only when one is already available and the task permits read-only inspection. Keep deployment a separate, explicitly authorized action.

## Report the result

Summarize:

- surfaces audited and their final outcomes;
- files changed, if any;
- how the visual treatment follows each app's existing theme;
- static checks, build/test results, and browser checks performed;
- anything not proven, including provider availability, live deployment state, or platform restrictions.

Never describe an untested integration as healthy.
