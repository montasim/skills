# Make Project GitHub Ready

> Audit and prepare a professional GitHub repository while keeping local improvements separate from authorized remote mutations.

[![npm version](https://img.shields.io/npm/v/make-project-github-ready.svg)](https://www.npmjs.com/package/make-project-github-ready)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Make Project GitHub Ready gives an AI coding agent a staged path from local repository evidence to a verified GitHub surface. It audits identity, Git state, community health, security guidance, CI, and package metadata; proposes a factual description, homepage, topics, visibility, and default branch; implements local repairs when requested; and changes GitHub only after the exact repository and actions are approved.

```sh
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target codex
```

**[npm package](https://www.npmjs.com/package/make-project-github-ready) · [source](https://github.com/montasim/skills/tree/main/skills/make-project-github-ready) · [issues](https://github.com/montasim/skills/issues)**

## Use it when

- A local project needs an evidence-backed GitHub readiness audit.
- Repository metadata, topics, community files, security policy, or CI need preparation.
- A new GitHub repository should be created and configured after an explicit visibility decision.
- A push or metadata mutation must be verified through GitHub readback rather than assumed from CLI success.

Use `fix-project-metadata-mismatches` for repeated local names, versions, URLs, install commands, and compatibility claims. Use `release-agent-skill` when repository readiness is one stage of an Agent Skill release.

## Install and invoke

Node.js 18 or newer is required for the installer and local repository auditor. Remote stages need authenticated GitHub access.

```sh
npx --yes --package=make-project-github-ready@latest make-project-github-ready \
  --target codex --scope project
```

The shared installer supports Codex, Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. Use `--target all` or an exact `--path` as needed.

Use the same command with the target for your host:

```sh
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target claude
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target gemini
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target antigravity
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target antigravity-cli
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target zcode
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target cursor
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target copilot
npx --yes --package=make-project-github-ready@latest make-project-github-ready --target opencode
```

```text
Use $make-project-github-ready to audit this project and prepare the local repository files. Do not create or change anything on GitHub.
```

```text
/make-project-github-ready Create the approved public owner/project repository, apply the reviewed description and topics, and push main. Read every remote value back afterward.
```

## Readiness stages

| Stage | Typical evidence | Mutation boundary |
| --- | --- | --- |
| Local audit | Git state, manifests, ignore rules, community files, CI, obvious sensitive filenames | Read-only |
| Metadata plan | Name availability, factual description, verified homepage, focused topics, visibility, default branch | Proposal only |
| Local preparation | README/governance files, manifest URLs, CI using real commands | Requires a change request |
| GitHub configuration | Repository creation, visibility, metadata, topics, default branch, settings | Requires exact remote authorization |
| Verification | GitHub API readback, remote SHA, community profile, workflow state | Read-only after mutation |

The skill never treats a configured local remote as proof of GitHub ownership, visibility, or current settings.

## Run the local auditor

```sh
node /absolute/skill/root/scripts/audit-github-project.mjs \
  --path /absolute/path/to/project --json
```

The auditor inventories recognized files, selected manifest metadata, `npm ci` cues, literal CI Node coverage, obvious sensitive filenames, and stale pre-publication wording. It does not scan file contents or Git history for secrets, judge policy quality, prove workflow semantics, or contact GitHub. Manual review and a dedicated secret scanner remain necessary when public visibility is considered.

## Metadata rules

- Preserve the established project or package identity; check both GitHub and registry ownership before claiming availability.
- Write one factual capability-led description, not a slogan or keyword list.
- Use a homepage only when the deployed app, docs, or primary package page is verified.
- Choose a focused set of accurate lowercase topics; exclude planned features and promotional terms.
- Require an explicit visibility choice because public visibility exposes reachable history, not only current files.
- Prefer the existing primary branch and never rewrite history or force-push as a side effect.

## Remote verification

After an authorized mutation, the skill reads back full repository name, visibility, description, homepage, topics, default branch, local and remote SHAs, community profile, workflow presence, and latest run state. A workflow is not reported green while it is still running, and partial success is reported without destructive compensation.

## Bundled resources and installer

```text
make-project-github-ready/
├── SKILL.md
├── agents/openai.yaml
├── references/metadata-and-topics.md
└── scripts/audit-github-project.mjs
```

Use `--scope user|project`, `--dry-run`, `--force`, `--migrate`, a provider list, or `--path`. Installation copies the skill only; it does not inspect a project, create a repository, change settings, or push.

## Develop and verify

```sh
git clone https://github.com/montasim/skills.git
cd skills
npm ci
npm test --workspace skills/make-project-github-ready
npm run pack:check --workspace skills/make-project-github-ready
```

## Limits and safety

- Filename checks cannot prove a repository or its history is secret-free.
- CI text checks cannot prove workflow correctness or successful execution.
- Licenses, badges, deployment URLs, security contacts, and support channels are never invented.
- Public visibility, ownership transfer, history rewrites, branch protection, and force pushes are never inferred from a general preparation request.

## Support, contribution, and license

Use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible defects. Follow the repository [support](https://github.com/montasim/skills/blob/main/SUPPORT.md), [contribution](https://github.com/montasim/skills/blob/main/CONTRIBUTING.md), and [security](https://github.com/montasim/skills/blob/main/SECURITY.md) guidance.

Built and maintained by [Montasim](https://github.com/montasim). Optional [SupportKori funding](https://www.supportkori.com/montasim) supports maintenance. Licensed under the [MIT License](LICENSE).
