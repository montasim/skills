# Migration

The monorepo imports twelve local skill projects into canonical `skills/<name>` directories and the Skillfolio application into `apps/skillfolio`. `catalog.json` records the imported source commits without importing colliding standalone tags or Git histories.

## Canonical identity reset

Before the central repository's first release, every skill received one outcome-focused identity shared by its directory, `SKILL.md` frontmatter, npm package, executable, installer destination, release tag, documentation, and Skillfolio record.

- No retired package, executable, directory, or invocation aliases remain in this codebase.
- Existing npm artifacts and standalone repositories under previous identities remain external historical records; this monorepo does not publish or link to them.
- Package versions remain independent and continue from the imported skill versions.
- New releases use `<package-name>-v<version>` tags so packages cannot collide inside the central repository.

## Canonical skills

- `find-ui-inconsistencies`
- `publish-verified-github-release`
- `fix-social-link-previews`
- `integrate-supportkori-widget`
- `deploy-prebuilt-app-to-netlify`
- `make-project-github-ready`
- `make-app-netlify-ready`
- `update-skillfolio-catalog`
- `release-agent-skill`
- `fix-project-metadata-mismatches`
- `verify-github-npm-release`
- `write-complete-project-readme`

## Skillfolio import

`apps/skillfolio` was imported from `montasim/Skillfoliox` at commit `e5d5212b5e3a434af6f5fb88ea6643a41beed18f`. Its project-local `.agents/skills/improve-codebase-architecture` guidance remains scoped to the application.

The application does not own managed release facts. `scripts/generate-skillfolio-catalog.mjs` combines root `catalog.json`, the application category taxonomy, presentation metadata, and explicitly external skill facts into the checked-in runtime catalog.

## Current distribution decisions

- The twelve imported skills are configured as independently versioned public npm workspaces and use namespaced GitHub release tags.
- `update-skillfolio-catalog` is publicly installable while retaining its bounded purpose: it updates an explicitly identified local Skillfolio catalog and does not deploy it implicitly.
- `integrate-supportkori-widget` is publicly packaged as `UNLICENSED`. Its availability does not grant open-source reuse rights.
- Host support is recorded as documented format support, installer-path testing, and live runtime verification. Format documentation alone is not a runtime claim.

## Post-migration additions

`build-android-app-from-web` was created in the canonical monorepo rather than imported from a standalone repository. It begins at version `0.1.0`, uses the shared installer runtime, is MIT-licensed, and follows the namespaced release identity `build-android-app-from-web-v0.1.0`.

## Remote cutover status

Completed on 2026-08-30:

1. Created the public `montasim/skills` GitHub repository, pushed `main`, and verified every central source link.
2. Published all twelve independently versioned packages to npm, including the public `update-skillfolio-catalog` package.
3. Created one namespaced Git tag and GitHub release per package. Every tag, registry version, dist-tag, install command, release target, and catalog identity passed the read-only release verifier.
4. Ran the tag-triggered release workflow for every package; all twelve runs completed successfully.
5. Reconnected the existing `skillfoliox` Netlify project to `montasim/skills`, retained `apps/skillfolio` as its base directory, and verified a successful production build from central `main` commit `348569abc77dacc5442dbeab208566a8ccf3a97f`.
6. Moved Skillfolio source and support links to the central repository, exposed each managed skill's npm package in the catalog, and repaired the SupportKori integration so its script mounts after hydration.

Remaining operational cutover:

1. Configure npm trusted publishing for future releases through `montasim/skills` and `.github/workflows/publish.yml`.

Editing this migration record does not publish, tag, push, deploy, or change any remote service.
