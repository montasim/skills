import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const cli = join(root, manifest.bin[manifest.name]);

function temporary(t) {
  const directory = mkdtempSync(join(tmpdir(), "deploy-prebuilt-netlify-package-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function run(args, options = {}) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: options.cwd || root, env: { ...process.env, ...options.env }, encoding: "utf8" });
}

test("package exposes the public installer and staged portable skill", () => {
  assert.equal(manifest.version, "0.1.1");
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.publishConfig.access, "public");
  assert.deepEqual(manifest.files, ["bin/", "skills/"]);
  assert.equal(existsSync(join(root, "skills", manifest.name, "SKILL.md")), true);
  assert.equal(existsSync(join(root, "skills", manifest.name, "scripts", "preflight.mjs")), true);
});

test("installer exposes broad host targets and guarded custom installation", (t) => {
  const help = run(["--help"]);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /zcode/);
  const destination = temporary(t);
  const first = run(["--target", "codex", "--path", destination]);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(existsSync(join(destination, manifest.name, "SKILL.md")), true);
  const duplicate = run(["--target", "codex", "--path", destination]);
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /already installed/);
});
