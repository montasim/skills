import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const preflight = join(root, "scripts", "preflight.mjs");

function temporary(t) {
  const directory = mkdtempSync(join(tmpdir(), "netlify-upload-preflight-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function run(project, ...args) {
  return spawnSync(process.execPath, [preflight, project, ...args, "--json"], { encoding: "utf8" });
}

test("accepts a non-empty static publish directory and optional functions", (t) => {
  const project = temporary(t);
  mkdirSync(join(project, "dist"));
  mkdirSync(join(project, "functions"));
  writeFileSync(join(project, "dist", "index.html"), "<!doctype html><title>Fixture</title>");
  writeFileSync(join(project, "functions", "api.mjs"), "export default () => new Response('ok')");
  const result = run(project, "--publish", "dist", "--functions", "functions");
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.safeToUpload, true);
  assert.equal(report.findings.length, 0);
  assert.ok(report.notChecked.includes("remote deploy behavior and public routes"));
});

test("rejects broad, missing, secret-bearing, and symlink upload paths", (t) => {
  const project = temporary(t);
  const broad = run(project, "--publish", ".");
  assert.equal(broad.status, 1);
  assert.ok(JSON.parse(broad.stdout).findings.some((item) => item.code === "broad-publish"));

  const missing = run(project, "--publish", "dist");
  assert.equal(missing.status, 1);
  assert.ok(JSON.parse(missing.stdout).findings.some((item) => item.code === "missing-publish"));

  mkdirSync(join(project, "real-dist"));
  writeFileSync(join(project, "real-dist", "index.html"), "fixture");
  writeFileSync(join(project, "real-dist", ".env.production"), "SECRET=fixture");
  const secret = run(project, "--publish", "real-dist");
  assert.equal(secret.status, 1);
  assert.ok(JSON.parse(secret.stdout).findings.some((item) => item.code === "secret-file"));

  symlinkSync(join(project, "real-dist"), join(project, "linked-dist"));
  const linked = run(project, "--publish", "linked-dist");
  assert.equal(linked.status, 1);
  assert.ok(JSON.parse(linked.stdout).findings.some((item) => item.code === "unsafe-publish"));
});

test("warns when a client-only artifact has no recognizable entry", (t) => {
  const project = temporary(t);
  mkdirSync(join(project, "dist"));
  writeFileSync(join(project, "dist", "asset.js"), "fixture");
  const result = run(project, "--publish", "dist");
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.safeToUpload, true);
  assert.ok(report.findings.some((item) => item.code === "entry-artifact-unconfirmed"));
});

test("requires an explicit publish directory", (t) => {
  const project = temporary(t);
  const result = spawnSync(process.execPath, [preflight, project], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--publish is required/);
});
