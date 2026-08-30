# Skillfolio entry acceptance

Use this checklist after discovering the target application's own schema and conventions. The app remains authoritative; this reference defines evidence quality and completion checks, not fixed field names.

## Source identity

- Canonical skill name comes from `SKILL.md` frontmatter or the published package.
- Description states capability and triggering context without unsupported marketing claims.
- Stable version comes from the npm registry, GitHub release/tag, or an explicitly selected local revision.
- Repository URL resolves to the intended owner and project.
- npm package name, if present, resolves and its repository metadata agrees with the source.
- Install command uses a shipped binary or a repository-documented installation mechanism.
- Supported agents are backed by shipped compatibility files or explicit documentation.

## Catalog fit

- Identify the actual catalog through imports, generation, or route consumption.
- Identify the editing authority for each field; runtime output and editing authority may be different files.
- Follow the catalog's required keys, field order, scalar/array/object types, slug rules, and taxonomy.
- Read the category definitions and assign the skill's single primary outcome. Add a category only for a genuinely distinct domain, never a provider, file format, implementation technology, or vague maintenance label.
- Match the established ordering rule. If no rule is evident, minimize movement of existing records.
- Update an existing identity rather than inserting a duplicate.
- Keep repository, package, slug, and other stable identifiers unique.
- Regenerate derived data with the repository command and require its stale-output check to pass when available.

## Presentation surfaces

- Confirm the list card renders a meaningful title and description.
- Confirm the detail route resolves using the entry's actual route key.
- Confirm README or source content links point to a fetchable canonical document.
- Preserve the README index's headings, table columns, ordering, and link style.
- Generate the sitemap with the app's existing script where available.
- Confirm the resulting sitemap has one canonical detail URL and no duplicate URL entry.

## Validation

Run in this order unless repository instructions specify otherwise:

1. catalog validator before the change;
2. catalog generator and generated-output check, when present;
3. catalog validator after the change;
4. formatter or formatting check for changed files;
5. schema validation or type-check;
6. focused tests;
7. sitemap generation;
8. production build;
9. representative route inspection.

Separate failures introduced by the entry from pre-existing repository failures. Never label a check “passed” when it was skipped or unavailable.

## External actions

Local catalog edits do not authorize commits, pushes, pull requests, deployment, package publication, releases, or remote settings changes. Record those as optional next actions unless explicitly requested.
