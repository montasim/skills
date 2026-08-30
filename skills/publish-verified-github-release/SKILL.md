---
name: publish-verified-github-release
description: Draft evidence-based GitHub release notes and create or edit the named release only when explicitly authorized. Use for release narratives and GitHub release publication; use verify-github-npm-release for read-only release audits.
license: MIT
---

# Publish Verified GitHub Release

Use `release-agent-skill` when this release is one stage in an end-to-end Agent Skill shipment. Use `verify-github-npm-release` for a read-only audit of an existing GitHub/npm release.

## Requirements

The bundled release-evidence collector requires Node.js 18 or newer. Remote GitHub work also requires authenticated GitHub access through the tools available in the current environment.

## Set the release boundary

1. Resolve the repository, target version or tag, comparison base, and whether the request is draft-only or authorizes a GitHub mutation.
2. Treat drafting, inspection, and local file creation as read-only with respect to GitHub.
3. Treat “create,” “publish,” “edit,” or “update the GitHub release” as authorization only for the named repository and release. Ask before changing a different repository, tag, prerelease state, or release target.
4. Do not publish packages, deploy applications, push commits, or create tags unless the user separately requests those actions.

## Gather evidence

1. Inspect repository instructions and current Git state.
2. Run the bundled collector, resolving its path relative to this `SKILL.md`: `node <skill-root>/scripts/collect-release-evidence.mjs <repository-root> --tag <target-tag>`. Use `--base <tag-or-ref>` when the comparison base is known. Treat a missing requested tag or base as a blocker; package evidence comes from the target ref rather than the working tree.
3. Read relevant manifests, lockfiles, changelogs, merged changes, and user-facing documentation.
4. Run project checks only when safe and useful. Record exact commands and outcomes; never convert an unrun check into a success claim.
5. Use GitHub or package-registry lookups when current remote state matters. Distinguish local evidence from remote evidence.
6. Read [references/release-note-standard.md](references/release-note-standard.md) before drafting or substantially revising release notes.

## Resolve uncertainty

- Include only user-visible changes supported by commits, diffs, issues, changelogs, or implemented behavior.
- Label inferred impact as an inference or omit it.
- Separate breaking changes from ordinary improvements.
- Do not infer contributor names, compatibility, installation commands, test coverage, or package publication.
- Stop and ask when the tag, version, comparison range, or target repository is ambiguous enough to change the release.

## Draft release notes

1. Lead with the outcome and release purpose.
2. Group related changes by user value rather than repeating commit messages.
3. Include install or upgrade commands only when verified for this version.
4. Include migration or breaking-change guidance only when applicable; state explicitly when a compatibility break is verified.
5. Add a concise verification section with commands actually run and their results.
6. Link to the package, documentation, comparison, or source tag when those URLs are verified.
7. Keep prose specific, scannable, and free of generic celebration or unsupported superlatives.

## Create or edit a GitHub release

Proceed only with explicit authorization.

1. Confirm authenticated GitHub identity and repository target.
2. Verify the target tag and commit. Do not silently move an existing tag.
3. Save the final notes to a temporary file to preserve Markdown formatting.
4. Use the repository's established GitHub tooling to create or edit the release.
5. Verify the resulting URL, tag, target commit, draft/prerelease state, and rendered section structure.
6. Remove only temporary local files created for the operation.

## Output contract

Return:

- Repository, target tag, and comparison range
- Evidence used and material uncertainty
- Final release notes or release URL
- Validation commands and results
- External actions performed, or a clear statement that none were performed
