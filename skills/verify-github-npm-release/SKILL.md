---
name: verify-github-npm-release
description: Audit an existing GitHub and npm release without changing it. Use to verify tags, releases, package versions, dist-tags, install commands, CI, upstream alignment, or catalog records and return evidence-backed states.
license: MIT
---

# Verify GitHub and npm Release

Audit a claimed release as a read-only operation. Treat repository files, Git refs, GitHub API responses, npm registry responses, and CI results as evidence rather than assumptions.

Use `publish-verified-github-release` to draft or mutate a GitHub release. Use `release-agent-skill` when verification closes a coordinated Agent Skill shipment.

## Requirements

Local checks require Node.js 18 or newer and Git. Online checks may also require authenticated GitHub access, npm registry access, and network availability.

## Preserve the read-only boundary

- Run only inspection commands such as `git status`, `git rev-parse`, `git ls-remote`, `gh api`, `gh release view`, `gh run list`, and `npm view`.
- Do not edit files, install packages, execute a published package, create tags or releases, change dist-tags, push, publish, or repair findings.
- Treat `npx`, package lifecycle scripts, and application startup commands as code execution, not verification. Check the advertised command against published `bin` metadata instead.
- Stop and report `blocked` when required credentials, tools, network access, repository identity, or release identity are unavailable.

## Establish the release identity

Resolve and record these values before checking anything:

1. Local project path.
2. GitHub repository in `owner/name` form.
3. npm package name.
4. Expected semantic version.
5. Expected Git tag, normally `v<version>`.
6. Expected npm dist-tag, normally `latest`.
7. Advertised install command.
8. Optional catalog file or public catalog record.

Derive values from tracked project files and remote metadata when possible. If authoritative sources disagree, preserve the disagreement as a finding instead of choosing silently.

## Collect deterministic evidence

Run the bundled verifier from the target repository:

```bash
node <skill-root>/scripts/verify-release.mjs \
  --repo owner/repository \
  --package package-name \
  --version 1.2.3 \
  --tag v1.2.3 \
  --dist-tag latest \
  --install-command "npx --yes --package=package-name@1.2.3 executable"
```

Add `--catalog path/to/catalog.json` when a local catalog must align. Use `--offline` only for local preflight; never present skipped network checks as a completed release audit. Run `--help` for the complete interface.

Every `git`, `gh`, and `npm` subprocess has a bounded timeout. Treat a timeout as `blocked`, preserve the command as evidence, and never infer that a remote artifact is absent from a timed-out request.

The script checks:

- the local tag resolves to the expected commit;
- the working tree, current branch, upstream, and remote synchronization are observable;
- the GitHub tag and non-draft release exist for the expected version;
- npm contains the exact version and the requested dist-tag resolves to it;
- the install command names the exact package/version and a published executable;
- a successful CI run exists for the released commit when CI is configured;
- an optional catalog contains the repository, package, and version identifiers.

Review raw command errors. Do not convert an authentication or network failure into evidence that an artifact is absent.

Prefer an immutable `package@version` install command as release proof. If an advertised command uses a dist-tag such as `@latest`, accept it only when npm proves that alias currently resolves to the requested version; report the command as conditional with a warning because the alias can move. Treat an unverified or mismatched alias as a failure.

## Classify findings

Use these states consistently:

- `pass`: direct evidence matches the expected release identity.
- `warning`: optional evidence is absent, ambiguous, skipped, or does not establish correctness.
- `fail`: direct evidence contradicts the expected release identity.
- `blocked`: a required check could not run or the identity cannot be resolved safely.

Require all critical checks to pass before declaring the release verified: Git tag, GitHub release, npm exact version, expected dist-tag, install-command metadata, and local/remote commit alignment. Treat CI as critical when the repository defines CI. Treat catalog alignment as critical only when the user includes that catalog in scope.

## Report the audit

Return a compact report with:

1. **Verdict** — `verified`, `not verified`, or `blocked`.
2. **Release identity** — repository, package, version, tag, dist-tag, and commit SHA.
3. **Checks** — one row per check with state, observed value, expected value, and evidence source.
4. **Unverified areas** — skipped, unavailable, or ambiguous evidence.
5. **Findings** — exact mismatches and their consequence.
6. **Suggested next actions** — remediation guidance only; do not perform it.

Link to the GitHub release, workflow run, and npm version when available. Never claim successful installation unless the user separately authorized executing the package and that execution succeeded.

## Handle failure states

- If the local directory is not a Git repository, audit remote artifacts only and mark repository sync blocked.
- If `gh` is unauthenticated, attempt unauthenticated read-only HTTP only when permitted; otherwise mark GitHub checks blocked.
- If npm returns `E404`, distinguish an unpublished version from authentication or registry failure using the exit output.
- If a tag is annotated, dereference it to its commit before comparing SHAs.
- If the release is a draft, prerelease, or targets a different commit, report the exact state.
- If CI has no run for the released commit, do not substitute a successful run from another commit.
- If the repository has uncommitted files, report them separately; they do not change the released commit but prevent a clean local-sync claim.
