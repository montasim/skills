# Deploy Prebuilt App to Netlify

An Agent Skill for inspecting a locally built web artifact and uploading it directly to an existing Netlify site without triggering a remote repository build.

## Install

```sh
npx --yes --package=deploy-prebuilt-app-to-netlify@latest deploy-prebuilt-app-to-netlify --target codex
```

The installer supports the host targets shown by `--help`, project or user scope, an exact custom skill root, dry runs, and guarded replacement.

## Scope

The skill separates local artifact preparation from remote mutation. A manual Netlify upload, production targeting, site linkage, settings changes, and deployment are performed only under the authorization rules in the installed `SKILL.md`.

The bundled preflight checks directory safety, required artifacts, and obvious environment-file exposure. It does not authenticate, upload, or prove deployed runtime behavior.

## Requirements

- Node.js 18 or newer for the installer and preflight
- Netlify CLI and an authenticated, linked site for an authorized deployment

## License

[MIT](LICENSE)
