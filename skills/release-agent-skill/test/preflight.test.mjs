import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const preflight = join(skillRoot, "scripts", "preflight.mjs");

function temporary(t) {
  const parent = mkdtempSync(join(tmpdir(), "skill-preflight-"));
  const root = join(parent, "fixture-skill");
  mkdirSync(root);
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  return root;
}

function run(root, ...args) {
  return spawnSync(process.execPath, [preflight, root, "--json", ...args], { encoding: "utf8" });
}

test("reports a valid standalone skill as structurally sound but not release-ready", (t) => {
  const root = temporary(t);
  writeFileSync(join(root, "SKILL.md"), "---\nname: fixture-skill\ndescription: Validate fixture behavior.\n---\n\n# Fixture\n\nRun the workflow.\n");
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture-skill", version: "1.2.3", repository: "https://example.test/fixture" }));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.structuralOk, true);
  assert.equal(report.releaseReady, null);
  assert.equal(report.skills[0].name, "fixture-skill");
  assert.ok(report.notChecked.includes("npm version availability and dist-tags"));
});

test("finds invalid identity, missing resources, and lockfile drift", (t) => {
  const root = temporary(t);
  mkdirSync(join(root, "references"));
  writeFileSync(join(root, "SKILL.md"), "---\nname: different-name\ndescription: Fixture.\n---\n\nRead [missing](references/missing.md).\n");
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture-skill", version: "not-semver" }));
  writeFileSync(join(root, "package-lock.json"), JSON.stringify({ packages: { "": { name: "other-name", version: "9.0.0" } } }));
  const result = run(root);
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes("name-directory-mismatch"));
  assert.ok(codes.includes("missing-resource"));
  assert.ok(codes.includes("package-version"));
  assert.ok(codes.includes("lock-name"));
  assert.ok(codes.includes("lock-version"));
});

test("returns invocation status 2 for an unknown flag", () => {
  const result = spawnSync(process.execPath, [preflight, "--unknown"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage:/);
});
