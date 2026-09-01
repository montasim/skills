# Android adaptation

Read this reference after the web capability inventory exists and before committing to an Android architecture. Treat the parity manifest as the scope authority: every discovered capability needs an Android disposition, while undiscovered platform features do not belong in the design.

## Choose the implementation strategy per capability

One application may use more than one strategy. Record the chosen strategy and rationale on the affected capability rows; do not let a project-wide label hide exceptions.

| Strategy | Prefer when | Resolve before choosing it |
| --- | --- | --- |
| Extend the existing Android architecture | An Android codebase already has sound navigation, state, data, and test seams | Confirm the conventions still fit the missing capabilities; preserve working behavior and migrations |
| Native Android, normally Jetpack Compose for a new UI | Android lifecycle, accessibility, performance, offline behavior, or platform integrations materially shape the experience | Define native equivalents for web interactions instead of translating DOM structure or CSS literally |
| Scoped hybrid embedding | A bounded web surface must retain its exact web runtime and can operate safely inside an embedded browser | Document navigation ownership, origins, authentication, cookies, downloads, uploads, offline behavior, accessibility, error recovery, and the bridge attack surface |
| Shared code | Existing portable domain, validation, networking, or multiplatform modules have stable contracts | Keep Android lifecycle and presentation concerns on the Android side; verify that sharing reduces drift rather than coupling the clients |

A full-app web wrapper is a product decision, not a shortcut. Use it only when the discovered requirements favor that tradeoff and the manifest makes the resulting native limitations explicit. If authentication, protected media, browser-only APIs, licensing, or backend behavior prevents a safe equivalent, record a decision-required or blocked outcome with evidence and alternatives.

## Derive the architecture from the capability graph

1. Group capability rows into user journeys and shared technical dependencies. Carry their data effects, required states, integrations, and authorization boundaries into the Android design.
2. Identify the smallest shared foundations: domain types, service contracts, authentication/session ownership, persistence, navigation destinations, design tokens, and platform adapters. Add a foundation only when at least one capability needs it.
3. Choose state ownership and recovery boundaries. Separate transient presentation state from durable user or domain state, and identify what must survive configuration change, activity recreation, process death, sign-out, and app upgrade.
4. Draw the dependency order between foundations and vertical capabilities. Use that order for implementation waves and tests.
5. Record each implemented capability's Android locations and unresolved dependencies in the parity manifest. A diagram or package convention may support this record but must not replace it.

Use the repository's established architecture when it remains fit for purpose. For a new app, prefer the least elaborate design that preserves testable boundaries and the discovered behavior; do not impose a named architecture merely for uniformity.

## Translate web behavior into Android behavior

Preserve the user's goal, data semantics, and recovery paths. Visual parity means recognizable product identity and hierarchy, not pixel-for-pixel reproduction of browser controls.

### Navigation and lifecycle

- Map URLs, route parameters, guarded routes, tabs, overlays, and browser history to destinations with explicit arguments and ownership.
- Define system Back, Up, modal dismissal, task re-entry, external URL, and deep-link behavior. Test deep links from a cold start and an existing task when the source app exposes addressable routes.
- Restore only state whose source semantics require restoration. Verify rotation, background/foreground transitions, process recreation, and interrupted work for affected journeys.
- Preserve pending mutations safely. Avoid replaying non-idempotent work after recreation or retry.

### Data, identity, and durable state

- Preserve API contracts, pagination, ordering, validation, cache invalidation, concurrency, and error semantics rather than reshaping them around a convenient screen model.
- Translate browser storage into storage with matching lifetime, account isolation, confidentiality, and deletion behavior. Define offline reads, queued writes, conflicts, retries, eviction, sign-out, and migrations only where the web behavior or Android requirements need them.
- Keep credentials and tokens out of source, logs, screenshots, and ordinary preferences. Use platform-backed protection appropriate to their sensitivity, constrain exported components and deep links, and justify any cleartext traffic or broad network access.
- If embedded web content participates in identity, specify origin allowlists, cookie/session sharing, bridge exposure, certificate handling, and logout behavior.

### Platform services

- Request permissions at the capability boundary with a useful explanation and complete denied, permanently denied, and revoked paths. Omit permissions that no discovered capability uses.
- Use scheduled or background work only for behavior that must continue outside the foreground. Define cancellation, retry, duplicate suppression, power/network constraints, and user-visible status.
- Add notifications only when they have a source-product equivalent or an approved Android adaptation. Define permission, channel, tap destination, stale-content, and opt-out behavior.
- Map uploads, downloads, file selection, sharing, printing, and external intents to Android's document and sharing contracts. Check URI permissions, cancellation, unavailable handlers, size limits, and sensitive-file retention.
- Add media, camera, microphone, location, sensors, Bluetooth, casting, picture-in-picture, DRM, or other hardware behavior only when discovery identifies it. Then cover interruptions, resource release, permission loss, background restrictions, and unsupported-device behavior using the relevant Android platform APIs.

### Presentation and form factors

- Reuse the product's content hierarchy, semantic colors, typography intent, imagery, and component roles while adopting Android input, focus, feedback, and system-surface conventions.
- Provide semantic labels, logical traversal, visible focus, accessible actions, usable touch targets, scalable text, sufficient contrast, and reduced-motion behavior. Do not encode meaning in color, gesture, or imagery alone.
- Preserve source locale, formatting, pluralization, and bidirectional-text behavior. Test translated expansion and right-to-left layout when those locales are supported.
- Derive adaptive layouts from supported form factors. Phones are not one fixed viewport; add tablet, foldable, television, automotive, keyboard, mouse, or stylus behavior only when the product targets them.
- Respect system bars, cutouts, safe drawing areas, orientation requirements, light/dark themes, and user font/display scaling without obscuring primary actions.

## Implement vertical capabilities

A vertical capability is complete only when its data path, business rules, UI, navigation, state restoration, platform behavior, failure paths, accessibility, and proportionate tests are integrated. Avoid parallel work that produces disconnected screens or duplicate infrastructure.

For multi-agent execution:

1. Assign one owner to shared contracts and integration points before slice work begins.
2. Give each implementation agent a bounded set of capability IDs, exclusive files or modules, declared dependencies, and a checkable handoff.
3. Schedule foundation work before dependent slices; run independent slices concurrently only after their contracts are stable.
4. Route shared-contract changes through the integration owner. Agents should report a required contract change instead of independently creating competing abstractions.
5. Merge and verify a slice before marking its manifest rows implemented. Reconcile cross-slice navigation, authentication, persistence, and design-system behavior at each integration barrier.

Every capability remains visible until it satisfies the closure rules in `parity-contract.md`. A platform limitation, changed interaction, deferral, or not-applicable judgment needs evidence and rationale; a `decision-required` row remains unresolved, and silence is not a disposition.
