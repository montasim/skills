---
name: find-ui-inconsistencies
description: Audit cross-route frontend consistency from screenshots or a running app, and implement systemic repairs only when requested. Use for design-system drift, responsive or state inconsistencies, and redesign verification.
license: MIT
---

# Find UI Inconsistencies

Produce an evidence-backed consistency audit across the actual interface, not a generic style critique.

## Establish the audit contract

1. Resolve the target routes, viewports, themes, and states from the request and repository.
2. Determine whether the user wants an audit, implementation, or both. Treat “audit,” “review,” and “identify issues” as read-only.
3. Read repository instructions and locate the active design system: tokens, global styles, component primitives, font setup, icons, and layout shells.
4. Preserve the product’s intentional visual direction. Consistency does not mean replacing distinctive decisions with defaults.

Ask only when a missing choice would materially change the result. Otherwise state the bounded assumption and continue.

## Build visual evidence

- Prefer a running application at representative widths. Use supplied screenshots when runtime access is unavailable.
- Establish screenshot provenance before treating an image as current evidence: record its source, capture time when known, route, viewport, and whether it corresponds to the inspected commit or build. Label unverified or older screenshots as historical and confirm their findings against current source or runtime behavior.
- Cover at least one narrow mobile, one tablet or intermediate, and one desktop viewport when responsive behavior is in scope.
- Capture meaningful states: loaded, loading, empty, error, active navigation, focus, hover where practical, and long-content overflow.
- Compare equivalent elements side by side. Do not infer a site-wide pattern from one isolated component or claim a current visual defect from a historical screenshot alone.
- Inspect computed behavior and source tokens when a screenshot alone cannot establish the cause.

Do not modify production data, authenticate as another user, or trigger destructive actions merely to obtain screenshots.

## Audit in dependency order

Read [references/consistency-standard.md](references/consistency-standard.md) before a full audit. Evaluate in this order so foundational problems are not reported as dozens of component defects:

1. **Foundations:** font families, type scale, line height, color roles, spacing scale, radii, borders, shadows, and motion tokens.
2. **Structure:** containers, grids, section rhythm, alignment, density, and breakpoint behavior.
3. **Components:** buttons, inputs, navigation, cards, badges, tables, dialogs, alerts, and repeated content patterns.
4. **States:** loading skeletons, empty and error states, selected and disabled states, focus visibility, and asynchronous transitions.
5. **Content:** heading hierarchy, label casing, terminology, number formatting, truncation, and wrapping.

Distinguish intentional hierarchy from accidental inconsistency. A hero heading may differ from an article heading; two article headings serving the same role should not drift without evidence.

## Record findings

For every material finding, include:

- route, viewport, component, or source location;
- observed inconsistency and its comparison point;
- user-facing impact;
- likely root cause, marked as verified or inferred;
- smallest systemic fix;
- severity: blocker, high, medium, or low.

Group repeated symptoms under one root cause. Prefer “three heading roles bypass the type scale” over three duplicate font-size findings.

Do not report personal taste as a defect. Label optional aesthetic suggestions separately.

## Propose a repair sequence

Order fixes by leverage:

1. Correct tokens and primitives.
2. Repair shared components and layout shells.
3. Remove route-level overrides that duplicate shared behavior.
4. Align state components with their loaded counterparts.
5. Apply isolated exceptions only when the product hierarchy requires them.

When skeletons exist, compare their geometry to loaded content: container width, card count, text-line lengths, media ratio, padding, and responsive stacking. A pulsing gray rectangle is not sufficient evidence of a representative skeleton.

## Implement only when requested

If implementation is authorized:

- reuse the project’s framework, styling system, and component library;
- change shared tokens or primitives before duplicating local overrides;
- avoid adding a second design system;
- preserve reduced-motion behavior and focus visibility;
- review the diff for unrelated formatting churn;
- run relevant type, lint, test, and build checks;
- repeat the visual comparison at the affected viewports and states.

Do not commit, push, deploy, or update external design tools unless the user explicitly requests that action.

## Deliver the result

Lead with the overall consistency assessment. Then provide:

1. prioritized findings with evidence;
2. the recommended repair order;
3. implemented changes, if requested;
4. viewports and states checked;
5. automated and visual verification performed;
6. limitations caused by unavailable routes, data, authentication, or runtime access.

Do not claim the site is consistent when representative routes or states were not inspected.
