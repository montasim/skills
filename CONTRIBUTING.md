# Contributing

Contributions should keep every skill independently understandable, testable, installable, and releasable.

## Development workflow

1. Install dependencies with `npm ci`.
2. Make focused changes in one or more `skills/<name>` directories.
3. Keep `SKILL.md` as the canonical portable entry point and link conditional detail from `references/`.
4. Update `catalog.json` when identity, version, distribution, licensing, or provenance changes.
5. Run `npm test`, `npm run pack:check`, and `npm run smoke:install`.

Do not commit lifecycle-generated `skills/<name>/skills/` directories or package archives. Do not change a package name, executable name, license, repository identity, or public version without an explicit migration or release decision.

## Skillfolio development

Skillfolio is an isolated pnpm project. From `apps/skillfolio`, install with `pnpm install --frozen-lockfile` and run `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`.

Catalog ownership is split deliberately:

- update root `catalog.json` for managed skill versions, packages, distribution, licensing, repositories, provenance, and compatibility evidence;
- update `apps/skillfolio/src/data/categories.json` only when a genuinely new primary problem domain is needed;
- update `apps/skillfolio/src/data/skill-presentation.json` for names, categories, summaries, descriptions, and use cases;
- update `apps/skillfolio/src/data/external-skills.json` for source and installation facts owned outside this repository.

Run `npm run generate:skillfolio-catalog` after changing any source. `apps/skillfolio/src/data/skills.generated.json` is checked in for review and runtime imports, but must not be edited directly. Assign each skill to one outcome-based category, keep every registered category in use, keep exactly one entry featured, and expose a private, source-only, or unlicensed local skill only after an explicit publication decision with accurate licensing and installation facts.

## Releases

Package versions are independent. A release commit should align the selected workspace manifest, root lockfile, catalog entry, documentation, and namespaced tag. Tag releases as `<package-name>-v<version>`.

## Pull requests

Explain the affected skill or application surface, the user-visible behavior, the evidence used, and the validation performed. Keep unrelated formatting and package migrations out of focused changes.
