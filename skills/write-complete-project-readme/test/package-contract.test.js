import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const monorepoRoot = resolve(repositoryRoot, "..", "..");
const packageJsonPath = join(repositoryRoot, "package.json");
const packageLockPath = join(monorepoRoot, "package-lock.json");
const skillRoot = join(repositoryRoot, "skills", "write-complete-project-readme");
const skillFile = join(skillRoot, "SKILL.md");
const agentMetadataFile = join(skillRoot, "agents", "openai.yaml");

const expectedDefaultPrompt =
  "Use $write-complete-project-readme to create or regenerate this project's root README.md from verified repository evidence.";

const bannedSkillValues = [
  "montasim",
  "supportkori",
  "fasttimes.netlify.app",
  "1e645b86-edc8-45d2-96aa-a0927ba59c0d",
  "d33wubrfki0l68.cloudfront.net",
  "6a6f0b6bcbe5ac0007640be5/screenshot_2026-08-02-09-24-05-0000.webp",
  "github.com/montasim",
];

const excludedPackagePaths = ["project-readme-template.md"];

function listFiles(root) {
  const files = [];

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      const stats = lstatSync(path);

      assert.equal(stats.isSymbolicLink(), false, `packaged skill must not contain a symlink: ${path}`);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(path);
    }
  }

  visit(root);
  return files;
}

function portablePath(path) {
  return path.split(sep).join("/");
}

test("package exposes the write-complete-project-readme contract", () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const packageLock = JSON.parse(readFileSync(packageLockPath, "utf8"));
  const workspaceLock = packageLock.packages["skills/write-complete-project-readme"];

  assert.equal(packageJson.name, "write-complete-project-readme");
  assert.match(packageJson.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
  assert.equal(workspaceLock.version, packageJson.version);
  assert.equal(packageJson.license, "MIT");
  assert.match(packageJson.description, /Codex/);
  assert.match(packageJson.description, /Claude Code/);
  assert.ok(packageJson.keywords.includes("codex"));
  assert.ok(packageJson.keywords.includes("claude-code"));
  assert.deepEqual(packageJson.bin, {
    "write-complete-project-readme": "bin/write-complete-project-readme.js",
  });
  if (process.platform !== "win32") {
    assert.notEqual(
      lstatSync(join(repositoryRoot, packageJson.bin["write-complete-project-readme"])).mode & 0o111,
      0,
      "the packaged CLI must remain executable",
    );
  }
  assert.equal(existsSync(skillRoot), true, "renamed skill folder is missing");
  const skill = readFileSync(skillFile, "utf8");
  const agentMetadata = readFileSync(agentMetadataFile, "utf8");
  const installedPaths = listFiles(skillRoot)
    .map((path) => portablePath(relative(skillRoot, path)))
    .sort();

  assert.match(skill, /^name:\s*write-complete-project-readme\s*$/m);
  assert.match(skill, /Write only the root `README\.md`/);
  assert.match(skill, /Do not use for audit-only requests/);
  assert.doesNotMatch(skill, /project-readme-template\.md/i);
  assert.equal(
    existsSync(join(skillRoot, "assets", "project-readme-template.md")),
    false,
    "the universal README template must not be installed",
  );
  assert.deepEqual(installedPaths, [
    "SKILL.md",
    "agents/openai.yaml",
    "references/quality-standard.md",
    "references/ramadan-clock-standard.md",
    "scripts/check-readme.mjs",
  ]);
  assert.match(
    agentMetadata,
    new RegExp(`^\\s*default_prompt:\\s*["']${expectedDefaultPrompt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\s*$`, "m"),
  );
});

test("installed skill contains no project-specific benchmark values", () => {
  assert.equal(existsSync(skillRoot), true, "renamed skill folder is missing");

  const violations = [];
  for (const file of listFiles(skillRoot)) {
    const projectPath = portablePath(relative(skillRoot, file));
    const searchable = `${projectPath}\n${readFileSync(file, "utf8")}`.toLowerCase();

    for (const bannedValue of bannedSkillValues) {
      if (searchable.includes(bannedValue.toLowerCase())) {
        violations.push(`${projectPath}: ${bannedValue}`);
      }
    }
  }

  assert.deepEqual(violations, [], `project-specific values leaked into the installed skill:\n${violations.join("\n")}`);
});

test("skill explicitly says its benchmark is not project evidence", () => {
  const skill = readFileSync(skillFile, "utf8");
  const explicitRule =
    /(?:benchmark[^.\n]{0,180}(?:is\s+not|never)[^.\n]{0,120}(?:project\s+)?evidence|never[^.\n]{0,180}(?:treat|use)[^.\n]{0,120}benchmark[^.\n]{0,120}(?:as\s+)?evidence)/i;

  assert.match(skill, explicitRule);
});

test("npm pack contains only the renamed skill contract", () => {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npm, ["pack", "--dry-run", "--json"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);

  const packResult = JSON.parse(result.stdout);
  assert.equal(packResult.length, 1);
  assert.equal(packResult[0].name, "write-complete-project-readme");

  const packagePaths = packResult[0].files.map(({ path }) => portablePath(path));
  const expectedPaths = [
    "LICENSE",
    "package.json",
    "bin/write-complete-project-readme.js",
    "skills/write-complete-project-readme/SKILL.md",
    "skills/write-complete-project-readme/agents/openai.yaml",
    "skills/write-complete-project-readme/references/quality-standard.md",
    "skills/write-complete-project-readme/references/ramadan-clock-standard.md",
    "skills/write-complete-project-readme/scripts/check-readme.mjs",
  ];

  for (const expectedPath of expectedPaths) {
    assert.equal(packagePaths.includes(expectedPath), true, `${expectedPath} is missing from npm pack`);
  }

  for (const packagePath of packagePaths) {
    const normalized = packagePath.toLowerCase();
    for (const excludedPath of excludedPackagePaths) {
      assert.equal(
        normalized.includes(excludedPath.toLowerCase()),
        false,
        `excluded path is present in npm pack: ${packagePath}`,
      );
    }
  }
});
