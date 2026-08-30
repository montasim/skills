import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const auditor = join(skillRoot, "scripts", "audit-metadata.mjs");

function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), "metadata-audit-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function run(root, ...args) {
  return spawnSync(process.execPath, [auditor, root, "--json", ...args], { encoding: "utf8" });
}

function writeProject(root, { drift = false } = {}) {
  const repository = "https://github.com/example/fixture";
  const manifest = {
    name: "fixture-skill",
    version: "1.2.3",
    description: "Fixture metadata auditor.",
    repository,
    homepage: `${repository}#readme`,
    bugs: `${repository}/issues`,
    funding: "https://example.test/support",
    engines: { node: ">=18" },
    bin: { "fixture-skill": "bin/fixture.js" }
  };
  writeFileSync(join(root, "package.json"), JSON.stringify(manifest, null, 2));
  writeFileSync(join(root, "package-lock.json"), JSON.stringify({ packages: { "": { ...manifest, version: drift ? "1.0.0" : manifest.version } } }, null, 2));
  writeFileSync(join(root, "README.md"), drift
    ? "# Fixture\n\nRelease 1.0.0.\n"
    : `# fixture-skill\n\n${manifest.description}\n\nVersion 1.2.3.\n\n${repository}\n${manifest.homepage}\n${manifest.bugs}\n${manifest.funding}\nNode >=18.\n\n\`\`\`sh\nnpx fixture-skill\n\`\`\`\n`);
  mkdirSync(join(root, "skills", "fixture-skill"), { recursive: true });
  writeFileSync(join(root, "skills", "fixture-skill", "SKILL.md"), "---\nname: fixture-skill\ndescription: Audit fixture metadata.\n---\n\n# Fixture\n");
}

test("reports deterministic metadata agreement and bounded manual coverage", (t) => {
  const root = temporary(t);
  writeProject(root);
  const result = run(root, "--strict");
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.findings.length, 0);
  assert.ok(report.coverage.some((entry) => entry.field === "version" && entry.status === "verified"));
  assert.match(report.scope, /Deterministic comparisons only/);
});

test("strict mode fails on lockfile and README drift", (t) => {
  const root = temporary(t);
  writeProject(root, { drift: true });
  const result = run(root, "--strict");
  assert.equal(result.status, 1, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.ok(report.findings.some((entry) => entry.field === "version" && entry.file === "package-lock.json"));
  assert.ok(report.findings.some((entry) => entry.field === "repository" && entry.file === "README.md"));
  assert.ok(report.findings.some((entry) => entry.field === "install-command"));
});

test("returns invocation status 2 when package metadata is unavailable", (t) => {
  const root = temporary(t);
  const result = run(root);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /No package\.json found/);
});
