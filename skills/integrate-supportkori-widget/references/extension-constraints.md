# Browser-extension constraints

Read this file for every extension repository, even when the repository also contains a conventional website.

## Map surfaces before editing

Classify each candidate surface:

- **Companion website:** a normal HTTPS marketing, documentation, account, or landing site. Apply the web integration guidance to this surface.
- **Extension page:** a popup, options page, side panel, new-tab page, offscreen document, extension-owned tab, or background/service-worker context.
- **Injected page UI:** markup or code added by a content script to a visited website.

Do not treat a working companion-site widget as proof that the extension runtime has support, and do not copy a web snippet into an extension page without a policy review.

## Manifest V3 remote-code boundary

Manifest V3 extension logic must be packaged with the extension. An extension page or isolated-world content script must not load and execute `https://supportkori.com/widget.js` as a remote script. Adding the origin to `script-src` does not make this acceptable, and Chrome enforces a minimum extension-page policy that keeps executable code local.

Relevant Chrome documentation:

- <https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy>
- <https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code>
- <https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements>

Do not bundle a downloaded copy of the provider script as an automatic workaround. That can create update, integrity, licensing, and store-review problems; obtain explicit permission and verify provider terms before considering it.

## Evaluate an app-owned embedded surface

An extension-owned `Support` trigger may open a remote SupportKori page in an isolated iframe only when all of the following are proven:

1. The extension's packaged code owns all privileged behavior and does not execute remote code in an extension context.
2. The remote frame has no extension API access and is isolated from privileged data.
3. The manifest CSP narrowly permits the required frame origin.
4. SupportKori's response headers allow the exact extension framing context.
5. The integration does not collect, expose, or transmit browsing or user data unrelated to the explicit support interaction.
6. The behavior remains consistent with the extension's disclosed single purpose, privacy disclosures, and store policy.

Remote content inside an isolated iframe can be exempt from the Manifest V3 remote-hosted-code restriction, but it is not automatically compliant. Store reviewers must still be able to understand the extension's functionality, and user-data rules still apply.

Use the narrowest iframe `sandbox` and `allow` capabilities that preserve the payment flow. Verify the actual flow; payment providers can require popups, top-level redirects, storage, or permissions that a restrictive sandbox blocks.

## Treat injected page UI separately

Do not have an isolated content script load the remote widget script. If a normal visited page already owns a SupportKori integration, the extension should not alter it unless that behavior is a declared part of the extension's purpose.

Injecting a new support control into arbitrary third-party pages is normally outside this skill's scope and may violate user expectations or store policy. Pause and request direction if the user appears to want that behavior.

## Report a real block instead of faking success

Use `platform-blocked` when the requested embedded experience cannot be implemented without remote-code violations, impermissible CSP changes, denied framing, excessive permissions, or policy risk. State the exact boundary and the safest viable alternatives, such as:

- adding the widget only to the companion website;
- adding a native support information view without remote code; or
- using an external SupportKori link, but only if the user accepts navigation outside the extension.

Do not silently substitute an external link when the user explicitly requested an in-app panel.
