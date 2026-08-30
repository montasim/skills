---
name: deploy-prebuilt-app-to-netlify
description: Deploy verified local build artifacts to an existing Netlify site without a remote build. Use for authorized draft or production uploads; use make-app-netlify-ready for audit or configuration work.
license: MIT
---

# Deploy Prebuilt App to Netlify

Upload a verified local build to Netlify without asking Netlify to run the repository build command.

Use `make-app-netlify-ready` for audit, diagnosis, or build-contract repair without a remote upload.

## Requirements

The offline preflight requires Node.js 18 or newer. Deployment requires Netlify CLI and access to the intended existing Netlify site.

## Authorization boundary

A manual deploy mutates a remote site. Treat an explicit request to manually deploy as authorization only when the repository, linked Netlify site, and draft or production target are clear from the request or current context.

- For an explicit live or production update, deploy with `--prod`.
- For an explicit preview or draft, omit `--prod`.
- When the user requests a deploy but the target is genuinely ambiguous, use a draft deploy unless that would defeat the stated goal.
- Immediately before a production upload, state the linked site, target, and artifact directories in a concise commentary update.
- Creating or linking a site, changing environment variables or domains, triggering a remote build, promoting or rolling back a deploy, and deleting deploy resources require their own authorization.

Do not commit, push, or discard local changes as part of this workflow. Report dirty or unpushed Git state because a manual deploy can put code live before it exists in the remote repository.

## Workflow

1. Read repository instructions and inspect `git status`. Preserve all user changes.
2. Establish the deploy contract from manifests, lockfiles, framework configuration, `netlify.toml`, and generated output:
   - repository and application roots;
   - package manager and local build command;
   - publish directory;
   - static, SPA, hybrid, or SSR runtime;
   - functions and edge-functions directories;
   - monorepo package name or path;
   - linked Netlify site and intended target.
3. Check authentication and site linkage without printing tokens, secret environment values, or unnecessary site identifiers. Prefer an existing local link. If no site is linked and the user did not authorize linking or creation, stop with the exact missing prerequisite.
4. Produce a fresh local build with the repository's declared package manager. A local build does not use Netlify remote build minutes. Reuse existing output only when the user requests it and the output is demonstrably complete and current.
5. Resolve the absolute loaded skill directory and run the offline artifact preflight before uploading:

   ```sh
   node <skill-directory>/scripts/preflight.mjs <project-root> \
     --publish <publish-directory> \
     --functions <functions-directory> \
     --json
   ```

   Omit `--functions` when the build has none. The preflight never authenticates or uploads; review its findings because it cannot prove framework runtime correctness.
6. Inspect the actual artifacts before uploading:
   - the publish directory exists, is non-empty, and contains an entry page or framework output;
   - the deploy directory is not a repository root, source directory, home directory, or directory containing `.env` files;
   - SPA redirects or framework routing artifacts are present when required;
   - functions and edge functions required by the runtime are generated;
   - an SSR function's referenced server bundle exists and is included by its packaging configuration.
7. Resolve publish and functions paths to absolute paths. This avoids current-directory ambiguity, especially because modern Netlify CLI commands execute monorepo operations from the workspace root.
8. Inspect `netlify deploy --help` when the installed CLI version is unfamiliar. Confirm that `--no-build`, `--dir`, `--functions`, `--prod`, and `--filter` behave as expected.
9. Run a non-interactive manual upload with `--no-build`. Use `--filter <package-name-or-path>` for a detected monorepo and pass `--functions` only when functions exist:

   ```bash
   netlify deploy \
     --filter <package-name-or-path> \
     --prod \
     --no-build \
     --dir <absolute-publish-directory> \
     --functions <absolute-functions-directory> \
     --message "Manual deploy: <short reason>"
   ```

   Omit `--filter`, `--functions`, or `--prod` when that branch does not apply. Prefer a repository-installed CLI; otherwise use the repository's package manager to execute a pinned or current CLI without adding it as a dependency.
10. If the CLI prompts to select a monorepo package, stop that attempt and retry with the correct `--filter`. If it resolves a deploy path incorrectly, stop before upload and retry with verified absolute paths. Do not substitute `--trigger`: that starts Netlify's remote build pipeline.
11. Wait until the CLI reports that the deploy is live. Capture the production or draft URL and the unique deploy URL without exposing credentials.
12. Smoke-test the deployed result:
    - request the root page and one representative nested route;
    - verify a release marker or expected asset when practical;
    - for SSR or API routes, use safe `GET`, `HEAD`, or `OPTIONS` checks that do not send emails, create records, or otherwise mutate production data;
    - inspect function logs only when a runtime check fails.
13. Recheck `git status` and report the target URL, unique deploy URL, locally executed build, uploaded artifact directories, route results, and any dirty or unpushed state.

## Netlify invariants

Last verified against the linked official Netlify documentation: 2026-08-30.

- A CLI manual deploy uploads local files directly. Netlify does not run the repository build command for a manual deploy when `--no-build` is used.
- `netlify deploy` creates a draft by default; `--prod` updates the primary site URL.
- A manual deploy needs the publish directory and, when applicable, the functions directory. A client-only upload is incomplete for SSR or hybrid applications.
- Netlify CLI detects monorepos and supports `--filter` with a package name or package path.
- Function packaging performed locally by the CLI is part of the upload workflow, not a Netlify remote repository build.

Recheck current behavior in Netlify's official [CLI manual-deploy documentation](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/#manual-deploys) and [deploy documentation](https://docs.netlify.com/deploy/create-deploys/) when CLI output conflicts with these invariants.

## Failure handling

- Build-minute exhaustion is a reason to keep the deploy local and use `--no-build`; it is not a reason to upload stale or incomplete output.
- On authentication, linkage, plan, or permission errors, report the provider's actionable message without credentials.
- On missing publish or runtime artifacts, return to the local build and artifact checks. Do not hide the failure by deploying an arbitrary directory.
- Retry only after identifying a concrete correction. Stop after repeated failures instead of looping against production.
- Claim success only after Netlify reports the deploy live and the public smoke checks pass. Distinguish “uploaded” from “verified live.”
