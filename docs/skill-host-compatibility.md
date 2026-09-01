# Agent Skill host compatibility

Audit date: 2026-09-01

This matrix separates the portable `SKILL.md` contract from model providers, installation UX, and runtime verification. All thirteen canonical skills use the open Agent Skills structure and keep OpenAI presentation metadata in optional `agents/openai.yaml` files.

## Host matrix

| Host | Official skill contract | Documented discovery | Repository evidence | Status |
| --- | --- | --- | --- | --- |
| OpenAI Codex | Open Agent Skills plus optional `agents/openai.yaml` | Repository and user `.agents/skills` locations; explicit and implicit activation | All 13 skills passed structural validation and local smoke installation; the new web-to-Android skill also passed an independent Codex forward test | Runtime verified for discovery and guided execution |
| Claude Code | Open Agent Skills plus Claude-only extensions | Project `.claude/skills`; user `~/.claude/skills`; explicit `/skill-name` and automatic use | All 13 packaged installers use the shared Claude layout; all 13 portable payloads smoke-install; live probe was blocked before execution by the external-provider data boundary | Format and installer verified; runtime unverified |
| Gemini CLI | Open Agent Skills | `.gemini/skills` and `.agents/skills` aliases at user/workspace scopes; activation requires consent | All generated installers expose the shared Gemini target; target paths are contract-tested | Installer path verified; host runtime unverified |
| Google Antigravity IDE | Open Agent Skills | Workspace `.agents/skills`; global `~/.gemini/config/skills`; legacy workspace `.agent/skills` remains supported | All generated installers expose the shared Antigravity target; target paths are contract-tested | Installer path verified; host runtime unverified |
| Antigravity CLI | Skills and plugins | Current global skill location `~/.gemini/antigravity-cli/skills` | All generated installers expose the shared Antigravity CLI target; target paths are contract-tested | Installer path verified; host runtime unverified |
| ZCode / Z.ai | `SKILL.md` with required `name` and `description` | User `~/.zcode/skills`; UI import from Codex and Claude skill directories; `$skill-name` invocation | All bodies fit ZCode's 100 KB limit; descriptions fit 1,024 characters; generated installers expose the user-scoped ZCode target | Installer path verified; host runtime unverified |
| Cursor | Open Agent Skills | Project/user `.agents/skills` and `.cursor/skills`, plus compatibility locations | All generated installers expose the shared Cursor target; target paths are contract-tested | Installer path verified; host runtime unverified |
| GitHub Copilot | Open Agent Skills | Project `.github/skills`, `.claude/skills`, or `.agents/skills`; user `~/.copilot/skills` or `~/.agents/skills` | All generated installers expose the native Copilot target; target paths are contract-tested | Installer path verified; host runtime unverified |
| OpenCode | Open Agent Skills | Native `.opencode/skills` plus `.agents/skills` and `.claude/skills` compatibility locations | All generated installers expose the native OpenCode target; target paths are contract-tested | Installer path verified; host runtime unverified |

Primary sources: [Agent Skills specification](https://agentskills.io/specification), [OpenAI Codex skills](https://developers.openai.com/codex/build-skills), [Claude Code skills](https://code.claude.com/docs/en/slash-commands), [Gemini CLI getting started](https://geminicli.com/docs/cli/tutorials/skills-getting-started/), [Gemini skill best practices](https://geminicli.com/docs/cli/skills-best-practices/), [Antigravity skills](https://antigravity.google/docs/skills), [Antigravity SDK skill paths](https://antigravity.google/docs/sdk/tools), [ZCode skills](https://zcode.z.ai/en/docs/skill), [Cursor skills](https://prod.cursor.com/docs/skills), [GitHub Copilot skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills), and [OpenCode skills](https://opencode.ai/docs/skills).

## Local runtime evidence

- Installed Codex CLI: `0.150.1`.
- Installed Claude Code CLI: `2.1.181`.
- Gemini CLI, Antigravity, and ZCode were not installed.
- Two independent Codex forward tests exercised `build-android-app-from-web` against an existing web-only product and a separate web-plus-Android product, producing structurally valid parity manifests without modifying either target.
- The matching Claude Code probe was not executed. The approval boundary rejected it because even skill metadata could be transmitted to an external provider. This is a blocked check, not evidence of incompatibility.

## Distribution coverage

| Skill group | First-class installer targets | Other documented hosts |
| --- | --- | --- |
| Twelve shared-installer packages | Codex, Claude Code, Gemini CLI, Antigravity IDE, Antigravity CLI, ZCode, Cursor, GitHub Copilot, OpenCode | Named targets use one generated runtime; ZCode intentionally has no project-scoped destination |
| `write-complete-project-readme` | Codex and Claude Code, plus exact custom paths | Its mature compatibility installer retains conservative host detection and previous Codex-root migration |

Format compatibility is a repository-wide property. Named one-command targets are shared by twelve packages; the README package remains the documented compatibility exception.

## Per-skill runtime requirements

These are skill execution requirements, not host-format restrictions.

| Skill | Material prerequisites |
| --- | --- |
| `build-android-app-from-web` | Web application source and runtime evidence; Android/JDK toolchain for implementation; emulator or device access for runtime proof; Python 3 for parity-manifest validation |
| `find-ui-inconsistencies` | Repository or screenshots; browser/runtime access for full visual proof |
| `publish-verified-github-release` | Node.js for the collector; Git; GitHub/network access only for remote evidence or mutation |
| `deploy-prebuilt-app-to-netlify` | Project build runtime, Netlify CLI, authenticated site linkage, network access |
| `fix-social-link-previews` | Node.js 18+ for the checker; HTTP access for deployed verification; raster tooling only when an asset must be created |
| `integrate-supportkori-widget` | Node.js for the auditor; browser access for runtime proof; provider/network access for embedded behavior |
| `make-app-netlify-ready` | Python 3 for the auditor plus the target project's build runtime |
| `make-project-github-ready` | Node.js for the auditor; Git; GitHub CLI/network only for remote inspection or mutation |
| `release-agent-skill` | Node.js, Git, packaging tools, and channel-specific GitHub/npm credentials and network access |
| `fix-project-metadata-mismatches` | Node.js for deterministic npm metadata auditing |
| `update-skillfolio-catalog` | Python 3 for the validator plus the target app's Node/package-manager toolchain |
| `verify-github-npm-release` | Node.js, Git, GitHub CLI, npm, network access, and applicable read credentials |
| `write-complete-project-readme` | Node.js 18+ for deterministic README checks; target-project runtimes only for safe verification |

The canonical frontmatter intentionally omits `compatibility` because it is not part of this repository's validated shared Agent Skills field set. Material prerequisites belong in each skill body; host claims belong in the dated evidence catalog and must not become a marketing target list.

## Portability implementation

1. Descriptions are compressed to the repository's 250-character discovery budget and front-load their primary boundary.
2. Shared descriptions route by outcome instead of naming the caller provider.
3. Twelve public npm workspaces use the generated installer runtime and target registry. `write-complete-project-readme` remains an explicit compatibility exception because its transactional installer also handles earlier Codex installation roots.
4. Installer-path tests cover Codex, Claude Code, Gemini CLI, Antigravity IDE, Antigravity CLI, ZCode, Cursor, GitHub Copilot, and OpenCode. ZCode project scope remains unsupported because no documented project root was established.
5. Provider-independent routing, frontmatter, resource, and installer tests protect the shared contract.
6. `agents/openai.yaml` remains optional OpenAI presentation metadata and is not required by portable behavior.
7. Skillfolio shows documented format, installer-tested, and runtime-verified evidence separately.

The repository validator rejects evidence profiles more than 120 days old. The weekly CI schedule runs that gate without changing remote state, forcing a documented host-path and claim review before stale evidence can continue passing.

## Z.ai clarification

Z.ai can participate in two different ways:

- **ZCode host:** ZCode has its own documented Agent Skill discovery, import, and `$` invocation behavior.
- **GLM model provider inside another tool:** when a GLM model is used through Claude Code or another supported coding tool, that tool remains the skill host. Its directories, tool permissions, and invocation behavior govern the skill.

The model family alone does not determine whether a skill works. The host must expose the required files, tools, permissions, runtimes, and network access.
