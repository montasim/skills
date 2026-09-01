# Skills

> Thirteen focused Agent Skills, independently installable from npm and discoverable through Skillfolio.

[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](package.json)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-13-0F766E)](#skill-catalog)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

This repository is the canonical source and release workspace for thirteen independently scoped Agent Skills and the Skillfolio web application. Each `skills/<name>` directory owns one portable `SKILL.md` contract, package installer, tests, documentation, and release identity. The collection covers mobile development, frontend quality, documentation, repository management, deployment, release engineering, web visibility, and catalog maintenance without coupling the skills into one runtime package.

The private npm workspace is named `montasim-skills`; it is an orchestration surface and is never published as a combined package.

> [!NOTE]
> All thirteen skill packages are publicly available on npm and have matching namespaced GitHub releases. `integrate-supportkori-widget` is intentionally published as `UNLICENSED`; public availability does not create an open-source license grant.

**[Browse Skillfolio](https://skillfoliox.netlify.app) · [Choose a skill](#skill-catalog) · [Contribute](CONTRIBUTING.md) · [Report an issue](https://github.com/montasim/skills/issues)**

## Skill catalog

| Skill | Purpose | Distribution | Version | License |
| --- | --- | --- | --- | --- |
| [`build-android-app-from-web`](https://github.com/montasim/skills/tree/main/skills/build-android-app-from-web) | Build Android apps with verified web parity | [npm](https://www.npmjs.com/package/build-android-app-from-web) | 0.1.0 | MIT |
| [`find-ui-inconsistencies`](https://github.com/montasim/skills/tree/main/skills/find-ui-inconsistencies) | Find visual and interaction inconsistencies | [npm](https://www.npmjs.com/package/find-ui-inconsistencies) | 0.1.0 | MIT |
| [`publish-verified-github-release`](https://github.com/montasim/skills/tree/main/skills/publish-verified-github-release) | Publish evidence-backed GitHub releases | [npm](https://www.npmjs.com/package/publish-verified-github-release) | 0.2.0 | MIT |
| [`fix-social-link-previews`](https://github.com/montasim/skills/tree/main/skills/fix-social-link-previews) | Fix and verify social link previews | [npm](https://www.npmjs.com/package/fix-social-link-previews) | 0.3.0 | MIT |
| [`integrate-supportkori-widget`](https://github.com/montasim/skills/tree/main/skills/integrate-supportkori-widget) | Integrate and verify SupportKori widgets | [npm](https://www.npmjs.com/package/integrate-supportkori-widget) | 0.1.0 | UNLICENSED |
| [`deploy-prebuilt-app-to-netlify`](https://github.com/montasim/skills/tree/main/skills/deploy-prebuilt-app-to-netlify) | Deploy prebuilt apps directly to Netlify | [npm](https://www.npmjs.com/package/deploy-prebuilt-app-to-netlify) | 0.1.0 | MIT |
| [`make-project-github-ready`](https://github.com/montasim/skills/tree/main/skills/make-project-github-ready) | Make projects ready for professional GitHub repositories | [npm](https://www.npmjs.com/package/make-project-github-ready) | 0.1.0 | MIT |
| [`make-app-netlify-ready`](https://github.com/montasim/skills/tree/main/skills/make-app-netlify-ready) | Make applications ready for Netlify | [npm](https://www.npmjs.com/package/make-app-netlify-ready) | 0.1.0 | MIT |
| [`update-skillfolio-catalog`](https://github.com/montasim/skills/tree/main/skills/update-skillfolio-catalog) | Add or update verified Skillfolio catalog entries | [npm](https://www.npmjs.com/package/update-skillfolio-catalog) | 0.1.0 | MIT |
| [`release-agent-skill`](https://github.com/montasim/skills/tree/main/skills/release-agent-skill) | Validate and release agent skills | [npm](https://www.npmjs.com/package/release-agent-skill) | 0.1.0 | MIT |
| [`fix-project-metadata-mismatches`](https://github.com/montasim/skills/tree/main/skills/fix-project-metadata-mismatches) | Find and repair project metadata mismatches | [npm](https://www.npmjs.com/package/fix-project-metadata-mismatches) | 0.1.0 | MIT |
| [`verify-github-npm-release`](https://github.com/montasim/skills/tree/main/skills/verify-github-npm-release) | Verify GitHub and npm releases | [npm](https://www.npmjs.com/package/verify-github-npm-release) | 0.1.0 | MIT |
| [`write-complete-project-readme`](https://github.com/montasim/skills/tree/main/skills/write-complete-project-readme) | Write complete evidence-based READMEs | [npm](https://www.npmjs.com/package/write-complete-project-readme) | 0.4.0 | MIT |

`catalog.json` is the machine-readable inventory and records each canonical identity, package, version, source directory, distribution decision, evidence profile, and imported source commit.

## Skillfolio application

[Skillfolio](https://skillfoliox.netlify.app) is the public catalog interface for the collection. Its deployed source lives in [`apps/skillfolio`](apps/skillfolio), and its public issue tracker is the central [`montasim/skills`](https://github.com/montasim/skills/issues) repository.

The application catalog is generated from four sources:

- `catalog.json` owns versions, packages, distribution, licensing, current public repositories, and dated host-evidence profiles for managed skills.
- `apps/skillfolio/src/data/categories.json` owns the outcome-based category taxonomy and definitions.
- `apps/skillfolio/src/data/skill-presentation.json` owns display names, category assignments, featured state, descriptions, and use cases.
- `apps/skillfolio/src/data/external-skills.json` owns source and installation facts for ContractGuard and DocsWatch, which remain external to this repository.

`skills.generated.json` is a checked build artifact. Every managed skill now has an authorized public source and npm installation path, so Skillfolio can present the complete collection alongside its explicitly external entries.

## Install a skill

The package, executable, installed directory, and invocation use the same canonical name. For example:

```bash
npx --yes --package=fix-social-link-previews@latest fix-social-link-previews \
  --target codex --scope user
```

Replace `fix-social-link-previews` with any package name in the catalog. Each package README documents its supported hosts, scopes, prerequisites, safety behavior, and realistic invocation examples.

## Install from this checkout

Use the repository installer when testing any skill directly from source:

```bash
node scripts/install-local.mjs integrate-supportkori-widget \
  --path "$HOME/.agents/skills"
```

Add `--dry-run` to inspect the destination or `--force` to replace an existing regular skill directory. The installer copies only portable resources: `SKILL.md`, `agents/`, `assets/`, `references/`, and `scripts/`.

## Repository structure

```text
.
├── apps/
│   └── skillfolio/             # TanStack Start catalog application (isolated pnpm project)
├── catalog.json
├── netlify.toml                # Routes Netlify into the Skillfolio app base
├── scripts/                    # Workspace validation, packaging, and release tools
├── test/                       # Monorepo contract tests
└── skills/
    └── <skill-name>/
        ├── SKILL.md             # Agent instructions and discovery contract
        ├── agents/openai.yaml   # Optional Codex interface metadata
        ├── references/          # Conditional guidance
        ├── scripts/             # Portable deterministic helpers
        ├── package.json         # Independent public npm package identity
        ├── bin/                 # Package installer
        └── test/                # Package regression tests
```

During npm tests and packing, a lifecycle helper stages direct resources into `skills/<skill-name>` inside each tarball. Package, executable, installed directory, invocation, catalog slug, and release-tag prefix all use the same canonical skill name.

## Development

### Prerequisites

- Node.js 18 or newer
- npm with lockfile v3 support
- pnpm 10.30.3 for `apps/skillfolio`
- Python 3 for skills that include Python auditors
- Git for release and repository-oriented workflows

### Bootstrap and validate

```bash
npm ci
npm test
npm run pack:check
npm run smoke:install

cd apps/skillfolio
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

| Command | Purpose |
| --- | --- |
| `npm run validate` | Check the catalog, skill frontmatter, metadata, workspace contracts, and generated-file cleanliness |
| `npm test` | Run all package and monorepo contract tests |
| `npm run pack:check` | Preview every npm package tarball |
| `npm run smoke:install` | Install every packaged skill into a temporary root and compare portable files |
| `npm run generate:skillfolio-catalog` | Regenerate Skillfolio runtime data from managed and presentation authorities |
| `npm run build` | Build the isolated Skillfolio application through its pnpm project |
| `pnpm test` in `apps/skillfolio` | Run application catalog and interface tests |
| `pnpm smoke:dev` in `apps/skillfolio` | Start Vite on an available port and verify the local server responds |
| `pnpm build` in `apps/skillfolio` | Generate catalog and crawler files, then build the client, SSR bundle, and Netlify function |

The CI workflow runs skill validation, tests, package checks, and installer smoke tests on Node.js 18 and 24. A separate Node.js 24 job installs Skillfolio with its own pnpm lockfile, checks generated catalog data, tests, lints, type-checks, and builds the application.

## Releases

Every npm package remains independently versioned. Release tags use the collision-free form:

```text
<package-name>-v<package-version>
```

For example, `fix-social-link-previews-v0.4.0` resolves only the `fix-social-link-previews` workspace. The release workflow validates the tag, tests and packs that workspace, publishes a missing version through npm trusted publishing, verifies registry propagation, smoke-tests the installed CLI, and creates a GitHub release when one does not already exist. Re-running a released tag verifies the existing npm package and release without publishing a duplicate version.

The initial twelve imported versions were published with authenticated npm ownership and independently verified against their GitHub tags. Later skills use the same namespaced release workflow after their package-specific trusted-publishing connection is verified.

## Migration status and limitations

- Historical standalone repositories, tags, releases, issues, and npm artifacts remain external records and are not release targets for the renamed workspaces.
- The Skillfolio live site builds from `apps/skillfolio` on the central repository's `main` branch. The imported standalone repository remains a provenance and historical-issue record, not a deployment source.
- Package metadata points to the central `montasim/skills` repository and is verified as part of each release.
- Historical repositories should be archived only after a release from the monorepo installs and verifies successfully.
- `integrate-supportkori-widget` and Skillfolio remain unlicensed. The SupportKori package is public but does not grant open-source reuse rights; the other twelve skills are MIT-licensed.
- Skillfolio's Netlify development dependency graph has one upstream `extract-zip` advisory whose named patched version is not yet published on npm. It does not enter any skill package; see [SECURITY.md](SECURITY.md#known-development-dependency-advisory).
- The repository deliberately uses normal directories rather than symlinked skill directories so local validation and packaging agree.

See [MIGRATION.md](MIGRATION.md) for the remaining operational follow-up and [LICENSING.md](LICENSING.md) for per-skill licensing.

## Support, security, and contributing

Read [SUPPORT.md](SUPPORT.md) for the current support routes and [SECURITY.md](SECURITY.md) before reporting a vulnerability. Contributions should follow [CONTRIBUTING.md](CONTRIBUTING.md) and keep each skill independently testable and installable.

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain the validation and release workflows.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Licensing is defined per module. Twelve skills include the MIT License; `integrate-supportkori-widget` and the Skillfolio application are currently unlicensed. The aggregation and root tooling do not yet have a repository-wide open-source license. See [LICENSING.md](LICENSING.md).
