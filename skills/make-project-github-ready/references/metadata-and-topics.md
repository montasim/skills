# GitHub Metadata and Topics

Use this reference when proposing or reviewing repository-facing metadata.

## Repository name

- Prefer the established project or package name.
- Use a readable, stable slug without promotional modifiers.
- Avoid names likely to be confused with a different product or organization.
- Check both GitHub ownership and package-registry identity before claiming availability.

## Description

Write one factual sentence fragment that explains what the project does and, when useful, for whom. Lead with the concrete capability. Avoid slogans, keyword lists, unsupported superlatives, release numbers, emoji, and punctuation-heavy calls to action.

Good pattern:

```text
Audit and repair large-image social previews for web applications.
```

Weak pattern:

```text
The ultimate blazing-fast SEO tool | Open Graph | AI | Best social cards!
```

Derive the wording from current source, package metadata, and documented behavior. Keep terminology consistent across the repository, manifest, documentation, and catalog.

## Homepage

Use a homepage only when its target is verified and represents the project:

- deployed application;
- stable documentation site;
- package registry page when it is the primary product surface.

Do not use an aspirational, private, broken, or unrelated URL. The repository URL itself does not need to be repeated as the homepage.

## Topics

Choose a focused set, normally 5–12 topics, that improves discovery without misrepresentation.

Include, when supported by evidence:

- product category, such as `developer-tools` or `static-site-generator`;
- primary capability, such as `open-graph` or `release-automation`;
- ecosystem, such as `nodejs`, `react`, `codex`, or `claude-code`;
- distribution form, such as `cli` or `agent-skills`;
- major framework or provider only when the project directly supports it.

Use lowercase GitHub topic slugs. Prefer established terms over invented variants. Avoid:

- generic promotional terms such as `awesome`, `best`, or `production-ready`;
- unrelated trending technologies;
- duplicate singular/plural variants;
- features merely planned but not implemented;
- personal branding unless it is part of the project identity.

Treat topics as descriptive metadata, not a guarantee of search ranking.

## Visibility

Require an explicit user choice before creating a repository or changing visibility. Explain that making a repository public exposes its full reachable history, not only the current files. Inspect for secrets and sensitive material before recommending public visibility, but never claim a secret scan proves safety.

## Default branch

Prefer the existing primary branch and project conventions. Ensure the branch exists remotely before setting it as default. Do not rename branches, rewrite history, or change branch protection as a side effect of metadata preparation.

## Community and security surface

Recommend files based on project needs:

- `CONTRIBUTING.md` for contribution expectations and validation commands;
- `SECURITY.md` for private vulnerability reporting and support boundaries;
- `SUPPORT.md` when support differs from bug reporting;
- code of conduct for projects actively inviting community participation;
- issue and pull-request templates when recurring reports need structure;
- CI workflows when deterministic validation exists.

Do not generate empty policy theater. Every path, command, contact, and supported-version statement must be real and maintainable.
