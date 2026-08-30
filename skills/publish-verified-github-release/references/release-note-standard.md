# Release Note Standard

Use this reference to evaluate and draft GitHub release notes.

## Evidence rules

- Tie every change claim to a commit, diff, issue, changelog entry, manifest, or demonstrated behavior.
- Record the comparison range. Prefer the previous stable tag through the target commit.
- Separate local observations from current GitHub or registry state.
- State test results only for commands actually run against the target code.
- Avoid claiming “production ready,” “fully compatible,” or “secure” from indirect evidence.

## Recommended structure

Use only sections supported by the release:

~~~~markdown
## Summary

One short paragraph describing what the release enables and who benefits.

## Highlights

- **Capability:** Concrete user-visible outcome.
- **Reliability:** Concrete correction or guardrail.

## Breaking changes

Describe the break, affected users, and migration steps.

## Install or upgrade

```sh
verified command
```

## Verification

- `exact command` — verified result

## Links

- [Package](verified URL)
- [Full comparison](verified URL)
~~~~

Omit empty sections. Use “No breaking changes identified in the verified range” only when that conclusion is supported and useful.

## Quality checks

- Make the title match the tag and release identity.
- Describe outcomes, not a raw commit log.
- Keep bullets parallel and specific.
- Put migration guidance before optional detail when a release breaks compatibility.
- Preserve commands exactly and use fenced code blocks.
- Verify Markdown renders without literal escape sequences.
- Avoid duplicate summaries, badge walls, and exhaustive internal refactors.
- Link directly to canonical sources rather than search or redirect pages.

## Mutation checks

Before creating or editing a release, verify:

1. The user authorized the external mutation.
2. The authenticated account can access the intended repository.
3. The tag and target commit are correct.
4. Draft and prerelease flags match the request.
5. Package-publication claims are already true.

After mutation, open or query the release and verify its URL, tag, state, and rendered body.
