# Contributing to Build Android App from Web

Thanks for helping improve this Agent Skill.

## Requirements

- Node.js 18 or newer
- npm with lockfile support
- Python 3 for parity-manifest validation

## Local workflow

```sh
npm ci
npm test --workspace skills/build-android-app-from-web
npm run pack:check --workspace skills/build-android-app-from-web
```

Keep changes generic across web frameworks and Android application types. Preserve the skill's evidence, authorization, and parity-closure boundaries, and update behavioral tests whenever the manifest contract or validator changes. Inspect the exact npm archive before proposing a release.

## Pull requests

1. Fork and clone [the repository](https://github.com/montasim/skills/tree/main/skills/build-android-app-from-web).
2. Create a focused branch.
3. Run all required checks.
4. Explain the user-facing outcome, safety implications, and verification performed.

Do not include credentials, generated archives, project-specific assumptions, unrelated formatting, or unverified compatibility claims.
