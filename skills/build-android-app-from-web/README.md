# Build Android App from Web

> Build, continue, audit, or repair an Android application from an existing web product without silently dropping features.

[![npm version](https://img.shields.io/npm/v/build-android-app-from-web.svg)](https://www.npmjs.com/package/build-android-app-from-web)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Build Android App from Web gives an AI coding agent an evidence-driven workflow for translating an existing web application's behavior into an appropriate Android experience. It discovers routes, workflows, data effects, states, and integrations; records every capability in a traceable parity contract; adapts browser behavior to Android conventions; and verifies the result at the evidence level the product requires.

The web application is the behavioral source, not a pixel template. The skill preserves user outcomes and product identity while making navigation, lifecycle, permissions, accessibility, offline behavior, and platform integrations native to the Android target.

```sh
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web \
  --target codex --scope project
```

**[npm package](https://www.npmjs.com/package/build-android-app-from-web) · [source](https://github.com/montasim/skills/tree/main/skills/build-android-app-from-web) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- An existing web application must become a native or appropriately hybrid Android application.
- A partial Android client must be compared with the web product before implementation continues.
- Web-to-Android feature gaps need an evidence-backed audit or repair plan.
- Several agents need a dependency-aware capability graph and exclusive implementation boundaries.
- An Android APK must be built with an honest account of build, install, launch, and device verification.

Use a general Android-development workflow instead when no existing web product defines the source behavior. Use a frontend consistency audit when the task concerns only the web interface.

## Install and invoke

Node.js 18 or newer is required for the installer. Python 3 is required for the bundled parity-manifest validator. Android implementation requires the target project's JDK, Android SDK, build system, and any emulator or device needed for runtime proof.

The shared installer supports user and project scopes, guarded replacement, dry runs, and the repository's documented agent-host targets.

Choose a host-specific command:

```sh
# OpenAI Codex
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target codex
# Claude Code
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target claude
# Gemini CLI
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target gemini
# Google Antigravity
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target antigravity
# Antigravity CLI
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target antigravity-cli
# ZCode
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target zcode
# Cursor
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target cursor
# GitHub Copilot
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target copilot
# OpenCode
npx --yes --package=build-android-app-from-web@latest build-android-app-from-web --target opencode
```

Use `--target all` for every supported preset or add `--scope project` for a repository-local install.

```text
Use $build-android-app-from-web to build an Android app from this web application, account for every discovered capability, and verify the completed app.
```

```text
Use $build-android-app-from-web to audit this partial Android client against the web application without editing either project.
```

## Parity contract

The skill creates a capability graph before broad implementation. Every in-scope capability receives one explicit Android disposition:

- native parity;
- native Android adaptation;
- shared implementation;
- decision required;
- explicitly deferred; or
- not applicable with justification.

The machine-readable parity manifest links source evidence, expected behavior, required states, dependencies, Android implementation locations, verification evidence, blockers, and ownership. A route list, screenshot set, or successful compiler exit cannot substitute for this traceability.

## Run the deterministic validator

```sh
python3 /absolute/skill/root/scripts/validate_parity_manifest.py \
  /absolute/project/path/docs/android-parity.json
```

Add `--json` for machine-readable diagnostics. The validator checks manifest structure, references, controlled values, and closure rules. It cannot establish that the web inventory is complete, Android behavior works at runtime, screenshots are visually appropriate, or a device journey passes; those require source reconciliation and runtime evidence.

## Workflow

1. Establish build, resume, audit, or repair mode and the allowed mutations.
2. Inspect web source, runtime behavior, contracts, tests, roles, states, and integrations.
3. Reconcile routes, controls, data operations, and state branches into a capability graph.
4. Classify every capability in the parity manifest before broad Android work.
5. Choose native, shared, existing-architecture, or scoped embedded-web behavior per capability.
6. Implement dependency-ordered vertical slices including data, UI, navigation, lifecycle, failures, accessibility, and tests.
7. Reconcile the finished Android application against the source graph independently when possible.
8. Report verified behavior, accepted adaptations, limitations, blockers, and artifact paths.

## Bundled resources

```text
build-android-app-from-web/
├── SKILL.md
├── agents/openai.yaml
├── references/
│   ├── android-adaptation.md
│   ├── parity-contract.md
│   ├── source-discovery.md
│   └── verification-gates.md
└── scripts/
    └── validate_parity_manifest.py
```

The npm package installs only these portable resources. Package tests, fixtures, community files, and release metadata remain development surfaces.

## Safety and limits

- Audit and planning requests remain read-only.
- Local implementation does not authorize commits, pushes, deployments, Play Console changes, signing-key operations, store submissions, or production-data mutations.
- Credentials and sensitive user data do not belong in parity manifests, fixtures, logs, screenshots, or reports.
- Inaccessible source areas remain coverage limitations rather than assumed absences.
- A built APK is not described as installed, launched, or journey-verified without the corresponding evidence.
- Platform, SDK, library, permission, and store-policy behavior must be checked against current official Android guidance when it may have changed.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/build-android-app-from-web
npm run pack:check --workspace skills/build-android-app-from-web
```

Repository releases additionally run catalog validation, installer smoke tests, Skillfolio checks, archive inspection, and consumer-side verification.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports ongoing compatibility and verification work. Licensed under the [MIT License](LICENSE).
