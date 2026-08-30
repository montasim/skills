---
name: release-agent-skill
description: Orchestrate an Agent Skill release across metadata, GitHub readiness, package publication, release creation, catalog sync, and verification. Use for an explicitly authorized end-to-end shipment, not a single specialist stage.
license: MIT
---

# Release Agent Skill

Coordinate one Agent Skill from verified source to a reproducible release. This skill owns stage order, authorization state, and recovery; specialist skills own their detailed workflows.

## Requirements

Local validation requires Node.js 18 or newer. Publication stages may also require Git, authenticated GitHub access, npm, and any destination-specific tool named by the approved release channels.

## Use the orchestration interface

Resolve these inputs before changing release state:

- project and skill roots;
- intended version and release identity;
- requested channels: local preparation, Git, GitHub, npm, Skillfolio, or another named catalog;
- target hosts and installer surfaces;
- explicit authorization for each external mutation.

Use a specialist directly when the request covers only one stage. Invoke this orchestrator for an end-to-end shipment or a partially completed shipment whose remaining stages must be coordinated.

Read [references/release-gates.md](references/release-gates.md) before any external publication.

## Route each stage

Use these skills when they are available:

| Stage | Specialist | Completion evidence |
| --- | --- | --- |
| Repeated local identity, version, URLs, and install commands | `fix-project-metadata-mismatches` | Local authorities and derived files agree |
| Repository/community readiness and authorized GitHub metadata | `make-project-github-ready` | Local readiness is checked; authorized remote values are read back |
| Release notes and authorized GitHub release creation | `publish-verified-github-release` | Notes are evidence-backed; the named release is verified after mutation |
| Local Skillfolio authorities and generated catalog | `update-skillfolio-catalog` | Authoritative inputs, generated output, and app checks agree |
| Independent released-state audit | `verify-github-npm-release` | Critical checks return evidence-backed pass states |

This orchestrator directly owns the cross-stage plan, package archive inspection, npm publication gate, stage transitions, and partial-failure handoff. If a specialist is unavailable, use the corresponding gate in `references/release-gates.md` as a bounded fallback and report that specialist validation did not run.

## Track release state

Maintain one table with a row for every requested stage and one of these states:

- `pending`: required but not assessed;
- `ready`: local evidence satisfies the gate;
- `authorized`: the exact external mutation is approved;
- `completed`: the action returned success but is not independently verified;
- `verified`: consumer-side or provider readback matches the release identity;
- `blocked`: a prerequisite, permission, identity, or check prevents safe progress.

Advance a stage only when its completion evidence is recorded. A later stage never converts an earlier unverified action into success.

## Establish the local release baseline

Run the bundled structural/local preflight from the project root:

```sh
node <skill-directory>/scripts/preflight.mjs .
```

Use `--json` for machine-readable findings. Resolve `<skill-directory>` from the loaded skill; do not assume a Codex- or Claude-specific install path.

Treat this script as an early structural gate, not a release-ready verdict. It does not query npm, GitHub, CI, or catalogs, run project tests, or inspect a package archive.

Then:

1. Inspect the complete working tree and preserve unexplained user changes.
2. Run the repository's validation, tests, package dry run, and consumer-install smoke checks.
3. Inspect the exact package archive for required portable resources and excluded secrets, caches, fixtures, and development files.
4. Confirm that the intended npm version and Git tag are unused.
5. Use the specialists above to resolve metadata and repository-readiness findings.

Do not infer release facts from an old README or release note when manifests, code, tests, or registry data disagree.

## Verify portable distribution

- Keep the shared skill compliant with the open Agent Skills format.
- Keep host-specific presentation or invocation extensions outside the portable behavior contract.
- Test every advertised installer target in isolated temporary directories, including guarded replacement, dry-run behavior, scope rules, and shared destination roots.
- Record format validation, installer-path tests, and live host discovery as separate evidence levels. Do not turn a documented path into a runtime-verified claim.

## Prepare the release state

1. Use `fix-project-metadata-mismatches` to apply the version at the authority and regenerate derived files.
2. Use `make-project-github-ready` when repository readiness or GitHub metadata is in scope.
3. Re-run local validation after generated files and lockfiles change.
4. Use `publish-verified-github-release` to draft notes from the actual diff, checks, archive contents, and limitations.
5. Present the stage table and exact remaining external mutations before the first mutation.

Never weaken tests, delete user changes, rewrite history, or bypass registry protections to make a release pass.

## Execute only authorized stages

Execute requested stages in dependency order, marking each `completed` and then `verified`:

1. Commit the reviewed release state when requested.
2. Push the intended branch when requested.
3. Publish the exact package version when requested, then verify registry metadata.
4. Create and push the immutable version tag when requested.
5. Use `publish-verified-github-release` for the authorized GitHub release.
6. Use `update-skillfolio-catalog` for an authorized local Skillfolio update.
7. Deploy a catalog site only under separate deployment authorization.

For npm web authentication or one-time passwords, keep the publish process waiting when practical and ask the user to complete the official authentication flow. Never request that a token or password be pasted into project files or logs.

## Close with independent verification

Use `verify-github-npm-release` after publication. Supplement it with any channel-specific evidence it does not cover:

- registry version and dist-tag;
- clean install or documented runner command in a temporary location;
- Git tag target and release status;
- release title, rendered Markdown sections, and source links;
- repository description, homepage, topics, and default branch when configured;
- CI result for the released commit;
- catalog version and install command when a catalog update was authorized.

Record externally controlled delays or caches as limitations. Do not republish the same version to repair documentation.

## Handle failure safely

- If validation fails, repair local evidence and repeat the affected gates.
- If npm reports an existing version, do not overwrite it; establish a new version with the user.
- If authentication fails, preserve local and remote state and report the exact pending stage.
- If publication succeeds but a later stage fails, state which immutable artifacts already exist before retrying.
- If source, registry, tag, and catalog versions disagree, stop additional publication until the intended authority is established.

## Hand off

Report:

- release identity and final stage table;
- specialist skills used and fallbacks taken;
- local files changed, commit identifier, and checks;
- repository, registry, tag, release, and catalog evidence;
- every stage not requested, not authorized, or blocked;
- remaining cache, CI, authentication, or provider limitations.

Do not claim a complete release until every authorized stage has been verified.
