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

- All twelve skills are configured as independently versioned public npm workspaces and use namespaced GitHub release tags.
- `update-skillfolio-catalog` is publicly installable while retaining its bounded purpose: it updates an explicitly identified local Skillfolio catalog and does not deploy it implicitly.
- `integrate-supportkori-widget` is publicly packaged as `UNLICENSED`. Its availability does not grant open-source reuse rights.
- Host support is recorded as documented format support, installer-path testing, and live runtime verification. Format documentation alone is not a runtime claim.

## Remaining remote cutover

1. Create the public `montasim/skills` GitHub repository, push `main`, and verify every central source link.
2. Publish each new npm package under its independent version, starting with a low-risk package and publishing `write-complete-project-readme` last because its installer has the broadest migration surface.
3. Create one namespaced Git tag and GitHub release per package and verify the tag, registry version, install command, and release target.
4. Configure npm trusted publishing for future releases through `montasim/skills` and `.github/workflows/publish.yml`.
5. Reconnect the existing Netlify site with base directory `apps/skillfolio`, then verify routes, crawler files, and social previews.
6. Move Skillfolio support and source links only after the deployment cutover succeeds.

No package is published, tagged, pushed, or deployed merely by completing this local migration.
