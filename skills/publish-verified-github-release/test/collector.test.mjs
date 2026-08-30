import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const collector = join(skillRoot, "scripts", "collect-release-evidence.mjs");

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "release-evidence-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" });
  git("init", "--initial-branch=main");
  git("config", "user.name", "Release Tester");
  git("config", "user.email", "release@example.test");
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture-skill", version: "1.0.0" }, null, 2));
  git("add", "package.json");
  git("commit", "-m", "initial release");
  git("tag", "v1.0.0");
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture-skill", version: "1.1.0" }, null, 2));
  git("add", "package.json");
  git("commit", "-m", "add verified workflow");
  git("tag", "v1.1.0");
  return root;
}

function run(root, args) {
  return spawnSync(process.execPath, [collector, root, ...args], { encoding: "utf8" });
}

test("collects tag-scoped package and commit evidence", (t) => {
  const root = fixture(t);
  const result = run(root, ["--tag", "v1.1.0", "--base", "v1.0.0"]);
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(result.stdout);
  assert.equal(evidence.release.range, "v1.0.0..v1.1.0");
  assert.equal(evidence.package.version, "1.1.0");
  assert.equal(evidence.package.source, "v1.1.0:package.json");
  assert.equal(evidence.commits.length, 1);
  assert.equal(evidence.commits[0].subject, "add verified workflow");
  assert.equal(evidence.repository.clean, true);
});

test("reads package metadata from the target tag instead of the dirty working tree", (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture-skill", version: "9.9.9" }, null, 2));
  const result = run(root, ["--tag", "v1.1.0"]);
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(result.stdout);
  assert.equal(evidence.package.version, "1.1.0");
  assert.equal(evidence.repository.clean, false);
  assert.ok(evidence.repository.changedPaths.some((entry) => entry.includes("package.json")));
});

test("rejects missing tags and unknown options", (t) => {
  const root = fixture(t);
  const missing = run(root, ["--tag", "v8.0.0"]);
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /Requested tag does not exist/);
  const unknown = run(root, ["--unknown"]);
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /Unknown option/);
});
