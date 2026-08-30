---
name: make-app-netlify-ready
description: Audit and prepare a web application's Netlify build contract without deploying it. Use for build failures, publish directories, monorepos, SPA routing, SSR, adapters, or pre-deployment readiness.
license: MIT
---

# Make App Netlify Ready

Prepare a repository for a reproducible Netlify build while keeping remote deployment actions behind an explicit authorization boundary.

Use `deploy-prebuilt-app-to-netlify` only after this preparation is complete and the user explicitly requests a manual draft or production upload.

## Workflow

1. Inspect repository instructions and working-tree state. Preserve unrelated user changes.
2. Locate the deployable app. In a monorepo, establish the package directory, repository root, and the directory from which Netlify will run the build.
3. Read manifests, lockfiles, framework configuration, existing `netlify.toml`, redirects, functions, and CI or hosting configuration.
4. Resolve the absolute loaded skill directory containing this `SKILL.md`, then run `python3 <skill-directory>/scripts/audit_netlify.py <app-root>` for a deterministic baseline. Use `--json` when machine-readable findings help.
5. Determine whether the site is static, SPA, hybrid, or SSR. Do not infer static hosting merely because a client output directory exists.
6. Read [references/framework-patterns.md](references/framework-patterns.md) for the detected framework. Recheck official documentation when the installed framework falls outside a recorded version range or the platform behavior may have changed.
7. Report the detected build contract and material findings before editing when the user asked only to audit or diagnose.
8. When configuration changes are requested, make the smallest evidence-backed repair. Prefer repository configuration over undocumented dashboard-only settings.
9. Install or change a framework adapter only when the runtime mode requires it. Keep the repository's package manager and lockfile consistent.
10. Run the repository's own build command. Inspect the actual output rather than trusting framework defaults.
11. Re-run the audit, then verify representative routes locally. For an SPA, test a deep link; for SSR or hybrid output, use the framework adapter or Netlify-compatible local runtime rather than a plain static server.
12. Summarize changed files, build evidence, route checks, remaining environment requirements, and any remote action that was intentionally not taken.

The bundled auditor checks configuration and path heuristics. It does not prove generated function correctness, output freshness, deployed runtime behavior, or route availability; establish those separately with a fresh build and runtime checks.

## Build contract

Establish these values explicitly:

- package manager and lockfile
- app or package directory
- build command
- publish directory relative to Netlify's effective base
- runtime model: static, SPA, hybrid, or SSR
- framework adapter or Netlify plugin, including version-sensitive behavior
- functions directory and edge functions, if present
- required environment-variable names without exposing values
- route fallback or rewrite behavior

Treat a successful compiler exit as insufficient if the configured publish directory is absent, empty, or does not contain the expected deploy artifacts.

## Configuration rules

- Preserve existing `netlify.toml` sections unrelated to the repair.
- Do not add an SPA catch-all redirect to SSR, hybrid, or framework-managed routing.
- Do not add a catch-all before more specific redirects.
- Resolve `base`, `package`, and `publish` paths using Netlify's documented path semantics; do not guess from the current shell directory.
- Prefer the framework's maintained Netlify adapter over hand-written function shims.
- Do not copy secrets into `netlify.toml`, logs, commits, or the final report.
- Do not hide build failures with redirects or an arbitrary publish directory.

## Authorization boundary

Local inspection, file edits requested by the user, dependency installation needed for those edits, and local verification are in scope. Require explicit authorization before any action that creates or links a Netlify site, changes dashboard settings or environment variables, triggers a production deploy, assigns a domain, or deletes deployment resources. A request to “prepare” or “fix the build” is not deployment authorization.

## Verification

Use the repository's declared package manager. Run the narrowest relevant checks first, then the production build. After building:

- confirm the effective publish directory exists;
- inspect output shape and framework-generated Netlify artifacts;
- verify assets referenced by a rendered page exist;
- verify a root route and at least one nested route;
- distinguish a static-file check from an SSR runtime check;
- re-run `<skill-directory>/scripts/audit_netlify.py` and resolve or explain every error.

Do not claim deployment success from a local build. State “deployment-ready” only when local evidence supports the build contract, and state that the remote deployment remains unverified until it actually runs.
