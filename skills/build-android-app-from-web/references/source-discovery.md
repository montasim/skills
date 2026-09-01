# Source discovery

Discover the web application as a behavioral contract before translating it to Android. The output is an evidence-backed capability graph, not a catalog of pages or components.

## Fix the evidence boundary

Record the source repository and revision, runnable entry point, deployed or local origin, build configuration, and Android target when one exists. Identify which roles, accounts, feature flags, datasets, locales, viewports, and network conditions are actually available. When the source or target has uncommitted changes, identify it with the base commit plus an explicit working-tree state (for example, `abc1234+dirty inspected 2026-09-01T10:30Z`) and list untracked roots that materially affect the audit. Never imply that a commit contains untracked or dirty files.

For every material observation, retain provenance:

- **Static:** repository-relative path plus symbol, declaration, or relevant line.
- **Runtime:** origin, route, viewport, role, state, build or revision, and capture time when known.
- **Contract:** API schema, product specification, test, or generated contract and its revision.
- **Inference:** the supporting evidence and the uncertainty that remains.

Mark evidence as observed, inferred, historical, or inaccessible. Never treat an old screenshot, unused-looking code, a test name, or an inaccessible screen as proof of current runtime behavior. Record secret names when necessary, never secret values.

Prefer a local, test, or staging environment for state-changing exploration. Use production read-only unless the user explicitly authorizes a bounded mutation and the consequence is understood.

## Inspect the source statically

Start from repository instructions, manifests, lockfiles, workspace configuration, runtime entry points, and tests. Detect architecture from evidence rather than assuming a framework.

Build the following inventories.

### Application boundaries

- applications, packages, shared modules, server functions, workers, and generated clients;
- build variants, environment-driven features, feature flags, tenant or role boundaries;
- rendering and delivery modes, including server rendering, client rendering, static output, installable-web behavior, and offline workers;
- authentication, authorization, session refresh, account recovery, and onboarding boundaries.

### Routes and entry points

Trace route declarations, filesystem routes, links, redirects, guards, menus, deep links, notifications, shared URLs, and programmatic navigation. Include:

- public, authenticated, privileged, hidden, and fallback routes;
- dynamic parameters, queries, tabs, filters, pagination, and nested navigation;
- modal or drawer flows that have no dedicated URL;
- alternate entry points such as emailed links, intents represented as URLs, and installable-web shortcuts.

Group equivalent parameterized routes as a route family, but preserve behaviorally distinct variants. Trace reachability as well as declaration: code presence alone does not prove a user can enter the flow.

### Workflows and interactions

For each reachable entry point, follow user goals end to end. Include visible controls and non-obvious triggers such as context menus, gestures, keyboard commands, drag and drop, bulk selection, retries, undo, background completion, and browser back or refresh.

Record:

- actor and preconditions;
- trigger and ordered decisions;
- validation and confirmation;
- successful outcome and user-visible feedback;
- cancellation, retry, rollback, and destructive effects;
- navigation, data, and external side effects.

Trace create, read, update, delete, search, sort, filter, share, import, export, upload, download, and account workflows when present. A control is not a capability until its outcome and effects are known.

### States and variability

Identify every meaningful state attached to a route or workflow:

- initial, loading, refreshing, loaded, partial, stale, and paginated;
- empty, no-results, validation, recoverable error, terminal error, and rate-limited;
- unauthenticated, expired, unauthorized, permission-denied, and feature-disabled;
- online, slow, offline, reconnecting, and conflict;
- selected, disabled, pending, optimistic, completed, and restored;
- narrow, intermediate, wide, portrait, landscape, long-content, large-text, reduced-motion, high-contrast, locale, and bidirectional-text variants where supported or required.

Use source branches, tests, copy, and state models to find states that are expensive or unsafe to trigger at runtime. Mark unobserved states as statically evidenced rather than verified.

### Data and side effects

Map domain entities, identifiers, relationships, ordering, validation, transformations, and ownership. Trace each capability through:

- API clients, endpoint method and contract, GraphQL operations, RPCs, sockets, and event streams;
- authentication headers, cookies, token lifecycle, cache keys, retries, pagination, and invalidation;
- browser storage, databases, service workers, session state, drafts, and cross-device synchronization;
- analytics, audit logging, billing, messaging, notifications, and other secondary effects.

Separate server truth from derived view state. Note data that must survive navigation, browser reload, offline use, logout, or process restart; these distinctions drive Android persistence and lifecycle decisions.

### Browser and external integrations

Inventory capabilities that require an Android decision rather than direct translation:

- files, camera, microphone, media, location, sensors, clipboard, printing, and downloads;
- sharing, external links, deep links, payments, identity providers, maps, and third-party SDKs;
- notifications, background sync, scheduled work, realtime updates, and multi-window behavior;
- browser permissions, popups, extensions, embeds, cross-origin behavior, and platform-specific fallbacks;
- accessibility semantics, keyboard or pointer assumptions, localization, theming, and privacy or consent controls.

Record the observable product outcome and the web mechanism separately. The outcome belongs in the parity contract; the mechanism may be replaced on Android.

## Inspect the running application

Run the source revision when feasible and verify representative route families and workflows at the widths and roles the product supports. Use supplied or historical screenshots only as leads until current behavior confirms them.

For each runtime path:

1. Confirm entry, navigation, visible actions, and back or refresh behavior.
2. Exercise the successful path with safe data.
3. Observe validation, loading, empty, error, permission, and offline behavior that can be reached safely.
4. Inspect network, storage, console, accessibility tree, and URL changes when they clarify effects or hidden states.
5. Compare the observation with source, tests, and contracts; record contradictions instead of choosing the convenient version.

Avoid production mutations, purchases, messages to real people, destructive operations, and privileged impersonation merely to complete the inventory. Use fixtures, test accounts, mocks, or static evidence and record the remaining limitation.

## Build the capability graph

Create one node per independently meaningful user outcome, not per screen. Give every node a stable identifier and record:

- product area and source entry points;
- actors, preconditions, triggers, and outcome;
- input, data ownership, and side effects;
- required success and failure states;
- roles, flags, permissions, and platform integrations;
- static, runtime, contract, and test evidence with confidence;
- unresolved questions and safe ways to answer them.

Connect nodes with explicit edges for navigation, shared data, authentication, sequencing, conditional availability, background completion, and shared foundations. These edges determine implementation order and safe parallel work. Treat accessibility as cross-cutting acceptance criteria by default; create a dedicated capability node only when accessibility is itself a distinct workflow or shared foundation with independent ownership or dependencies.

Do not assign Android designs during initial discovery. First capture what the source product does; use [parity-contract.md](parity-contract.md) to classify Android dispositions and [android-adaptation.md](android-adaptation.md) to choose platform behavior afterward.

## Reconcile coverage

Cross-check independent discovery surfaces so omissions become visible:

- route declarations against navigation, redirects, sitemaps, and runtime reachability;
- controls and workflows against network operations, state mutations, analytics events, and tests;
- API operations and domain models against all user-facing consumers;
- role and feature-flag branches against available accounts and fixtures;
- storage and worker behavior against reload, logout, offline, and recovery paths;
- source states against screenshots, copy catalogs, snapshots, and runtime observations;
- web capabilities against any existing Android routes, code, tests, and artifacts without assuming parity.

Maintain a coverage ledger in which every discovered route family, workflow, state branch, data mutation, and integration maps to a capability node or an explicit exclusion with reason. Resolve contradictions where evidence permits; otherwise keep both observations and mark the node for decision.

An inaccessible area is a coverage limitation, not an absent feature. A generated or declared route with no verified reachability remains an unresolved source artifact until source, runtime, or product evidence classifies it.

## Discovery completion criteria

Source discovery is complete only when:

- every in-scope route family and non-route entry point maps to the coverage ledger;
- every reachable user action maps to an end-to-end workflow and outcome;
- meaningful success, loading, empty, error, offline, authorization, permission, and restoration states are captured or explicitly unobserved;
- every data read, mutation, persistence boundary, and external integration maps to at least one capability node or justified exclusion;
- graph edges expose navigation, data, identity, sequencing, and shared-foundation dependencies;
- static, runtime, contract, and test evidence conflicts are resolved or recorded as decisions;
- roles, flags, environments, and datasets not inspected are named as limitations; and
- another agent can use the graph and provenance to reproduce the inventory without relying on unstated product knowledge.

If these criteria cannot be met, continue with the evidenced subset only when the missing area does not change the chosen work. Otherwise report the specific discovery blocker before implementation.
