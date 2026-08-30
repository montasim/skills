# Agent Skill release gates

Apply only the gates relevant to the requested distribution channels.

## Gate 1: skill contract

- The directory name and frontmatter `name` match.
- The description states what the skill does and when it should trigger.
- Instructions specify inputs, evidence, workflow, boundaries, output, and verification.
- The main file remains concise; detailed material is referenced one level deep.
- Every referenced resource exists.
- Scripts are deterministic, dependency-light, and tested.

## Gate 2: host compatibility

- Shared behavior uses open Agent Skills fields and portable Markdown.
- Codex UI metadata, if present, is valid `agents/openai.yaml` and references `$skill-name` in its default prompt.
- Claude invocation and installation paths are documented or tested by the distributor without changing the shared behavior contract.
- Host-specific extensions are isolated or explicitly accepted.

## Gate 3: repository state

- The intended branch and remote are explicit.
- User changes are preserved and unrelated files are excluded.
- Version, description, repository links, install commands, and license claims agree.
- Required validation and tests pass on the release commit.

## Gate 4: package state

- Package name and version are available before publication.
- The archive contains the skill and required runtime files, not secrets, caches, fixtures, or local configuration.
- The documented public install command works against the packed artifact.
- Registry access, provenance strategy, and two-factor authentication are understood before publishing.

## Gate 5: release state

- The tag points to the reviewed release commit.
- Notes lead with the user-visible outcome and contain highlights, installation, verification, and limitations when relevant.
- Every quantitative claim comes from current test or archive output.
- Links point to the package, source tag, comparison, and support surfaces that actually exist.

## Gate 6: consumer verification

- Registry metadata resolves publicly.
- A clean consumer invocation succeeds.
- GitHub renders the release as intended and it is not accidentally draft or prerelease.
- Optional catalogs and deployed documentation show the same version only when those updates were authorized.

## Authorization matrix

| User wording | Local edits | Commit | Push | Publish | Release | Deploy/catalog |
| --- | --- | --- | --- | --- | --- | --- |
| “Audit” or “verify” | No, unless needed for report artifacts | No | No | No | No | No |
| “Prepare” | Yes | No | No | No | No | No |
| “Commit” | Yes | Yes | No | No | No | No |
| “Push” | Yes | Yes when needed | Yes | No | No | No |
| “Publish to npm” | Yes | Only if requested or required and clear | Only if requested | Yes | No | No |
| “Create a GitHub release” | Yes | Only if requested or required and clear | Tag/branch push as required | No | Yes | No |
| “Ship everything” | Clarify named channels when context does not establish them | Bounded by confirmed workflow | Bounded | Bounded | Bounded | Separate confirmation when unclear |
