# Contributing to Find UI Inconsistencies

Thanks for helping improve this Agent Skill.

## Requirements

- Node.js 18 or newer.
- npm with lockfile support

## Local workflow

\`\`\`sh
npm ci
npm test
npm run pack:check
\`\`\`

Keep changes focused, preserve the skill's authorization boundaries, and update tests whenever installer or bundled-script behavior changes. Inspect the exact npm archive before proposing a release.

## Pull requests

1. Fork and clone [the repository](https://github.com/montasim/skills/tree/main/skills/find-ui-inconsistencies).
2. Create a focused branch.
3. Run all required checks.
4. Explain the user-facing outcome, safety implications, and verification performed.

Do not include credentials, generated archives, unrelated formatting, or unverified compatibility claims.

