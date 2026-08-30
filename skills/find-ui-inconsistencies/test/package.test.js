import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const executable = join(root, manifest.bin[manifest.name]);
const skill = join(root, "skills", manifest.name);

function run(args, cwd = root) {
  return spawnSync(process.execPath, [executable, ...args], { cwd, encoding: "utf8", windowsHide: true });
}

function temporary(t, suffix) {
  const directory = mkdtempSync(join(tmpdir(), `${manifest.name}-${suffix}-`));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test("package exposes one portable skill and installer", () => {
  assert.deepEqual(manifest.files, ["bin/", "skills/"]);
  assert.equal(manifest.engines.node, ">=18");
  assert.ok(existsSync(join(skill, "SKILL.md")));
  assert.ok(existsSync(join(skill, "agents", "openai.yaml")));
  assert.equal(existsSync(join(root, "SKILL.md")), true);
  assert.equal(readFileSync(join(root, "SKILL.md"), "utf8"), readFileSync(join(skill, "SKILL.md"), "utf8"));
  const frontmatter = readFileSync(join(skill, "SKILL.md"), "utf8");
  assert.match(frontmatter, new RegExp(`^---\\nname: ${manifest.name}\\n`, "m"));
});

test("installer reports help and version", () => {
  const help = run(["--help"]);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /--target <codex\|claude\|both>/);
  const version = run(["--version"]);
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), manifest.version);
});

test("custom install is guarded and supports force", (t) => {
  const customRoot = temporary(t, "custom");
  const first = run(["--target", "codex", "--path", customRoot]);
  assert.equal(first.status, 0, first.stderr);
  assert.ok(existsSync(join(customRoot, manifest.name, "SKILL.md")));
  const duplicate = run(["--target", "codex", "--path", customRoot]);
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /destination exists/);
  const forced = run(["--target", "codex", "--path", customRoot, "--force"]);
  assert.equal(forced.status, 0, forced.stderr);
});

test("dry-run does not write", (t) => {
  const customRoot = temporary(t, "dry");
  const result = run(["--target", "claude", "--path", customRoot, "--dry-run"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Would install/);
  assert.equal(existsSync(join(customRoot, manifest.name)), false);
});

test("project scope installs for both hosts", (t) => {
  const project = temporary(t, "project");
  const result = run(["--target", "both", "--scope", "project"], project);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(join(project, ".agents", "skills", manifest.name, "SKILL.md")));
  assert.ok(existsSync(join(project, ".claude", "skills", manifest.name, "SKILL.md")));
});

test("installer rejects unsafe and source-overlapping roots", () => {
  const filesystemRoot = resolve(root, "/");
  const unsafe = run(["--target", "codex", "--path", filesystemRoot, "--dry-run"]);
  assert.equal(unsafe.status, 1);
  assert.match(unsafe.stderr, /unsafe skills root/);
  const overlap = run(["--target", "codex", "--path", join(root, "skills"), "--dry-run"]);
  assert.equal(overlap.status, 1);
  assert.match(overlap.stderr, /overlaps the packaged skill source/);
});
