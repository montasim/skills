---
name: update-skillfolio-catalog
description: Synchronize one verified Agent Skill with this repository's local Skillfolio authorities and generated catalog. Use for Skillfolio entry changes only; release, external publication, and deployment require separate authorization.
license: MIT
---

# Update Skillfolio Catalog

Integrate one verified skill into an explicitly identified local Skillfolio application without taking external publication actions implicitly. This edits a local catalog; it is not a general public catalog publisher.

Use `release-agent-skill` when the catalog update is one separately authorized stage in an Agent Skill release.

## Requirements

The package installer and repository generator require Node.js 18 or newer. Complete verification also uses the target Skillfolio application's declared package manager and scripts.

## Inputs

Accept one or more evidence sources:

- a local skill root containing `SKILL.md`;
- a GitHub repository or tagged release URL;
- an npm package name or package URL;
- an explicit local Skillfolio app path.

If the app path is absent, search only plausible workspace roots and confirm the selected app from its catalog, routes, product name, or repository metadata before editing. Do not treat this skill's own directory as the target app.

## Workflow

1. Read repository instructions and inspect working-tree state. Preserve unrelated changes and report overlapping edits before modifying them.
2. Resolve the source identity. Record the canonical name, description, current stable version, repository, package, install command, supported agents, entry document, release status, and useful categories from primary evidence.
3. Prefer tagged or published evidence over branch-head claims. Cross-check conflicting version or description values and stop rather than inventing a resolution.
4. Discover the target catalog. Search data files, imports, package scripts, and generators, then trace the runtime data into list and detail routes. Do not assume a filename, directory, field set, or single editing authority.
5. Inspect several existing records, their TypeScript type/schema, rendering consumers, README index, sitemap generator, package scripts, and any generated-file check.
6. If the runtime catalog is generated, read [references/generated-catalogs.md](references/generated-catalogs.md). Map each output field to its authority and edit only generator inputs.
7. Read [references/entry-acceptance.md](references/entry-acceptance.md). Resolve the absolute loaded skill directory containing this `SKILL.md`, then run `python3 <skill-directory>/scripts/validate_catalog_entry.py --app <app-root>` before editing to capture the baseline when a runtime catalog is discoverable.
8. Add or update exactly one skill identity across the minimum authoritative records, using established field order, naming conventions, taxonomy, URL form, and install-command conventions. Avoid broad reformatting.
9. Run the repository's catalog generator when present. Confirm its check mode accepts the committed output and inspect the diff for unrelated record movement.
10. Update the repository README's skill index only if the app maintains one. Preserve its table shape and ordering rule.
11. Regenerate the sitemap with the repository's existing generator. If no generator exists, update the existing sitemap conservatively; do not introduce a new build system solely for this task.
12. Run the validator with `--entry <slug-or-name>`, then the repository's formatting check on changed files, type-check, tests where present, sitemap generator, and production build.
13. Inspect the resulting route or generated route data. Verify that source and install links point to the intended skill and version.
14. Report the evidence used, authoritative inputs changed, generated outputs changed, validation results, and any pre-existing failures separately.

## Evidence rules

- Treat a local file as evidence only for the local revision being integrated.
- For GitHub, prefer repository files and release/tag metadata from the repository owner.
- For npm, use registry metadata for published version, package name, dist-tags, repository, and executable commands.
- Never infer a version from a badge image, screenshot, stale README sentence, or Git branch name.
- Preserve exact capitalization for product labels while using the target catalog's slug convention.
- Derive install commands from published package metadata or the repository's documented installer. Never guess an executable name.
- Record only agent compatibility supported by explicit documentation or shipped files.

## Schema discovery

Trace data from authorities through generation to consumers rather than merely finding a JSON array. Determine:

- which file is imported into the app and whether it is generated;
- which source owns each release, source, installation, and presentation field;
- the record type and required fields;
- uniqueness keys such as `slug`, `id`, package, or repository;
- whether values are rendered as Markdown, plain text, URLs, or commands;
- ordering and category constraints;
- detail-route construction;
- README and sitemap synchronization mechanisms.

Treat names such as `generated`, generator commands in lifecycle scripts, or a header declaring generated content as ownership signals. Confirm them by reading the generator. A generated runtime file can be the correct validator target without being a valid editing target.

If multiple candidate catalogs exist, score them by import usage and record shape, then explain the choice. Require user direction only when two live catalogs remain materially plausible.

## Acceptance gate

Do not call the entry complete until:

- identity and version agree with primary sources;
- the record conforms to the discovered schema and sibling value types;
- generated output exactly matches its authoritative inputs when generation exists;
- no duplicate identity, slug, repository, or package is introduced;
- public URLs use canonical HTTPS forms;
- the README index matches the catalog when one exists;
- the sitemap contains the detail route when the app exposes one;
- type-check and production build pass, or unrelated pre-existing failures are clearly isolated;
- the validator reports no errors for the target entry.

## Authorization boundary

Editing the explicitly identified local Skillfolio app and running its local checks are in scope. Do not commit, push, open or merge a pull request, publish to npm, create a GitHub release, deploy, or change remote settings without explicit authorization for that action. “Publish to Skillfolio” means update and verify the local catalog unless the user separately authorizes external publication.
