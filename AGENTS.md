# Repository instructions

This monorepo contains independently released skills under `skills/` and an isolated pnpm application under `apps/skillfolio`.

Treat each `skills/<name>` directory as an independent product with `SKILL.md` as its canonical portable entry point.

- Read the affected skill completely before editing it, including each reference required by its routing instructions.
- Preserve package names, executable names, independent versions, installer behavior, licenses, and authorization boundaries.
- Update `catalog.json` when skill identity, version, distribution, licensing, or imported provenance changes.
- Keep portable content in `SKILL.md`, `agents/`, `assets/`, `references/`, and `scripts/`. Package-development files remain beside those resources but are not installed.
- Treat `installer-targets.json` and `scripts/package-installer-runtime.mjs` as the installer authorities. Run `npm run generate:installers` after changing host paths or installer behavior; do not hand-edit generated package wrappers or runtimes.
- Run `npm test`, `npm run pack:check`, and `npm run smoke:install` after cross-cutting changes.
- Keep lifecycle-generated `skills/<name>/skills/` directories and package archives out of Git.
- Use `<package-name>-v<version>` release tags. Read `MIGRATION.md` before changing repository URLs, trusted publishers, legacy repositories, or release routing.

For Skillfolio changes:

- Read `apps/skillfolio/CONTEXT.md` before changing catalog language or ownership.
- Treat `catalog.json` as the authority for managed release facts, `apps/skillfolio/src/data/categories.json` as the authority for the category taxonomy, `apps/skillfolio/src/data/skill-presentation.json` as the authority for UI presentation, and `apps/skillfolio/src/data/external-skills.json` as the authority for skills maintained outside this repository.
- Regenerate `apps/skillfolio/src/data/skills.generated.json` with `npm run generate:skillfolio-catalog`; edit its sources instead of the generated file.
- Keep `apps/skillfolio` on its own pnpm lockfile. Run its pnpm commands from that directory.
- Keep project-local agent guidance under `apps/skillfolio/.agents`; a project-local skill becomes a repository skill only through an explicit promotion decision.
- Read `MIGRATION.md` before changing the live Netlify source, public repository links, or the standalone Skillfoliox repository.

Follow `CONTRIBUTING.md` for the development workflow and `LICENSING.md` before changing license claims.
