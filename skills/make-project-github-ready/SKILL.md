---
name: make-project-github-ready
description: Audit and prepare a project for a professional GitHub repository. Use for repository identity, community files, CI, security, topics, or authorized GitHub metadata changes; use fix-project-metadata-mismatches for repeated local values.
license: MIT
---

# Make Project GitHub Ready

Turn a local project into a GitHub-ready repository while keeping reversible local preparation separate from external GitHub mutations.

Use `fix-project-metadata-mismatches` for repeated values across local manifests, lockfiles, documentation, and catalogs. Use `release-agent-skill` when GitHub preparation is one stage in an Agent Skill release.

## Requirements

The bundled repository auditor requires Node.js 18 or newer. Remote stages require authenticated GitHub access through the tools available in the current environment.

## Establish scope and authority

Determine whether the user requested an audit, local preparation, remote GitHub setup, or all three.

- Treat inspection as read-only and proceed when it is within scope.
- Treat local file edits as project changes. Make them only when the user asked to prepare or implement.
- Treat repository creation, visibility changes, metadata edits, branch protection, secrets, settings, and pushes as external mutations. Obtain explicit authorization for the exact repository and action before executing them.
- Never infer permission to make a repository public, transfer ownership, overwrite a remote, force-push, delete branches, or replace existing community files.

## Audit the local project

Run the bundled local auditor at the project root:

```bash
node <skill-root>/scripts/audit-github-project.mjs --path .
```

Use `--json` for machine-readable output. The script performs a bounded local inventory: recognized file presence, obvious sensitive filename patterns, package metadata, package-lock/`npm ci` cues, literal CI Node-version coverage, and stale pre-publication wording. It does not evaluate policy content, inspect file contents for secrets, prove workflow semantics, contact GitHub, or change the project. Treat its clean result as a prompt for manual review, never as proof of security or repository readiness.

Verify:

- a clear project name and evidence-based description;
- a valid Git repository, current/default branch candidate, clean status, and existing remotes;
- repository URLs in package or ecosystem manifests;
- an appropriate license decision rather than an assumed license;
- contribution, security, support, and conduct guidance when appropriate;
- CI workflows that run the project's real validation commands;
- secret hygiene, ignored generated files, and absence of obvious credential files;
- a plausible homepage only when a deployed site or documentation URL is verified.

Do not add files solely to satisfy a checklist. Match community and CI files to the project’s maturity, audience, and actual commands.

Inspect community-policy content and CI commands manually after the inventory. Use an appropriate dedicated secret scanner when secret-content assurance is required; never infer that filename checks prove a clean history or safe public visibility.

## Design repository metadata

Read [metadata-and-topics.md](references/metadata-and-topics.md) before proposing the GitHub description or topics.

Prepare a metadata plan containing:

- owner and repository name;
- visibility with the user’s explicit choice;
- one concise, factual description;
- verified homepage URL or no homepage;
- a small set of discoverable, accurate topics;
- default branch, normally the existing primary branch;
- required community, security, and CI improvements;
- commands that would mutate GitHub, shown separately from local edits.

Validate repository-name availability and existing remote ownership before proposing creation. A configured local remote is only a claim; do not treat its URL as proof of GitHub identity, ownership, visibility, or settings. Use authenticated GitHub readback before remote mutations. Do not create a second repository to work around a naming conflict without user direction.

## Prepare local changes

When authorized to edit locally:

1. Preserve existing project conventions and user changes.
2. Add or repair only evidence-backed files in scope.
3. Ensure CI uses the repository's actual package manager, lockfile, runtime, and validation commands.
4. Synchronize manifest repository, bugs, and homepage fields only with confirmed URLs.
5. Review the diff and run proportionate local validation.
6. Report local changes independently of proposed remote changes.

Do not commit or push unless explicitly requested. Never invent secrets, badges, deployment URLs, support channels, or security contacts.

## Apply GitHub changes only after authorization

Before any remote mutation, present the resolved target and exact actions, for example:

```text
Target: owner/repository
Actions: create public repository; set description and homepage; add topics; push main
```

Proceed only after the user explicitly authorizes those actions. Then:

1. Recheck authentication and target availability.
2. Create or update only the authorized repository.
3. Avoid initializing remote files when local history already exists.
4. Add the remote without replacing a different existing remote silently.
5. Push only the authorized branch and commits; never force-push by default.
6. Apply description, homepage, and topics exactly from the approved plan.
7. Set the default branch only after it exists remotely.
8. Configure security, Actions, or protection settings only when requested and supported by the account or organization.

Use non-interactive commands where possible and capture their outputs as evidence.

## Verify the result

After authorized mutations, read the repository back from GitHub and compare:

- full name and visibility;
- description and homepage;
- topics;
- default branch and remote HEAD;
- pushed branch SHA versus local SHA;
- community profile and security-policy visibility;
- workflow presence and latest run state, without claiming CI success before it completes.

If any mutation partially succeeds, stop, report the exact completed and incomplete actions, and avoid compensating destructive changes.

## Report the outcome

Return:

1. **Status** — `ready`, `needs local work`, `awaiting authorization`, `configured`, or `blocked`.
2. **Target** — owner/name and visibility.
3. **Local audit** — evidence and gaps.
4. **Local changes** — files changed and validations run.
5. **Remote changes** — actions actually performed, with URLs and observed values.
6. **Deferred actions** — authorization needed, unsupported settings, or unresolved decisions.
7. **Warnings** — visibility, secrets, licensing, branch, CI, or ownership risks.

Never describe a proposed command as completed. Keep local preparation and GitHub mutations visibly distinct throughout the report.
