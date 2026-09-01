# Parity contract

Use this contract when creating, updating, or reconciling the parity manifest. The manifest is the traceability authority between discovered web behavior and its Android disposition; implementation work does not replace it.

## Invariant

Record every discovered user-visible behavior, side effect, and operational state as a capability. Give every capability source evidence, an Android disposition, an owner, and a closure state. Split capabilities when their Android dispositions, owners, dependencies, or verification paths differ.

The manifest is JSON. Keep it in the project documentation area unless the repository already defines a better authority. Treat paths as repository-relative when possible so evidence survives across machines.

## Top-level shape

```json
{
  "schema_version": "1.0",
  "manifest_status": "complete",
  "source": {
    "web_root": ".",
    "revision": "a source revision or working-tree identifier"
  },
  "target": {
    "android_root": "android",
    "variants": [
      {
        "id": "handheld",
        "description": "Phone and tablet application surface"
      }
    ]
  },
  "discovery": {
    "status": "complete",
    "evidence": [
      {
        "kind": "source",
        "provenance": "observed",
        "location": "src/routes",
        "detail": "Inspected the route tree and route-owned actions."
      }
    ],
    "exclusions": []
  },
  "limitations": [],
  "capabilities": []
}
```

Required top-level fields:

- `schema_version`: exactly `1.0` for this contract.
- `manifest_status`: `draft`, `in-progress`, or `complete`.
- `source.web_root`: root of the source web application.
- `source.revision`: commit, tree, or working-state identifier used during discovery.
- `target.android_root`: existing or intended Android project root. In audit or planning mode, use the path the implementation would occupy; do not insert prose such as `not-created-yet` in place of a path.
- `target.variants`: optional Android delivery surfaces with stable `id` and human-readable `description`, such as `handheld`, `tv`, `automotive`, or separate branded applications. Omit this field for a single undivided target.
- `discovery.status`: `in-progress` or `complete`.
- `discovery.evidence`: one or more evidence records showing where discovery occurred.
- `discovery.exclusions`: explicitly excluded scope as `{ "scope": "...", "justification": "..." }`. Use an empty array when nothing is excluded.
- `limitations`: evidence or environment gaps as `{ "scope": "...", "impact": "...", "next_action": "..." }`. Use an empty array only when there are no known limitations. A limitation records uncertainty; it does not silently remove a capability from scope.
- `capabilities`: one or more capability records.

`manifest_status: complete` is a release claim: discovery is complete and every capability satisfies the closure table below.

## Capability record

```json
{
  "id": "account.profile.update",
  "name": "Update profile",
  "area": "Account",
  "source_evidence": [
    {
      "kind": "runtime",
      "provenance": "observed",
      "location": "/account/profile",
      "detail": "Observed submit, success, validation, and server-error behavior."
    }
  ],
  "expected_behavior": "A signed-in user can validate and persist profile changes.",
  "states": ["loading", "ready", "validation-error", "saving", "saved", "server-error"],
  "dependencies": ["account.session.restore"],
  "android": {
    "disposition": "native-adaptation",
    "target_variants": ["handheld"],
    "rationale": "The workflow is retained while navigation and form affordances follow Android conventions.",
    "adaptation": "Use a Compose form with Android back handling and retained draft state.",
    "implementation_locations": ["android/app/src/main/java/example/account/ProfileScreen.kt"]
  },
  "verification": {
    "requirements": ["Successful updates persist after process recreation", "Validation and server failures are distinguishable"],
    "evidence": [
      {
        "kind": "test",
        "provenance": "observed",
        "location": "android/app/src/androidTest/java/example/account/ProfileScreenTest.kt",
        "detail": "Runs success and failure paths.",
        "outcome": "pass"
      }
    ]
  },
  "status": "verified",
  "blockers": [],
  "owner": "android-account"
}
```

Required fields:

- `id`: stable lowercase identifier using letters, digits, dots, or hyphens. IDs are unique and must not encode a temporary assignee.
- `name`: short human-readable capability name.
- `area`: stable product area used to group related work.
- `source_evidence`: one or more evidence records locating the web behavior. Prefer code and observed runtime evidence together when the application can be run.
- `expected_behavior`: observable contract, including meaningful side effects rather than a component description.
- `states`: unique non-empty labels for the states Android must handle. State labels are intentionally project-defined; record applicable loading, ready, empty, validation, error, offline, permission, and recovery variants instead of forcing irrelevant universal states.
- `dependencies`: capability IDs that must exist first. Keep this graph acyclic.
- `android`: disposition and implementation decision.
- `verification.requirements`: observable checks needed to prove parity or the documented adaptation.
- `verification.evidence`: evidence gathered after implementation. It may be empty until verification begins.
- `status`: `discovered`, `planned`, `in-progress`, `blocked`, `implemented`, `verified`, or `closed`.
- `blockers`: current concrete blockers. A blocked capability has at least one; other statuses have none.
- `owner`: person, agent workstream, or team accountable for the next transition.

Optional planning fields:

- `priority`: `critical`, `high`, `medium`, or `low`. Use product impact and dependency risk, not implementation convenience. The dependency graph still controls safe execution order.
- `android.target_variants`: target variant IDs to which this capability record applies. When `target.variants` contains more than one entry, supply this field. If behavior, disposition, ownership, or verification differs by variant, split the capability into variant-qualified records instead of placing conflicting decisions in one row.

Before a person or team is assigned, use a stable functional workstream such as `android-foundation`, `identity`, or `unassigned-product`; do not encode a temporary agent name in `owner` or in the capability ID.

## Lifecycle profiles

Use these combinations so audit and planning artifacts remain comparable:

| Mode or phase | Manifest | Discovery | Typical capability status |
|---|---|---|---|
| Early discovery | `draft` | `in-progress` | `discovered` |
| Source audit complete, Android unbuilt | `in-progress` | `complete` | `planned`, `blocked`, or `closed` for approved exclusions |
| Partial Android implementation | `in-progress` | `complete` or explicitly `in-progress` | `planned`, `in-progress`, `implemented`, `blocked`, `verified`, or approved `closed` |
| Reconciled release | `complete` | `complete` | `verified` for implementation dispositions and `closed` for approved non-implementation dispositions |

An audit may validate structurally while remaining `draft` or `in-progress`; validator success is not a parity-complete claim.

## Evidence

Discovery and source evidence use:

```json
{
  "kind": "source",
  "provenance": "observed",
  "location": "src/path-or-runtime-route",
  "detail": "What this evidence establishes"
}
```

Verification evidence adds an `outcome`:

```json
{
  "kind": "test",
  "provenance": "observed",
  "location": "android/path-or-device-run-id",
  "detail": "What was exercised and under which conditions",
  "outcome": "pass"
}
```

Evidence `kind` is one of `source`, `runtime`, `test`, `documentation`, `artifact`, or `decision`. Evidence `provenance` is one of `observed`, `inferred`, `historical`, or `inaccessible`; it describes how current and direct the evidence is, not whether the capability passed. Verification `outcome` is one of `pass`, `fail`, `blocked`, or `not-run`. A link or path alone is not evidence: `detail` states what it proves.

## Android dispositions

- `native-parity`: preserve the web capability and behavior through an Android-native implementation.
- `native-adaptation`: preserve the product outcome while intentionally changing interaction or presentation for Android. Supply `android.adaptation`.
- `shared`: reuse implementation or shared domain code while providing the necessary Android surface.
- `decision-required`: product or technical direction is unresolved. This cannot appear in a complete manifest.
- `deferred`: deliberately exclude the capability from this Android release. Supply `android.justification` with the decision and boundary.
- `not-applicable`: the web capability has no Android equivalent in the defined scope. Supply `android.justification` explaining why.

Every disposition requires `android.rationale`. `android.implementation_locations` contains repository-relative code or resource paths and becomes mandatory once an implementation disposition reaches `implemented` or `verified`.

## Closure table

| Disposition | Closed status | Required closure evidence |
|---|---|---|
| `native-parity` | `verified` | Implementation locations, non-empty verification requirements, and only passing verification evidence |
| `native-adaptation` | `verified` | The native-parity evidence plus a non-empty adaptation statement |
| `shared` | `verified` | Implementation locations, non-empty verification requirements, and only passing verification evidence |
| `deferred` | `closed` | Explicit justification |
| `not-applicable` | `closed` | Explicit justification |
| `decision-required` | None | Resolve the decision before declaring the manifest complete |

`implemented` means code exists; it is not parity closure. `closed` records an approved non-implementation disposition and does not mean runtime parity. A complete manifest has complete discovery, no blockers, no unresolved decisions, and every capability in its disposition-specific closed status.

## Dependency integrity

Every dependency names another capability in the same manifest. Self-dependencies, unknown IDs, duplicate dependency entries, and cycles are invalid. Dependency order does not determine file order; use the graph to sequence workstreams.

## Validator

Run:

```bash
python3 scripts/validate_parity_manifest.py path/to/android-parity.json
python3 scripts/validate_parity_manifest.py --json path/to/android-parity.json
```

Exit codes:

- `0`: the manifest satisfies the structural and closure rules for its declared status.
- `1`: the manifest was read but contains findings.
- `2`: invocation, file access, or internal failure prevented validation.

Diagnostic `code` values are stable automation keys. Messages and ordering are human-facing and may improve over time.

## Proof boundary

The validator proves JSON structure, enum values, references, graph integrity, and internal closure consistency. It cannot discover omitted web capabilities, execute either application, judge visual quality, confirm semantic equivalence, validate evidence contents, or prove that a path, test, artifact, decision, or claimed outcome is genuine. Close those gaps through source discovery, runtime comparison, Android tests, device evidence, and independent reconciliation.
