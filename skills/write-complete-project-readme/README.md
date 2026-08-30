# Write Complete Project README

> Create or regenerate one software project's root `README.md` from verified repository evidence and a full-document quality gate.

[![npm version](https://img.shields.io/npm/v/write-complete-project-readme.svg)](https://www.npmjs.com/package/write-complete-project-readme)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Write Complete Project README gives an AI coding agent an evidence-first documentation workflow for applications, packages, CLIs, APIs, services, containers, templates, monorepos, research projects, Agent Skills, and hybrids. It reads the project rather than filling a generic template, identifies the primary reader's fastest path to value, and verifies the whole document—not just badges, installation, or one newly added section.

The skill writes exactly one artifact: `<project-root>/README.md`. It does not create licenses, funding files, screenshots, social previews, governance files, topics, releases, or nested READMEs.

```sh
npx --yes --package=write-complete-project-readme@latest write-complete-project-readme --target codex
```

**[npm package](https://www.npmjs.com/package/write-complete-project-readme) · [source](https://github.com/montasim/skills/tree/main/skills/write-complete-project-readme) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- A project needs a complete root README created from code and repository evidence.
- A boilerplate or generic README needs major information-architecture repair.
- Setup, primary usage, architecture, limits, security, support, and license facts must agree.
- A package, CLI, service, app, or monorepo needs documentation adapted to its actual public surface.
- A partial README patch would leave important reader paths missing.

Do not use it for audit-only reports, organization/profile READMEs, nested documentation indexes, translations, badge-only edits, or non-README assets.

## Install and invoke

Node.js 18 or newer is required for the dependency-free installer and deterministic checker. This package retains a mature custom installer for Codex and Claude Code because it supports conservative auto-detection and transactional migration from previous Codex skill roots.

```sh
# Explicit user installation
npx --yes --package=write-complete-project-readme@latest write-complete-project-readme --target codex

# Project-local installation for both supported hosts
npx --yes --package=write-complete-project-readme@latest write-complete-project-readme \
  --target both --scope project

# Preview destinations without writing
npx --yes --package=write-complete-project-readme@latest write-complete-project-readme \
  --target both --dry-run
```

Restart the selected host or begin a new session after installation.

```text
Use $write-complete-project-readme to regenerate this project's root README from verified repository evidence. Lead with the CLI workflow and preserve verified migration warnings.
```

```text
/write-complete-project-readme Create a complete root README for this application. Do not change any other file.
```

Natural-language discovery uses the shared `SKILL.md` description; `$write-complete-project-readme` and `/write-complete-project-readme` select it explicitly.

## Output contract

| The skill does | The skill does not |
| --- | --- |
| Resolve and write the Git worktree root `README.md` | Write nested, translated, profile, or organization READMEs |
| Verify and preserve useful existing project knowledge | Preserve stale structure or unsupported claims |
| Adapt depth and order to the dominant project type | Copy a universal heading template |
| Derive commands, examples, links, and limits from evidence | Guess demos, authors, funding, support, compatibility, or license terms |
| Link verified existing media and governance paths | Create images, banners, diagrams as files, licenses, or governance assets |
| Run deterministic Markdown hygiene checks | Claim syntax validation proves factual accuracy |

After writing, the skill confirms that no other project file changed.

## Evidence precedence

Every claim follows this order:

1. Current request and repository instructions
2. Authoritative manifests, lockfiles, runtime declarations, and standard project files
3. Code, public interfaces, routes, tests, CI, releases, deployment, and operations config
4. External endpoints actually verified during the task
5. The existing README after its facts survive stronger evidence
6. A clearly qualified inference
7. A visible configuration-required marker for a relevant unresolved optional value

The skill never uses its own publisher identity, funding link, installation path, global Git configuration, or benchmark content as evidence about another project. Safe templates such as `.env.example` may be inspected; real secret files are not opened or quoted.

## Reader workflow

The README is designed so a reader can:

1. **Orient:** understand the project, audience, problem, outcome, and next action.
2. **Evaluate:** see current capabilities, strongest proof, and adoption constraints.
3. **Activate:** follow verified prerequisites, installation/configuration, first action, and a supported success signal.
4. **Use:** perform the primary workflow or exercise the public interface.
5. **Trust:** understand compatibility, status, safety, privacy, data, accuracy, operational, and license limits.
6. **Participate:** find verified support, security, contribution, funding, authorship, and conduct paths when they exist.

Project type changes the reading order and examples, not the completeness bar. The bundled sanitized Ramadan Clock specimen is used only as a depth benchmark for substantial applications, hybrids, and major information-architecture repairs; none of its facts are target-project evidence.

## Configuration-required markers

When a relevant optional value cannot be established safely, the draft uses an adjacent machine-checkable marker instead of a guess:

```markdown
> **Configuration required:** Add the project's verified funding URL.
<!-- write-complete-project-readme:configure funding -->
```

A README containing a marker is a configuration-required draft, not a finished document. Missing license permission is handled directly: the README states that reuse rights have not been granted rather than inventing a license or marker.

## Run the deterministic checker

```sh
node /absolute/skill/root/scripts/check-readme.mjs /absolute/project/root
```

Add `--json` for machine-readable diagnostics.

The checker verifies marker pairing and syntax, narrowly defined template placeholders, balanced code fences, duplicate normalized headings, relative links and images with exact filename case, and non-empty image alt text.

| Exit | Meaning |
| --- | --- |
| `0` | Deterministic checks passed |
| `1` | Validation findings or configuration-required markers remain |
| `2` | Invalid invocation or internal failure |

External links, prose truth, accessibility beyond empty image alt text, and the quality of setup or examples still require evidence review.

## Installer behavior

| Option | Behavior |
| --- | --- |
| `--target auto\|codex\|claude\|both` | Select destination; strict `auto` succeeds only when exactly one host is detected |
| `--scope user\|project` | Select the standard user or repository-local root |
| `--path <absolute-root>` | Use one custom skills root; incompatible with `both` and explicit `--scope` |
| `--dry-run` | Report destinations, migration sources, and actions without writing |
| `--force` | Replace an existing current installation |
| `--migrate` | Transactionally replace recognized previous Codex-root installations |

Auto-detection inspects environment variables, known directories, and executable names without running an agent command. It selects a destination; it does not prove caller identity. Migration is explicit, stages all selected targets, and attempts cross-target rollback if any publication step fails.

## Bundled resources

```text
write-complete-project-readme/
├── SKILL.md
├── agents/openai.yaml
├── references/
│   ├── quality-standard.md
│   └── ramadan-clock-standard.md
└── scripts/check-readme.mjs
```

The installed skill performs no analytics or telemetry. Claude.ai and Anthropic API surfaces do not read a local Claude Code skills directory and require their own upload mechanism.

## Develop, package, and release

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/write-complete-project-readme
npm run pack:check --workspace skills/write-complete-project-readme
```

Tests cover Codex and Claude destinations, auto-detection, scopes, custom paths, migration, rollback, checker behavior, portability, and package contents. Releases use the monorepo's namespaced tag form:

```text
write-complete-project-readme-v<version>
```

## Limits and safety

- Incomplete repository evidence can require maintainer input or a visible configuration marker.
- A deterministic clean result does not prove commands, links, status, or prose claims are true.
- The skill does not perform deployments, releases, external writes, or adjacent repository cleanup merely to document them.
- Existing screenshots, badges, demos, and external links appear only when their identity and destination are verified.

## Support, contribution, and license

For reproducible issues, include host, installer options, Node.js version, operating system, expected result, and sanitized output. Use [GitHub Issues](https://github.com/montasim/skills/issues), and follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance. Never publish private repository content, tokens, secret values, or sensitive paths.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports installer, checker, and project-type guidance. Licensed under the [MIT License](LICENSE).
