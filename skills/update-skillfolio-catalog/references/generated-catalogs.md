# Generated catalog workflow

Read this reference when the runtime catalog is generated, joined from multiple files, or checked for staleness.

## Establish authority

Trace the imported runtime file back through its generator. Build a field map before editing:

- release facts: version, package, distribution, canonical repository, source directory, and install command;
- category facts: canonical outcome domains and their definitions;
- presentation facts: display name, mark, category assignment, status, featured state, summary, description, compatibility, and uses;
- external facts: identities whose release source is outside the current repository.

Use the existing split even when a single entry requires edits in two inputs. Generated output is a projection and must be changed only by running its generator.

## Managed monorepo pattern

When the repository has a root skill inventory plus `apps/skillfolio`, use these authorities if the generator confirms the pattern:

- root `catalog.json` for managed release, distribution, repository, provenance, and licensing facts;
- `apps/skillfolio/src/data/categories.json` for canonical outcome-based category names and definitions;
- `apps/skillfolio/src/data/skill-presentation.json` for Skillfolio presentation metadata;
- `apps/skillfolio/src/data/external-skills.json` for skills maintained outside the monorepo;
- `apps/skillfolio/src/data/skills.generated.json` only as the generated runtime and review surface.

A managed skill must already be publicly distributable under the generator's rules. Assign its primary user outcome to an existing category definition; add a category only when no existing domain fits without distortion. Do not publish a source-only or unlicensed local skill merely because its directory exists. An external skill should not be copied into the managed inventory unless the task separately includes that repository migration.

## Complete the change

1. Capture the generator check and catalog-validator baseline.
2. Edit the minimum authoritative record or records for one skill identity.
3. Run the generator through the repository script.
4. Review generated output for the target identity, category, exact version, source directory, install command, and unrelated movement.
5. Run the generator's check mode, catalog validator, application tests, type-check, crawler generation, and production build.

Completion requires both the authorities and committed projection to agree. Report authoritative input changes separately from generated output.
