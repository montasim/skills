---
name: build-android-app-from-web
description: Build, continue, audit, or repair an Android app from an existing web app by tracing source capabilities to Android-equivalent behavior and verification. Use for web-to-Android migrations and parity work, not unrelated greenfield apps.
license: MIT
---

# Build Android App From Web

Treat the web application as product evidence, not as a screen template. Preserve its user outcomes, rules, data effects, and product identity while adapting interaction and presentation to Android conventions.

The governing invariant is **no silent omission**: every discovered web capability receives an explicit Android disposition and evidence.

## Establish the operating mode

Resolve the source web application, Android target, requested scope, and mode before changing files:

- **Build:** create a new Android implementation from the web product.
- **Resume:** continue a partial Android implementation after measuring existing parity.
- **Audit:** compare the applications and report gaps without editing either product.
- **Repair:** implement parity corrections within the user-authorized scope.

Treat requests to compare, inspect, identify, or plan as read-only. Build, continue, implement, and fix requests authorize relevant local project changes and proportionate local verification; they do not authorize commits, pushes, releases, store submissions, deployments, production configuration changes, or production-data mutations. Obtain explicit authorization immediately before any such external action.

Inspect repository instructions and working-tree state. Preserve unrelated changes and established Android architecture unless evidence supports a scoped migration.

## Discover the source contract

Read [source-discovery.md](references/source-discovery.md) for every mode, then inspect both source and runtime behavior when available. Record provenance and uncertainty rather than converting inaccessible routes, roles, data, or environments into assumptions.

Create the capability graph before substantial Android planning or implementation. Model user outcomes and their dependencies, including routes, workflows, states, data, side effects, permissions, and platform integrations. A route list or screenshot inventory alone is not a capability graph.

Discovery is sufficient only when every in-scope source capability is accounted for or its evidence gap is explicit.

## Establish the parity contract

Read [parity-contract.md](references/parity-contract.md) after source discovery. Create or update the machine-readable parity manifest and assign every capability one supported disposition:

- native parity;
- native Android adaptation;
- shared implementation;
- decision required;
- explicitly deferred; or
- not applicable, with justification.

For resume, audit, and repair modes, inspect the existing Android implementation independently before matching it to the source graph. Absence from navigation does not prove absence from code, and presence in code does not prove usable behavior.

Do not begin broad implementation while capabilities remain unclassified. A user decision may block one capability without blocking independent, already-authorized work.

## Choose the Android adaptation

Read [android-adaptation.md](references/android-adaptation.md) before choosing architecture or implementing Android behavior. Prefer a native Android experience that preserves the web product contract over pixel-for-pixel cloning. Choose native, shared, or scoped embedded-web implementation per capability from repository evidence, product needs, and lifecycle constraints; do not impose one framework on every project.

Plan vertical capability slices that include navigation, data, UI, state handling, persistence, accessibility, lifecycle behavior, and tests. Order them by graph dependencies and shared foundations.

When the user authorizes parallel agent work and the environment provides it, partition work by independent capability subgraphs or exclusive files. Assign one integrator to shared manifests, navigation roots, build configuration, generated files, and final reconciliation. Give each worker a bounded contract and completion evidence. Otherwise work sequentially from the same graph.

## Implement within authority

In build, resume, or repair mode:

1. Establish the smallest Android foundation required by the graph.
2. Implement dependency-ordered vertical slices.
3. Update the parity manifest as implementation and evidence change.
4. Verify failure, empty, loading, offline, permission, restoration, and accessibility behavior when the source capability or Android adaptation requires them.
5. Keep intentional Android differences explicit; parity means equivalent user outcomes, not identical controls or geometry.

Use current official Android documentation when platform, library, permission, policy, or SDK behavior may have changed. Keep secrets and sensitive user data out of manifests, logs, fixtures, and reports.

## Reconcile and verify

Read [verification-gates.md](references/verification-gates.md) before declaring parity or producing a distributable. Reconcile the completed Android app against the source capability graph rather than only against the implementation plan. Prefer an independent reconciliation pass when another authorized agent is available.

Verification must distinguish code inspection, automated tests, emulator evidence, physical-device evidence, and release-artifact evidence. Report unavailable environments as limitations; do not infer a pass from a successful build.

## Completion criteria

Finish only when:

- every in-scope source capability has one justified Android disposition;
- every implemented disposition links to Android locations and verification evidence;
- every intentional difference, deferral, decision, and inaccessible source area is visible in the handoff;
- relevant project checks pass or each failure is reported with its impact;
- build artifacts requested by the user are produced and their paths verified; and
- no external mutation is described as completed unless it was explicitly authorized and read back successfully.

Report the operating mode, coverage summary, implemented and unresolved capabilities, Android adaptations, checks run, artifact locations, and evidence limitations.
