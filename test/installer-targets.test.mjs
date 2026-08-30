import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { hostDefinitions } from "../scripts/package-installer-runtime.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
const configuration = JSON.parse(readFileSync(join(root, "installer-targets.json"), "utf8"));

test("shared installer registry covers every ordinary package", () => {
  const configured = new Set([
    ...Object.keys(configuration.packages),
    ...Object.keys(configuration.compatibilityExceptions),
  ]);
  const packaged = catalog.skills
    .filter((entry) => ["npm", "internal"].includes(entry.distribution))
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual([...configured].sort(), packaged);
  assert.deepEqual(Object.keys(configuration.compatibilityExceptions), ["write-complete-project-readme"]);
});

test("host roots match the audited official-path contract", () => {
  assert.deepEqual(hostDefinitions.codex.project, [".agents", "skills"]);
  assert.deepEqual(hostDefinitions.claude.project, [".claude", "skills"]);
  assert.deepEqual(hostDefinitions.gemini.project, [".gemini", "skills"]);
  assert.deepEqual(hostDefinitions.antigravity.user, [".gemini", "config", "skills"]);
  assert.deepEqual(hostDefinitions["antigravity-cli"].user, [".gemini", "antigravity-cli", "skills"]);
  assert.deepEqual(hostDefinitions.zcode.user, [".zcode", "skills"]);
  assert.equal(hostDefinitions.zcode.project, null);
  assert.deepEqual(hostDefinitions.copilot.project, [".github", "skills"]);
  assert.deepEqual(hostDefinitions.opencode.user, [".config", "opencode", "skills"]);
});

test("checked-in package installers match the shared runtime", () => {
  const result = spawnSync(process.execPath, [join(root, "scripts", "generate-installers.mjs"), "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 11 shared package installers/);
});
