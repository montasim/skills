# Find UI Inconsistencies

> Evidence-backed frontend consistency audits across routes, viewports, themes, components, and application states.

[![npm version](https://img.shields.io/npm/v/find-ui-inconsistencies.svg)](https://www.npmjs.com/package/find-ui-inconsistencies)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Find UI Inconsistencies gives an AI coding agent a disciplined way to compare equivalent interface roles instead of producing a generic style critique. It traces repeated visual symptoms back to tokens, layout primitives, shared components, state geometry, or content rules; preserves intentional hierarchy; and separates current evidence from old screenshots and personal taste.

The default operation is a read-only audit. Source changes happen only when the request explicitly includes implementation.

```sh
npx --yes --package=find-ui-inconsistencies@latest find-ui-inconsistencies --target codex
```

**[npm package](https://www.npmjs.com/package/find-ui-inconsistencies) · [source](https://github.com/montasim/skills/tree/main/skills/find-ui-inconsistencies) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- Equivalent headings, controls, cards, or page shells drift between routes.
- Mobile, tablet, and desktop layouts do not transition consistently.
- Loading, empty, error, selected, disabled, focus, or hover states feel disconnected from the loaded UI.
- A redesign needs cross-route verification against the actual design system.
- Screenshots suggest inconsistencies, but their route, viewport, state, or revision must be established before acting.

Use a general accessibility audit for standards compliance beyond visible interface states. Use a product redesign skill when the goal is a new visual direction rather than consistency within the current one.

## Install and invoke

Node.js 18 or newer is required for the installer.

```sh
# Project-local Codex installation
npx --yes --package=find-ui-inconsistencies@latest find-ui-inconsistencies \
  --target codex --scope project

# Install for every supported preset
npx --yes --package=find-ui-inconsistencies@latest find-ui-inconsistencies \
  --target all
```

The shared installer supports Codex, Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--path /absolute/skills/root` for another filesystem-backed Agent Skills host. Restart the selected host or begin a new session after installation.

Representative prompts:

```text
Use $find-ui-inconsistencies to audit the dashboard, settings, and billing routes at mobile and desktop widths. Report only; do not edit.
```

```text
/find-ui-inconsistencies Compare loading, empty, error, and loaded card states, then implement the shared-component fixes.
```

## Audit workflow

1. Resolve the routes, viewports, themes, states, and current design-system authorities.
2. Establish screenshot provenance or capture fresh runtime evidence.
3. Compare foundations before reporting component-level symptoms: typography, semantic color, spacing, radius, borders, shadows, and motion.
4. Check page structure, equivalent components, asynchronous states, responsive behavior, and content rules.
5. Record each material finding with its comparison point, user impact, root cause, smallest systemic repair, and severity.
6. Order repairs from tokens and primitives through shared components to isolated exceptions.
7. When implementation is authorized, run project checks and repeat the visual comparison at affected states and widths.

The result includes the overall assessment, prioritized findings, repair order, inspected coverage, verification, and any routes or states that could not be proven.

## Evidence model

| Layer | Examples | Why it matters |
| --- | --- | --- |
| Foundations | Type roles, spacing scale, semantic colors, motion tokens | One defect can explain many route-level symptoms |
| Structure | Containers, grids, section rhythm, breakpoints | Prevents isolated fixes that leave the page shell inconsistent |
| Components | Buttons, forms, cards, tables, navigation, dialogs | Compares controls serving the same purpose |
| States | Skeletons, empty/error states, focus, disabled, selected | Keeps temporary UI aligned with the normal workflow |
| Content | Terminology, casing, units, wrapping, truncation | Finds interaction friction that styling alone cannot repair |

Historical or unverified screenshots remain historical evidence until reproduced against the inspected source or runtime. Optional aesthetic suggestions are labeled separately from defects.

## Bundled resources

```text
find-ui-inconsistencies/
├── SKILL.md
├── agents/openai.yaml
└── references/consistency-standard.md
```

The consistency standard defines the comparison matrix, screenshot-provenance rules, severity model, responsive checks, state checks, and completion gates. The installed skill does not take screenshots or modify a project during installation.

## Installer safety and options

| Option | Behavior |
| --- | --- |
| `--target <preset[,preset...]>` | Select one or more hosts; `all`, `both`, and strict `auto` are supported |
| `--scope user\|project` | Install in a user or repository-local skills root |
| `--path <absolute-root>` | Use one exact custom skills root |
| `--dry-run` | Show destinations and actions without writing |
| `--force` | Replace an existing safe directory installation |
| `--migrate` | Replace configured legacy skill directories |

The installer rejects symlink and non-directory replacements, preflights multi-target writes, and stages replacements before publishing them.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/find-ui-inconsistencies
npm run pack:check --workspace skills/find-ui-inconsistencies
```

Package tests cover installer destinations, replacement guards, dry runs, unsafe paths, and archive contracts. The npm payload contains the installer and portable skill resources, not repository fixtures or local configuration.

## Limits and safety

- Completeness depends on representative routes, viewports, themes, and meaningful application states.
- A compilation success does not replace visual reinspection.
- Consistency does not mean flattening intentional hierarchy or replacing a product's visual direction.
- The skill does not authenticate as another user, mutate production data, commit, push, deploy, or update external design tools without separate authorization.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance. Optional [SupportKori funding](https://www.supportkori.com/montasim) supports maintenance but is not a technical-support channel.

Built and maintained by [Montasim](https://github.com/montasim). Licensed under the [MIT License](LICENSE).
