# Frontend consistency standard

Use this reference to compare equivalent roles across routes and states. Adapt it to the product’s established design language.

## Evidence matrix

| Area | Compare | Common failure | Strong repair |
| --- | --- | --- | --- |
| Typography | Same semantic roles across routes | Arbitrary one-off sizes and line heights | Named type roles or shared utilities |
| Color | Semantic role in every theme/state | Raw colors with conflicting meanings | Role-based tokens with verified contrast |
| Spacing | Repeated component and section rhythm | Near-duplicate gaps and padding | A documented spacing scale |
| Layout | Container widths, grids, alignment | Route-specific shells that drift | Shared layout primitives |
| Components | Same control purpose | Multiple visual variants without intent | One primitive with explicit variants |
| Icons | Meaning, family, size, stroke | Mixed icon families or decorative ambiguity | One system and accessible labeling |
| States | Loaded, loading, empty, error | State geometry changes or disappears | State components derived from real layout |
| Motion | Duration, easing, trigger | Decorative motion or layout shift | Tokenized, purposeful, reduced-motion-safe motion |
| Content | Labels, casing, units, truncation | Same concept named differently | Shared content rules and formatters |

## Screenshot provenance

- Record the route, viewport, theme, state, source, and capture time when known.
- Tie a screenshot to the inspected commit or deployed build when possible.
- Treat supplied images with unknown or older provenance as historical evidence.
- Reproduce historical findings in the current runtime or source before reporting them as current defects.
- State when a comparison is illustrative rather than a verified before-and-after pair.

## Severity model

- **Blocker:** prevents task completion, makes content inaccessible, or creates severe responsive failure.
- **High:** breaks hierarchy, interaction understanding, accessibility-visible behavior, or a dominant shared pattern.
- **Medium:** creates noticeable cross-route drift or repeated friction without blocking the task.
- **Low:** isolated polish issue with limited user impact.

Severity measures user impact and repetition, not implementation effort.

## Responsive checks

- Confirm content does not depend on one exact screenshot width.
- Check navigation collapse, grid transitions, text wrapping, controls, tables, code blocks, and fixed or sticky elements.
- Identify overflow at the element that causes it; do not prescribe global `overflow-x: hidden` as a substitute for diagnosis.
- Preserve reading order and touch target usability when layouts collapse.

## State checks

- Skeletons should occupy the same major geometry as loaded content.
- Empty states should preserve page context and a relevant next action.
- Error states should explain recovery without hiding the failed surface.
- Disabled states must remain distinguishable without relying on opacity alone.
- Keyboard focus should be visible and consistent with the component hierarchy.

## Acceptance gates

A consistency audit is complete only when:

- representative routes and viewports are named;
- every finding has a comparison point;
- foundational causes are separated from symptoms;
- optional taste suggestions are separated from defects;
- the repair plan starts with the highest-leverage shared surface;
- any implementation is rechecked visually, not only compiled.
