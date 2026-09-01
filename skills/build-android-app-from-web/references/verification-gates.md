# Android parity verification gates

Read this reference when planning validation, reconciling the Android result with the web source, or deciding whether the work is complete. Verification is risk-based but traceability is exhaustive: every capability row must have a truthful outcome and evidence appropriate to its behavior.

## Build the verification matrix

Derive test cases from each capability's expected behavior, states, side effects, Android adaptation, and risk. Record the environment, build identity, input or fixture, expected result, observed result, and artifact or command for each material check. Keep static inspection, automated execution, emulator evidence, physical-device evidence, and production-service evidence distinguishable.

Cover combinations that can change behavior rather than multiplying a fixed matrix mechanically:

| Risk signal | Required emphasis |
| --- | --- |
| Every user journey | Happy path plus each declared loading, empty, validation, failure, and recovery state that applies |
| Navigation or addressable content | Back and Up behavior, cold and warm deep links, task re-entry, invalid arguments, and access guards |
| Responsive or adaptive UI | Small supported phone, representative larger width, text/display scaling, insets, and supported orientation or form-factor changes |
| Version-sensitive platform API | One environment on each side of the relevant Android behavior boundary, including the minimum supported API when affected |
| Durable state, offline work, or synchronization | Recreation, process death, upgrade/migration, offline/reconnect, retry, duplicate suppression, conflict, and sign-out boundaries as applicable |
| Permissions, notifications, background work, media, files, or hardware | Granted, denied/revoked, interruption, unavailable capability, and platform restriction states; use physical hardware when emulation cannot establish behavior |
| Sensitive identity, data, or external input | Session expiry, account separation, redaction, malformed/deceptive input, deep-link validation, exported-component and transport checks |

Use pairwise or representative coverage for low-risk combinations and deeper coverage for data loss, security, payments, identity, core playback, or safety-critical behavior. Record material combinations that remain untested and why.

## Layered evidence

Apply only the layers relevant to the discovered capabilities, but do not substitute a lower evidence layer for a higher-risk claim.

### Unit and contract evidence

- Test domain rules, transformations, validation, state reducers, pagination, retries, migrations, and restoration decisions at deterministic seams.
- Test client/server contracts against representative success and failure payloads. Preserve source semantics for ordering, absence, timestamps, locale, and error mapping.
- Exercise shared code through Android-facing adapters rather than assuming the web client's tests prove Android behavior.

### Integration evidence

- Exercise real serialization, storage, authentication/session transitions, repositories, caches, and platform adapters in isolated environments.
- Verify cancellation, concurrency, idempotency, offline transitions, and cleanup where the capability can be interrupted or repeated.
- Use controlled test accounts and services. Do not mutate production data merely to obtain parity evidence.

### UI and instrumentation evidence

- Verify Compose or View behavior for the required states, actions, focus order, semantic labels, navigation, and restoration.
- Install and launch the assembled application. Exercise representative journeys on an emulator or managed device, including rotation, backgrounding, relaunch, and process recreation when relevant.
- Use screenshot or visual-regression evidence for stable product hierarchy and responsive behavior, while testing interaction semantics separately.

### Physical-device evidence

Use a physical device when the claim depends on real codecs, DRM, camera, microphone, sensors, Bluetooth, casting, notification delivery, power management, OEM behavior, thermal constraints, or performance that an emulator cannot represent. Record the device, Android version, build, connectivity, and capability exercised.

### Build and artifact evidence

- Run the repository's relevant static analysis, unit, integration, instrumentation, and release-build commands. Record exact failures rather than replacing them with a different command silently.
- For a requested APK, report its absolute path, application ID, version, variant, minimum/target API when available, signing status, size or checksum when useful, and the command that produced it.
- Distinguish `built`, `installed`, `launched`, and `journey verified`. An APK built without an available device is not installation- or device-verified.
- Bind pre-existing reports, screenshots, APKs, and test outputs to the source and Android revisions that produced them. Evidence with an unknown or mismatched revision is historical context, not a passing result for the current manifest; record the limitation and rerun the gate when completion depends on it.

## Non-functional gates

Apply thresholds from existing product requirements when they exist; otherwise capture a baseline and flag material regressions instead of inventing universal numbers.

- **Performance and reliability:** startup, frame smoothness, memory, storage, network use, battery-sensitive work, crash/ANR signals, and recovery under the journeys that stress them.
- **Security and privacy:** secret and log scanning, secure storage, network security, WebView hardening when used, exported components, deep-link validation, backups, screenshots, clipboard use, account deletion, and retention behavior according to the discovered data sensitivity.
- **Accessibility:** automated checks plus representative TalkBack traversal, keyboard or directional focus where supported, labels and roles, dynamic announcements, contrast, large text, touch targets, and reduced motion.
- **Localization and themes:** supported locales, locale-sensitive formatting, translated expansion, right-to-left behavior, light/dark or product themes, and system contrast settings where applicable.

## Independent source-to-Android reconciliation

Use a reviewer who did not implement the capability set when delegation is available and authorized. Give the reviewer the source web application, a runnable Android build, the parity manifest, and the minimum fixtures or credentials needed; do not give them the implementers' expected verdicts.

The reviewer must:

1. Reinspect the web routes and representative runtime journeys to detect capabilities or states absent from the manifest.
2. Walk every manifest row and confirm its `source_evidence`, `expected_behavior`, `android.disposition`, `android.implementation_locations`, `status`, `blockers`, and `verification` evidence remain accurate.
3. Compare outcomes, side effects, recovery, navigation, accessibility-visible behavior, and content semantics using equivalent data. Judge approved Android adaptations against the user's goal and platform conventions rather than browser pixel identity.
4. Add any newly discovered capability as an unresolved row. Record mismatches as gaps; do not normalize them by rewriting the source expectation after seeing the Android result.
5. Produce a reconciliation summary grouped by the canonical `android.disposition`, capability `status`, and verification `outcome` values from `parity-contract.md`; do not invent parallel state names.

The implementing agent resolves or obtains acceptance for every unresolved gap, then the independent reviewer checks the affected rows again.

## Blocked and limited evidence

When a gate cannot run, record:

- the exact unavailable device, service, credential, permission, tool, or authority;
- what was attempted and the observable result;
- the lower evidence that did succeed;
- the claims that therefore remain unverified;
- the smallest next action that would close the gap.

Set the capability `status` to `blocked` when work cannot continue, and record `blocked` or `not-run` verification outcomes as defined by the parity contract rather than treating the row as verified. Examples include an APK that built but could not be installed, a notification tested only with a fake backend, or media tested on an emulator without the required codec or DRM path.

## Completion gate

The Android parity task is complete only when:

- every discovered web capability satisfies the closure rules in `parity-contract.md`; no `decision-required` or `blocked` capability remains, and adaptations, deferrals, and not-applicable outcomes carry their required rationale or justification;
- every capability committed to the current Android release has integrated implementation locations and passing evidence for its required states and side effects;
- required unit, integration, UI/instrumentation, build, and risk-driven device checks pass with no unresolved blocker; an unavailable required gate produces an incomplete, blocked handoff rather than a parity-complete claim;
- performance, security/privacy, accessibility, localization, and form-factor gates applicable to the product have evidence;
- independent reconciliation finds no uncategorized capability or unresolved in-scope mismatch;
- requested deliverables such as an APK are identified and their actual build, install, launch, and journey-verification levels are reported separately;
- the final report names accepted differences, deferred work, test environments, and artifact locations without claiming evidence that was not obtained. If a blocker remains, issue the bounded incomplete handoff described above instead of this completion claim.
