# Publish Verified GitHub Release

[![npm version](https://img.shields.io/npm/v/publish-verified-github-release.svg)](https://www.npmjs.com/package/publish-verified-github-release)
[![CI](https://github.com/montasim/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Install a portable agent skill that gathers repository evidence, drafts polished GitHub release notes, and creates or edits a release only when the user explicitly authorizes that external action.

The skill uses the open Agent Skills format and includes installer presets for OpenAI Codex, Claude Code, Gemini CLI, Google Antigravity, Antigravity CLI, Cursor, GitHub Copilot, and OpenCode. An exact-path mode supports any other agent that discovers `SKILL.md` directories. It separates local evidence from live GitHub or registry state, keeps claims tied to commits and verified behavior, and does not silently create tags, push commits, publish packages, or deploy applications.

## Install

### From this source checkout

Requires Node.js 18 or newer. Git is required when the installed skill collects repository evidence.

```sh
npm ci
npm test
node ./bin/publish-verified-github-release.js --target codex --scope project
```

This installs the skill into `.agents/skills/publish-verified-github-release` in the current project.

### From npm

Codex:

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target codex
```

Claude Code:

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target claude
```

Both:

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target both
```

Gemini CLI or Google Antigravity:

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target gemini
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target antigravity
```

Antigravity CLI or Cursor:

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target antigravity-cli
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target cursor
```

GitHub Copilot or OpenCode:

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target copilot
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target opencode
```

Every supported provider, or a selected set:

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target all
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --target gemini,antigravity,copilot
```

Any other Agent Skills-compatible provider:

```sh
npx --yes --package=publish-verified-github-release@latest publish-verified-github-release --path /exact/provider/skills/root
```

Reload or restart the relevant agent after installation so it discovers the skill. Invocation syntax varies by provider; agents can also select the skill automatically from its description.

## What it does

- Resolves the release repository, tag, comparison base, and mutation boundary
- Collects commit, Git, manifest, changelog, and target-ref evidence
- Turns verified changes into concise, user-focused release notes
- Adds install, migration, verification, and link sections only when supported
- Creates or edits a GitHub release after explicit authorization
- Verifies the resulting URL, tag, target commit, and draft or prerelease state

The bundled evidence collector reads package metadata from the requested Git ref and does not execute tests or query remote release and registry state. The agent performs those checks separately when relevant.

## Installer options

```text
--target <provider[,provider...]>  Provider preset(s), all, or legacy both
--scope <user|project>             Install scope; defaults to user
--path <directory>                 Exact custom skills root; provider optional
--dry-run                          Preview destinations without writing
--force                            Replace an existing installation
--help                             Show help
--version                          Show package version
```

| Provider | User scope | Project scope |
| --- | --- | --- |
| Codex | `~/.agents/skills` | `.agents/skills` |
| Claude Code | `${CLAUDE_CONFIG_DIR:-~/.claude}/skills` | `.claude/skills` |
| Gemini CLI | `~/.gemini/skills` | `.gemini/skills` |
| Google Antigravity | `~/.gemini/config/skills` | `.agents/skills` |
| Antigravity CLI | `~/.gemini/antigravity-cli/skills` | `.agent/skills` |
| Cursor | `~/.cursor/skills` | `.cursor/skills` |
| GitHub Copilot | `~/.copilot/skills` | `.github/skills` |
| OpenCode | `~/.config/opencode/skills` | `.opencode/skills` |

`both` remains an alias for `codex,claude`. `all` installs every preset and de-duplicates shared destinations. `--path` may be used by itself, so a newly released or private provider does not need a hard-coded installer preset.

The installer refuses duplicate installations unless `--force` is supplied, rejects unsafe symlink or non-directory destinations, and stages replacements before swapping them into place.

## How installation works

The npm executable copies the portable `skills/publish-verified-github-release` directory into the selected host's skill root. Installation does not inspect a project, contact GitHub, create a tag, or create a release; those actions occur only when the installed skill is later invoked with appropriate authority.

## Examples

Draft notes only:

```text
Use $publish-verified-github-release to draft release notes for v1.2.0 from the verified changes since v1.1.0.
```

Update an existing release:

```text
Use /publish-verified-github-release to improve the v1.2.0 GitHub release notes. Do not change the tag.
```

## Requirements and limits

- Node.js 18 or newer is required for the installer and bundled collector.
- Git is required to collect local release evidence.
- GitHub authentication and suitable repository permissions are required only for an authorized release mutation.
- The target tag, comparison base, and repository must be unambiguous.
- Package publication, deployment, pushing commits, and tag creation require separate authorization.
- Test and compatibility claims are included only when actually verified.

## Development

```sh
npm ci
npm test
npm run pack:check
```

The published archive intentionally contains only the installer, the nested skill, this README, the license, and package metadata. Tests are excluded.

`npm test` exercises native provider layouts, all-provider and selected-provider installs, generic paths, duplicate protection, forced replacement, dry-run behavior, unsafe destinations, and the package contract. `npm run pack:check` previews the npm archive, and `prepublishOnly` runs both checks before publication.

## Updating and removing

Rerun the `@latest` installation command with `--force` to replace an older installation. To uninstall, remove only the `publish-verified-github-release` directory from the relevant user or project skill root listed above.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for requirements, the local workflow, required checks, and pull-request guidance.

## Support and security

Read [SUPPORT.md](SUPPORT.md) and use [GitHub Issues](https://github.com/montasim/skills/issues) for reproducible bugs and focused requests. Report vulnerabilities privately according to [SECURITY.md](SECURITY.md), never through a public issue. The SupportKori link is funding, not technical support.

## Project links

- [npm package](https://www.npmjs.com/package/publish-verified-github-release)
- [Source repository](https://github.com/montasim/skills/tree/main/skills/publish-verified-github-release)
- [Issue tracker](https://github.com/montasim/skills/issues)
- [Security policy](SECURITY.md)

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain the release workflow and verification guidance.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Publish Verified GitHub Release is available under the [MIT License](LICENSE).
