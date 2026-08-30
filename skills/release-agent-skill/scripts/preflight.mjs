#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: preflight.mjs [project-root] [--json]

Run structural and local metadata checks for a standalone or packaged Agent Skill.
This command does not determine release readiness or query external services.`);
  process.exit(0);
}
const json = args.includes("--json");
const positional = args.filter((arg) => arg !== "--json");

if (positional.length > 1 || positional[0]?.startsWith("-")) {
  console.error("Usage: preflight.mjs [project-root] [--json]");
  process.exit(2);
}

const root = resolve(positional[0] ?? ".");
const findings = [];
const skills = [];

function finding(severity, code, message, path) {
  findings.push({ severity, code, message, ...(path ? { path } : {}) });
}

function frontmatter(file) {
  const source = readFileSync(file, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/);
    if (field) result[field[1]] = field[2].replace(/^['"]|['"]$/g, "").trim();
  }
  return result;
}

function inspectSkill(directory) {
  const file = join(directory, "SKILL.md");
  const relative = directory.slice(root.length + (directory === root ? 0 : 1)) || ".";
  const metadata = frontmatter(file);
  const directoryName = basename(directory);

  if (!metadata.name) finding("error", "missing-name", "SKILL.md frontmatter has no name", file);
  else {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name)) {
      finding("error", "invalid-name", `Invalid skill name: ${metadata.name}`, file);
    }
    if (metadata.name !== directoryName) {
      finding("error", "name-directory-mismatch", `Skill name ${metadata.name} does not match directory ${directoryName}`, file);
    }
  }
  if (!metadata.description) finding("error", "missing-description", "SKILL.md frontmatter has no description", file);
  else if (metadata.description.length > 1024) {
    finding("error", "description-too-long", "Skill description exceeds 1024 characters", file);
  }

  const source = readFileSync(file, "utf8");
  for (const reference of source.matchAll(/\]\((references\/[^)#]+|scripts\/[^)#]+|assets\/[^)#]+)\)/g)) {
    const target = join(directory, reference[1]);
    if (!existsSync(target)) finding("error", "missing-resource", `Referenced resource does not exist: ${reference[1]}`, file);
  }
  if (/\bTODO\b|\[TODO/i.test(source)) finding("error", "placeholder", "SKILL.md contains a TODO placeholder", file);
  if (source.split(/\r?\n/).length > 500) finding("warning", "long-skill", "SKILL.md exceeds the recommended 500 lines", file);

  skills.push({ directory: relative, name: metadata.name, descriptionLength: metadata.description?.length ?? 0 });
}

function findPackagedSkills(directory, depth = 0) {
  if (depth > 4) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || [".git", "node_modules", "dist", "build"].includes(entry.name)) continue;
    const candidate = join(directory, entry.name);
    if (existsSync(join(candidate, "SKILL.md"))) inspectSkill(candidate);
    else findPackagedSkills(candidate, depth + 1);
  }
}

function git(args) {
  return spawnSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true });
}

if (!existsSync(root)) {
  console.error(`preflight: project root does not exist: ${root}`);
  process.exit(2);
}

if (existsSync(join(root, "SKILL.md"))) inspectSkill(root);
const packagedSkills = join(root, "skills");
if (existsSync(packagedSkills)) {
  findPackagedSkills(packagedSkills);
}

if (skills.length === 0) finding("error", "no-skills", "No SKILL.md found at the root or one level below skills/");

const packagePath = join(root, "package.json");
let packageInfo;
if (existsSync(packagePath)) {
  try {
    const manifest = JSON.parse(readFileSync(packagePath, "utf8"));
    packageInfo = { name: manifest.name, version: manifest.version };
    if (!manifest.name) finding("error", "package-name", "package.json has no name", packagePath);
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version ?? "")) {
      finding("error", "package-version", "package.json version is not valid SemVer", packagePath);
    }
    if (!manifest.repository) finding("warning", "package-repository", "package.json has no repository field", packagePath);

    const lockPath = join(root, "package-lock.json");
    if (existsSync(lockPath)) {
      try {
        const lock = JSON.parse(readFileSync(lockPath, "utf8"));
        const lockRoot = lock.packages?.[""] ?? lock;
        if (lockRoot.name && manifest.name && lockRoot.name !== manifest.name) {
          finding("error", "lock-name", `package-lock root name ${lockRoot.name} does not match ${manifest.name}`, lockPath);
        }
        if (lockRoot.version && manifest.version && lockRoot.version !== manifest.version) {
          finding("error", "lock-version", `package-lock root version ${lockRoot.version} does not match ${manifest.version}`, lockPath);
        }
      } catch (error) {
        finding("error", "package-lock", `Cannot parse package-lock.json: ${error.message}`, lockPath);
      }
    }

    const insideGit = git(["rev-parse", "--is-inside-work-tree"]);
    if (insideGit.status === 0) {
      const status = git(["status", "--porcelain"]);
      if (status.status === 0 && status.stdout.trim()) {
        finding("warning", "dirty-worktree", "Git working tree has uncommitted changes");
      }
      if (manifest.version) {
        const tag = git(["rev-parse", "--verify", `refs/tags/v${manifest.version}`]);
        if (tag.status === 0) {
          finding("warning", "version-tag-exists", `Local tag v${manifest.version} already exists; verify registry and release state before shipping`);
        }
      }
    }
  } catch (error) {
    finding("error", "package-json", `Cannot parse package.json: ${error.message}`, packagePath);
  }
}

const result = {
  root,
  scope: "structural-and-local-metadata",
  structuralOk: !findings.some((item) => item.severity === "error"),
  releaseReady: null,
  skills,
  ...(packageInfo ? { package: packageInfo } : {}),
  findings,
  notChecked: [
    "project tests and builds",
    "package archive contents and clean consumer installation",
    "npm version availability and dist-tags",
    "GitHub remote synchronization, releases, and CI",
    "external skill catalogs",
  ],
};

if (json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Agent Skill structural/local preflight: ${result.structuralOk ? "PASS" : "FAIL"}`);
  console.log(`Skills found: ${skills.length}`);
  for (const skill of skills) console.log(`- ${skill.name ?? "(unnamed)"} (${skill.directory})`);
  for (const item of findings) console.log(`${item.severity.toUpperCase()} ${item.code}: ${item.message}`);
  console.log("Release readiness: NOT DETERMINED (external, test, and archive gates were not run)");
}

process.exit(result.structuralOk ? 0 : 1);
