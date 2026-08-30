import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const auditorPath = fileURLToPath(new URL("../scripts/audit-supportkori-widget.mjs", import.meta.url));

function createFixture(t, files) {
  const root = mkdtempSync(path.join(tmpdir(), "supportkori-audit-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content, "utf8");
  }

  return root;
}

function runAudit(root) {
  const result = spawnSync(process.execPath, [auditorPath, "--path", root, "--json"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  return JSON.parse(result.stdout);
}

function findingCodes(report) {
  return new Set(report.findings.map((finding) => finding.code));
}

test("classifies a project without SupportKori as missing", (t) => {
  const root = createFixture(t, {
    "package.json": JSON.stringify({ dependencies: { react: "latest" } }),
    "src/App.tsx": "export function App() { return <main>Hello</main>; }",
  });

  const report = runAudit(root);

  assert.equal(report.status, "missing");
  assert.ok(findingCodes(report).has("missing-widget"));
  assert.deepEqual(report.project.frameworkHints, ["React"]);
});

test("detects legacy copy, default color, and hydration risk", (t) => {
  const root = createFixture(t, {
    "package.json": JSON.stringify({ dependencies: { next: "latest", react: "latest" } }),
    "src/app/layout.tsx": `
      export default function Layout({ children }) {
        return <html><body>{children}<script
          src="https://supportkori.com/widget.js"
          data-id="creator"
          data-message="Support montasim"
          data-color="#FFDD00"
        /></body></html>;
      }
    `,
  });

  const report = runAudit(root);
  const codes = findingCodes(report);

  assert.equal(report.status, "integration-risk");
  assert.ok(codes.has("label-not-support"));
  assert.ok(codes.has("provider-default-color"));
  assert.ok(codes.has("raw-script-in-hydrated-source"));
  assert.ok(codes.has("idempotence-not-evident"));
});

test("keeps a guarded client integration at present-for-review", (t) => {
  const root = createFixture(t, {
    "package.json": JSON.stringify({ dependencies: { react: "latest" } }),
    "src/SupportWidget.tsx": `
      import { useEffect } from "react";
      const WIDGET_SCRIPT_ID = "supportkori-widget";
      export function SupportWidget() {
        useEffect(() => {
          if (document.getElementById(WIDGET_SCRIPT_ID)) return;
          const script = document.createElement("script");
          script.id = WIDGET_SCRIPT_ID;
          script.src = "https://supportkori.com/widget.js";
          script.dataset.id = "creator";
          script.dataset.message = "Support";
          script.dataset.color = "#173f3b";
          document.body.append(script);
          return () => script.remove();
        }, []);
        return null;
      }
    `,
    "src/global.css": `
      .sk-widget-btn {
        color: var(--action-fg);
        background: var(--action-bg);
        border-radius: var(--radius-control);
      }
    `,
  });

  const report = runAudit(root);
  const codes = findingCodes(report);

  assert.equal(report.status, "present-for-review");
  assert.ok(codes.has("runtime-verification-required"));
  assert.ok(!codes.has("theme-treatment-not-evident"));
  assert.ok(!codes.has("idempotence-not-evident"));
  assert.deepEqual(report.evidence.lifecycleFiles, ["src/SupportWidget.tsx"]);
});

test("detects an external-only support link", (t) => {
  const root = createFixture(t, {
    "index.html": `<a href="https://supportkori.com/creator" target="_blank">Support</a>`,
  });

  const report = runAudit(root);

  assert.equal(report.status, "integration-risk");
  assert.ok(findingCodes(report).has("external-only-support"));
  assert.deepEqual(report.evidence.externalSupportFiles, ["index.html"]);
});

test("flags a remote widget script in a Manifest V3 runtime surface", (t) => {
  const root = createFixture(t, {
    "manifest.json": JSON.stringify({ manifest_version: 3, name: "Fixture", version: "1.0.0" }),
    "popup.js": `
      const script = document.createElement("script");
      script.src = "https://supportkori.com/widget.js";
      document.body.append(script);
    `,
  });

  const report = runAudit(root);

  assert.equal(report.status, "integration-risk");
  assert.ok(findingCodes(report).has("manifest-v3-remote-script"));
  assert.deepEqual(report.project.extensionManifests, [{
    path: "manifest.json",
    manifestVersion: 3,
    hasContentSecurityPolicy: false,
  }]);
});

test("separates a companion website from a Manifest V3 runtime", (t) => {
  const root = createFixture(t, {
    "manifest.json": JSON.stringify({ manifest_version: 3, name: "Fixture", version: "1.0.0" }),
    "popup.js": "document.body.textContent = 'Extension';",
    "website/index.html": `
      <style>.sk-widget-btn { background: var(--brand); }</style>
      <script src="https://supportkori.com/widget.js" data-id="creator" data-message="Support"></script>
    `,
  });

  const report = runAudit(root);

  assert.equal(report.status, "present-for-review");
  assert.ok(!findingCodes(report).has("manifest-v3-remote-script"));
});

test("ignores generated and dependency directories", (t) => {
  const root = createFixture(t, {
    "src/index.js": "export const message = 'No widget yet';",
    "node_modules/vendor/widget.js": "https://supportkori.com/widget.js",
    "dist/index.html": `<script src="https://supportkori.com/widget.js"></script>`,
  });

  const report = runAudit(root);

  assert.equal(report.status, "missing");
  assert.deepEqual(report.evidence.widgetScriptFiles, []);
  assert.equal(report.auditScope.scannedFiles, 1);
});
