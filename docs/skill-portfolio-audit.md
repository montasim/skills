# Skill portfolio audit

Audit date: 2026-08-30

Implementation update: the maintainer approved Batches A–E, the outcome-focused identity migration, and public npm distribution for all twelve skills. `integrate-supportkori-widget` remains explicitly `UNLICENSED`; the other eleven skills are MIT-licensed. Current repository files are authoritative where the historical findings below describe a gap that has since been resolved.

## Executive verdict

The repository contains twelve legitimate skills, not twelve arbitrary prompts. Every skill has a recognizable outcome, a usable workflow, explicit completion language, and a defensible reason to exist. No skill should be deleted, merged, or split immediately.

The portfolio is not yet uniformly release-grade across all claimed hosts:

- all twelve skills are configured for independent public npm distribution;
- eleven skill directories are MIT-licensed and `integrate-supportkori-widget` remains unlicensed;
- all twelve pass the structural validator and fit the open Agent Skills format;
- all twelve were discovered together by Codex in an isolated runtime probe;
- most npm installers support only Codex and Claude Code even though the portable format is accepted by more hosts;
- descriptions are valid but too long for consistently strong discovery in hosts that truncate metadata;
- deterministic behavior tests are excellent for a few skills, thin or absent for several others;
- `release-agent-skill` duplicates release specialists and should be redesigned as an orchestrator;
- two installer test files leak temporary directories and can eventually break the suite.

The implemented shape is therefore **keep all 12, revise 11 in bounded ways, and use `release-agent-skill` as a thin orchestrator**. The later publication decision packages every skill while preserving the SupportKori skill's unlicensed status.

## Evidence collected

- Read all 12 canonical `SKILL.md` files, all 14 routed references, all OpenAI interface files, package manifests, installer surfaces, repository validation code, and representative behavioral tests.
- Ran the skill creator structural validator against all 12 skills: 12 passed.
- Ran `npm run validate`: 12 skills, 12 npm packages, one application, and generated Skillfolio data passed.
- Observed 134 npm workspace tests, seven SupportKori auditor tests, and two monorepo tests pass. The first aggregate run was interrupted by `/tmp` quota errors; after cleaning test-created fixtures, the affected suites passed individually.
- Ran `npm run pack:check`: all 12 npm package archives passed their dry-run inspection.
- Ran `npm run smoke:install`: all 12 portable payloads installed with hashes matching canonical source.
- Ran an isolated Codex CLI discovery probe: all 12 project skill names were available.
- Inspected official documentation for the open specification, Codex, Claude Code, Gemini CLI, Antigravity, ZCode, Cursor, GitHub Copilot, and OpenCode. See [skill-host-compatibility.md](skill-host-compatibility.md).

The audit did not execute the workflows against real GitHub, npm, Netlify, SupportKori, or Skillfolio production state. It also did not send skill metadata to Claude Code after the approval boundary blocked that live probe.

## Portfolio facts

| Fact | Result |
| --- | --- |
| Canonical skills | 12 |
| Structurally valid | 12 |
| npm distributed | 12 |
| MIT / UNLICENSED skills | 11 / 1 |
| `SKILL.md` size | 61–169 lines; 569–1,528 words |
| Description size | 370–526 characters |
| Routed references | One level deep; all targets exist |
| Host-specific shared frontmatter | None |
| Optional OpenAI interface metadata | Present for all 12 |
| Skills with deterministic workflow scripts | 10 |
| Skills with behavior-focused script tests | Uneven; see per-skill findings |

All bodies remain comfortably below the specification's recommended 500-line and 5,000-word limits. The main context concern is mandatory reference loading, not the raw body size.

## Per-skill findings

### `find-ui-inconsistencies`

**Verdict:** Ready with targeted revisions. **Structure:** Keep as one audit-first skill with optional authorized repair.

Strengths:

- distinguishes evidence from taste and historical screenshots from current defects;
- orders findings from foundations through components and states;
- provides severity, root-cause grouping, repair order, and a concrete output contract;
- keeps implementation behind user intent.

Gaps:

- package tests cover installation, not trigger behavior or audit-output quality;
- its installer tests do not remove temporary fixtures and were one cause of the `/tmp` quota failure;
- the 477-character description hides the read-only/implementation boundary after truncated excerpts.

Revise by shortening the description, adding positive/negative trigger fixtures and output-schema examples, and fixing test cleanup. A deterministic visual auditor is not required; browser evidence remains an agent responsibility.

### `publish-verified-github-release`

**Verdict:** Ready with targeted revisions. **Structure:** Keep as the release-note and GitHub-release specialist.

Strengths:

- cleanly separates drafting from external GitHub mutation;
- requires a tag/comparison boundary and refuses unsupported claims;
- bundles a release-evidence collector and a focused note standard;
- has the best installer portability in the repository, with tested targets for eight hosts.

Gaps:

- the collector has no focused behavioral unit suite despite being central to evidence gathering;
- its description overlaps `release-agent-skill` for broad “create a release” prompts;
- the provider target registry is implemented only in this package and will drift from the other installers.

Keep release creation here. Route full multi-channel skill shipping to `release-agent-skill` and existing-release audits to `verify-github-npm-release`.

### `deploy-prebuilt-app-to-netlify`

**Verdict:** Ready as a separately scoped public npm workspace after the targeted revisions. **Structure:** Keep separate from deployment preparation.

Strengths:

- correctly treats deployment as a remote mutation;
- defaults an ambiguous deployment to a draft, validates artifacts, uses absolute paths, and smoke-checks the result;
- distinguishes client-only, functions, SSR, and monorepo output;
- has a strong partial-failure and success-claim boundary.

Implemented revisions:

- added an MIT license, package installer, deterministic artifact preflight, and behavioral tests;
- recorded dated Netlify CLI invariants and explicit runtime requirements;
- added fixtures for path and artifact safety rules.

Do not merge it with `make-app-netlify-ready`: local configuration and remote upload have different authorization and failure contracts. Add an artifact preflight helper and tests before public distribution.

### `fix-social-link-previews`

**Verdict:** Ready with targeted revisions. **Structure:** Keep.

Strengths:

- one of the strongest end-to-end workflows in the portfolio;
- handles raw crawler HTML, asset MIME/dimensions, framework-native repair, visual generation, and stale platform caches without confusing them;
- has broad checker tests for duplicate tags, relative URLs, MIME mismatches, cache probes, and WebP risk;
- states what the checker cannot prove.

Gaps:

- the 520-character description is too long for compact host catalogs;
- Node.js and network requirements belong in compatibility metadata;
- framework and platform facts need an explicit review date/drift gate.

No split is recommended: metadata, asset creation, and deployed verification are one user outcome with shared evidence.

### `integrate-supportkori-widget`

**Verdict:** Publicly packaged with targeted revisions; the package remains explicitly `UNLICENSED`. **Structure:** Keep as a SupportKori-specific integration skill.

Strengths:

- unusually careful about Manifest V3 remote-code restrictions, CSP, iframes, hydration, duplication, theming, and runtime proof;
- strong static auditor tests cover missing, legacy, external-only, extension, companion-site, and generated-directory cases;
- separates web, extension, and injected-page surfaces.

Gaps:

- the public package has no open-source license grant, which must remain conspicuous;
- the exact coffee icon and `Support` label are maintainer-specific product policy, not a universal SupportKori requirement;
- provider DOM/script details are volatile and need dated verification;
- the skill description is long and puts exclusions late.

The public package preserves `Support` as this repository's explicit product convention and documents the absence of an open-source license grant.

### `make-app-netlify-ready`

**Verdict:** Ready with targeted revisions. **Structure:** Keep as the local preparation specialist.

Strengths:

- clear build contract across static, SPA, hybrid, SSR, and monorepo cases;
- clean remote-action boundary;
- dated framework reference and deterministic Python auditor;
- requires fresh build artifacts and route checks rather than trusting compiler exit.

Gaps:

- the auditor test coverage is a single safe fixture;
- monorepo base semantics, SPA catch-all ordering, SSR adapter output, and missing publish artifacts need independent fixtures;
- the description should say “prepare locally; never upload” earlier to distinguish it from the deploy skill.

### `make-project-github-ready`

**Verdict:** Ready with targeted revisions. **Structure:** Keep.

Strengths:

- strong separation among audit, local preparation, and remote GitHub mutation;
- treats visibility, ownership, secrets, licenses, remote identity, default branches, and partial success carefully;
- auditor and installer tests cover important failure and migration cases;
- reports local and remote outcomes separately.

Gaps:

- the description unnecessarily names Codex and Claude and overlaps `fix-project-metadata-mismatches` on repository URLs and GitHub metadata;
- the auditor deliberately performs only shallow secret/CI checks, which is documented but could be clearer in generated reports;
- runtime requirements are not declared in frontmatter.

Clarify the seam: this skill owns repository readiness, GitHub settings, community files, and remote configuration; `fix-project-metadata-mismatches` owns local repeated values.

### `release-agent-skill`

**Verdict:** Needs redesign. **Structure:** Keep only as an explicit end-to-end orchestrator.

Strengths:

- contains valuable release sequencing, immutable-artifact awareness, partial-failure handling, and authorization staging;
- distinguishes local preflight from actual release readiness;
- includes a release-gate reference and safe installer behavior.

Gaps:

- duplicates `fix-project-metadata-mismatches`, `make-project-github-ready`, `publish-verified-github-release`, `verify-github-npm-release`, and `update-skillfolio-catalog` instead of composing them;
- its preflight is structurally shallow and has no behavior-focused tests;
- installer tests leak temporary fixtures;
- the description promises portability only for Codex and Claude Code while the repository now targets the open standard;
- broad release prompts can trigger both this skill and its specialists.

Redesign it as a thin state machine:

1. resolve channels and authorization;
2. call or route to the metadata specialist;
3. call or route to repository preparation;
4. run shared skill validation and package gates;
5. route release-note and GitHub-release work to `publish-verified-github-release`;
6. route post-release proof to `verify-github-npm-release`;
7. route catalog synchronization only when separately authorized;
8. preserve a concise fallback checklist when a specialist is unavailable.

The orchestrator should not become another large all-purpose release manual.

### `fix-project-metadata-mismatches`

**Verdict:** Ready with targeted revisions. **Structure:** Keep as a local-only metadata authority skill.

Strengths:

- field-by-field authority model is better than global search-and-replace;
- clear read-only default and external-action exclusion;
- distinguishes mismatch, stale, unsupported, and missing values;
- deterministic auditor reports coverage limitations.

Gaps:

- the metadata auditor itself has no focused behavioral tests;
- the description overlaps GitHub preparation and shipping because it names repository URLs and release preparation without front-loading “local files only”;
- Node.js requirements are undocumented in frontmatter.

Do not merge it with GitHub preparation. Reuse it from the shipping orchestrator.

### `update-skillfolio-catalog`

**Verdict:** Publicly packaged with targeted revisions. **Structure:** Keep the workflow focused on explicitly identified local Skillfolio catalogs.

Strengths:

- excellent authority tracing for generated catalogs;
- avoids editing projections, broad reformatting, invented versions, and implicit external publication;
- defines clear acceptance gates across schema, README, sitemap, type-check, and build;
- keeps the catalog-update workflow independently testable inside the monorepo.

Gaps:

- it is specific to one product and therefore has limited general-public value despite its schema-discovery logic;
- the validator has only a safe-fixture check;
- its package, executable, directory, and invocation now share one canonical name;
- the description overlaps the catalog stage of `release-agent-skill`.

The maintainer chose public distribution so contributors can install the workflow while its mutation boundary remains local and explicit.

### `verify-github-npm-release`

**Verdict:** Ready with targeted revisions. **Structure:** Keep as the read-only release verifier.

Strengths:

- strongest authorization boundary in the release cluster;
- explicit release identity, evidence states, timeout behavior, immutable install-command preference, and critical-check policy;
- broad tests cover timeout, exact versions, mutable aliases, dist-tag mismatch, installer safety, and package contract;
- cleanly refuses repairs and execution of published packages.

Gaps:

- shared description names Codex and Claude unnecessarily;
- tool/network requirements should be declared;
- portfolio routing should make it the clear destination for “is this release correct?” prompts.

Do not merge it with `publish-verified-github-release`: read-only independent verification is a valuable separate interface.

### `write-complete-project-readme`

**Verdict:** Ready with targeted revisions. **Structure:** Keep as one complete-README skill.

Strengths:

- mature evidence hierarchy, project-type routing, activation path, trust gates, license handling, and strict output boundary;
- extensive deterministic checker and installer coverage;
- portable behavior is explicitly tested and OpenAI metadata is isolated;
- rejects partial README patches and benchmark fact leakage.

Gaps:

- every invocation must load both a 160-line quality standard and a 276-line application benchmark before inspecting the project;
- the benchmark and quality standard repeat several concepts and may bias small packages or skills toward application-shaped depth;
- description exclusions are outside compact host excerpts;
- the compatibility requirement is in body prose rather than frontmatter.

Keep one README skill. Make the quality standard mandatory, but load the full benchmark only for substantial applications, hybrids, or when the agent needs a depth exemplar. Preserve benchmark leakage tests.

## Trigger and overlap analysis

The positive trigger for every skill is clear when the full description is available. The main ambiguity is between neighboring lifecycle stages:

| Prompt family | Correct routing |
| --- | --- |
| “Fix Netlify config/build/output” | `make-app-netlify-ready` |
| “Upload this already-built output to Netlify” | `deploy-prebuilt-app-to-netlify` |
| “Align local versions, URLs, and install commands” | `fix-project-metadata-mismatches` |
| “Prepare/configure the GitHub repository” | `make-project-github-ready` |
| “Draft or create this GitHub release” | `publish-verified-github-release` |
| “Verify the existing tag, release, npm version, and CI” | `verify-github-npm-release` |
| “Ship the Agent Skill through multiple authorized channels” | `release-agent-skill` orchestrating specialists |
| “Add/update the local Skillfolio record” | `update-skillfolio-catalog` |

The descriptions should encode these seams within their first 250 characters. Repository tests should contain positive, negative, ambiguous, authorization, and unavailable-tool prompt fixtures for every skill.

## Merge, split, retire, and orchestration decisions

### Keep separate

- `make-app-netlify-ready` and `deploy-prebuilt-app-to-netlify`: local preparation versus remote mutation.
- `fix-project-metadata-mismatches` and `make-project-github-ready`: repeated local values versus repository/community/remote GitHub state.
- `publish-verified-github-release` and `verify-github-npm-release`: author/mutate versus independent read-only verification.
- the three “ensure” skills: each owns a distinct artifact, evidence source, and verification loop.

### Redesign as orchestration

- `release-agent-skill`: retain the high-level release interface, remove duplicated specialist detail, and make stage/authorization state explicit.

### No split recommended

- audit plus authorized repair remains coherent for frontend consistency, social previews, SupportKori, GitHub preparation, and metadata synchronization because each pair shares evidence and verification.
- README generation should remain one outcome, with context routed more selectively rather than split into many project-type skills.

### No retirement recommended

No skill is a pure duplicate or no-op. Public distribution does not change the distinct workflow owned by each skill.

## Recommended implementation batches

The maintainer approved all batches below. Their completion is established by the repository validation and test evidence produced after implementation, not by this pre-change audit snapshot.

### Batch A — common contract and discovery

- shorten all descriptions and front-load primary boundaries;
- remove caller-provider names from portable descriptions;
- add evidence-backed `license` and `compatibility` fields where applicable;
- add shared prompt-routing fixtures and portfolio overlap checks;
- strengthen the root validator against the full Agent Skills name, length, field, and resource contract.

### Batch B — deterministic test quality

- fix temporary-directory cleanup in `find-ui-inconsistencies` and `release-agent-skill` tests;
- add behavioral tests for `publish-verified-github-release` collector, `release-agent-skill` preflight, and `fix-project-metadata-mismatches` auditor;
- expand Netlify and Skillfolio fixtures;
- add a preflight/test harness for `deploy-prebuilt-app-to-netlify` before public distribution.

### Batch C — seams and orchestration

- redesign `release-agent-skill` as the release orchestrator;
- encode neighbor routing in the release, metadata, GitHub, Netlify, and Skillfolio skills;
- keep authorization scoped per stage and provide fallbacks when a specialist is unavailable.

### Batch D — distribution and host portability

- preserve accurate licensing while publicly packaging `integrate-supportkori-widget` and `deploy-prebuilt-app-to-netlify`;
- publish `update-skillfolio-catalog` without widening its local mutation boundary;
- replace divergent installers with a shared tested target registry while preserving public package and binary compatibility;
- add Gemini, Antigravity, ZCode, Cursor, Copilot, and OpenCode targets only with official-path tests;
- display format, installer, and runtime evidence separately in Skillfolio.

### Batch E — context and drift control

- make the full README benchmark conditional while preserving the evidence standard;
- date volatile provider/framework references and add explicit drift checks;
- remove repeated policy between skill bodies and references;
- add a scheduled or release-time compatibility documentation audit without performing automatic remote mutation.

## Resolved decision gate

The approved direction is:

1. keep all twelve canonical names and workflows;
2. approve Batches A–C as the quality baseline;
3. publish `integrate-supportkori-widget` as explicitly `UNLICENSED` and `deploy-prebuilt-app-to-netlify` under MIT;
4. publish `update-skillfolio-catalog` while preserving its local-catalog scope;
5. implement Batch D with evidence-tiered host claims;
6. implement Batch E as a context-quality cleanup.
