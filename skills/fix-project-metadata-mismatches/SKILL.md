---
name: fix-project-metadata-mismatches
description: Audit and optionally synchronize repeated project identity and release metadata across authoritative local files. Use for version, name, URL, install-command, or compatibility drift; use make-project-github-ready for repository readiness.
license: MIT
---

# Fix Project Metadata Mismatches

Use `make-project-github-ready` for repository/community readiness or GitHub settings. Use `release-agent-skill` when metadata synchronization is one stage in an Agent Skill release.

## Requirements

The bundled metadata auditor requires Node.js 18 or newer. Additional project checks use only the target repository's declared toolchain.

## Establish scope

1. Resolve the project root and inspect repository instructions before reading or changing files.
2. Ask for a target version or canonical value only when it cannot be established from local evidence and choosing would materially change the result.
3. Treat the request as read-only unless the user explicitly asks to update, synchronize, repair, or prepare files.
4. Keep external publication outside this skill. Never push, publish, tag, deploy, create releases, or change hosting or repository settings.

## Identify authoritative evidence

Prefer explicit project configuration over prose. Establish authority separately for each field:

- Package identity and version: package or build manifest, then its lockfile.
- Repository and issue URLs: manifest fields and configured Git remote.
- Skill identity: `SKILL.md` frontmatter.
- Compatibility: executable constraints, CI matrices, framework configuration, and tested environments.
- Install commands: actual package name, binary name, package manager, and published source configuration.
- Human-facing description: current product behavior supported by code and documentation.

Do not copy a value merely because it appears most often. Report conflicting authoritative sources instead of guessing.

## Audit

1. Inventory only relevant surfaces. Common examples include package manifests and lockfiles, `SKILL.md`, application manifests, deployment files, README content, generated metadata, and catalog entries.
2. Run the bundled `scripts/audit-metadata.mjs` with Node, resolving the script path relative to this `SKILL.md`, when a Node package manifest is present: `node <skill-root>/scripts/audit-metadata.mjs <project-root>`. Add `--json` for machine-readable output and `--strict` when deterministic mismatches should fail the command. Review every coverage item marked `manual-review`, `not-represented`, `not-repeated`, or `unsupported`; zero deterministic findings is not a global consistency claim.
3. Compare each repeated value with its identified authority.
4. Classify findings:
   - **Mismatch**: two authoritative or derived surfaces disagree.
   - **Stale**: a downstream surface retains an older verified value.
   - **Unsupported**: a claim lacks project evidence.
   - **Missing**: a required downstream field is absent.
5. Report file paths, current values, expected values, and evidence. Do not modify files during an audit-only request.

## Synchronize

Proceed only when the user requests local changes.

1. State the canonical values and their evidence before editing.
2. Update authoritative sources first, then lockfiles or generated files with their native tools, then documentation and catalogs.
3. Preserve local conventions and unrelated user changes. Avoid broad string replacement.
4. Keep descriptions adapted to each surface's purpose; synchronize meaning rather than forcing identical prose.
5. Never claim compatibility, publication, test success, or a release that has not been verified.
6. Show any high-impact ambiguity and obtain direction before changing identity, ownership, licensing, public URLs, or compatibility policy.

## Validate

1. Re-run the metadata audit.
2. Run the smallest relevant native checks for changed manifests, generated files, and documentation.
3. Review the diff for unrelated edits, stale versions, broken URLs, and inconsistent install commands.
4. Report changes, remaining mismatches, commands run, and checks not run.

## Output contract

For an audit, return:

- Canonical values with source paths
- Findings grouped by severity and field
- Proposed local corrections
- Unverified or ambiguous values

For synchronization, additionally return:

- Files changed and values aligned
- Validation evidence
- Remaining manual or external actions
