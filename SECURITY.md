# Security policy

Do not report vulnerabilities or disclose sensitive reproduction data in a public issue.

Use [private vulnerability reporting](https://github.com/montasim/skills/security/advisories/new) for every skill and the Skillfolio source maintained in this repository. If private reporting is unavailable, contact the maintainer through a verified private channel listed on [Montasim's GitHub profile](https://github.com/montasim). Do not include sensitive details in a public issue or discussion.

Include the affected skill and version, impact, reproduction conditions, and a minimal sanitized proof. Remove tokens, credentials, private repository content, personal information, and local filesystem details that are not required to understand the issue.

Published packages follow the supported versions documented in their own security policies. The absence of a repository-wide license does not change this disclosure guidance.

## Known development dependency advisory

As of 2026-08-30, `pnpm audit` reports one high-severity advisory for `extract-zip@2.0.1` through Skillfolio's Netlify development tooling. The advisory identifies `2.0.2` as patched, but npm does not currently publish that version. This development-only dependency is not included in any of the thirteen Agent Skill npm packages. The repository tracks the upstream fix and will update when an installable patched release is available.
