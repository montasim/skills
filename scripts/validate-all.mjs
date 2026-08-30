#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
const errors = [];
const allowedFrontmatterFields = new Set([
  "name",
  "description",
  "license",
  "metadata",
  "allowed-tools",
]);

function scalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  return trimmed;
}

function parseFrontmatter(content, name) {
  const normalized = content.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    errors.push(`${name}: SKILL.md must start with YAML frontmatter`);
    return { fields: new Map(), body: normalized };
  }
  const end = normalized.indexOf("\n---\n", 4);
  if (end < 0) {
    errors.push(`${name}: SKILL.md frontmatter is not closed`);
    return { fields: new Map(), body: "" };
  }
  const fields = new Map();
  for (const [index, line] of normalized.slice(4, end).split("\n").entries()) {
    if (!line.trim() || /^\s/.test(line)) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))$/);
    if (!match) {
      errors.push(`${name}: invalid top-level frontmatter at line ${index + 2}`);
      continue;
    }
    const [, key, rawValue] = match;
    if (fields.has(key)) errors.push(`${name}: duplicate frontmatter field ${key}`);
    fields.set(key, scalar(rawValue));
    if (!allowedFrontmatterFields.has(key)) errors.push(`${name}: unsupported frontmatter field ${key}`);
  }
  return { fields, body: normalized.slice(end + 5) };
}

function checkResourceLinks(skillRoot, skill, name) {
  const links = [...skill.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1].trim());
  for (const rawTarget of links) {
    const withoutTitle = rawTarget.replace(/^<|>$/g, "").split(/\s+["']/)[0];
    const target = withoutTitle.split(/[?#]/, 1)[0];
    if (!target || /^(?:[a-z]+:|#|\/)/i.test(target)) continue;
    const resolvedTarget = resolve(skillRoot, target);
    if (!resolvedTarget.startsWith(`${resolve(skillRoot)}/`) || !existsSync(resolvedTarget)) {
      errors.push(`${name}: referenced resource does not exist: ${target}`);
    }
  }
}

if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.skills)) errors.push("catalog.json must contain schemaVersion 1 and a skills array");
if (!Array.isArray(catalog.applications)) errors.push("catalog.json must contain an applications array");
if (!catalog.evidenceProfiles || typeof catalog.evidenceProfiles !== "object" || Array.isArray(catalog.evidenceProfiles)) {
  errors.push("catalog.json must contain evidenceProfiles");
} else {
  const today = Date.now();
  for (const [name, profile] of Object.entries(catalog.evidenceProfiles)) {
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      errors.push(`evidence profile ${name} must be an object`);
      continue;
    }
    const audited = /^\d{4}-\d{2}-\d{2}$/.test(profile.auditedOn || "")
      ? Date.parse(`${profile.auditedOn}T00:00:00Z`)
      : Number.NaN;
    if (!Number.isFinite(audited)) errors.push(`evidence profile ${name} has an invalid auditedOn date`);
    else {
      const ageDays = Math.floor((today - audited) / 86_400_000);
      if (ageDays < 0) errors.push(`evidence profile ${name} is dated in the future`);
      if (ageDays > 120) errors.push(`evidence profile ${name} is stale; re-audit documented host paths and claims`);
    }
    if (typeof profile.format !== "string" || !profile.format.trim()) errors.push(`evidence profile ${name} is missing format evidence`);
    for (const field of ["documentedHosts", "installerTested", "runtimeVerified"]) {
      if (!Array.isArray(profile[field]) || profile[field].length === 0 || profile[field].some((host) => typeof host !== "string" || !host.trim())) {
        errors.push(`evidence profile ${name} has an invalid ${field} list`);
      }
    }
    if (Array.isArray(profile.documentedHosts)) {
      const evidencedHosts = [
        ...(Array.isArray(profile.installerTested) ? profile.installerTested : []),
        ...(Array.isArray(profile.runtimeVerified) ? profile.runtimeVerified : []),
      ];
      for (const host of evidencedHosts) {
        if (!profile.documentedHosts.includes(host)) errors.push(`evidence profile ${name} claims un-documented host evidence for ${host}`);
      }
    }
  }
}

const catalogNames = catalog.skills.map((entry) => entry.name);
const packageNames = catalog.skills.filter((entry) => entry.distribution === "npm").map((entry) => entry.package);
const directoryNames = readdirSync(join(root, "skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (new Set(catalogNames).size !== catalogNames.length) errors.push("catalog.json contains duplicate skill names");
if (new Set(packageNames).size !== packageNames.length) errors.push("catalog.json contains duplicate npm package names");
if (JSON.stringify([...catalogNames].sort()) !== JSON.stringify(directoryNames)) errors.push("catalog entries and skills directories do not match");

for (const entry of catalog.skills) {
  const skillRoot = join(root, "skills", entry.name);
  const skillPath = join(skillRoot, "SKILL.md");
  if (!existsSync(skillPath)) {
    errors.push(`${entry.name}: missing SKILL.md`);
    continue;
  }
  const skill = readFileSync(skillPath, "utf8");
  const { fields, body } = parseFrontmatter(skill, entry.name);
  const frontmatterName = fields.get("name");
  const description = fields.get("description");

  if (entry.distribution === "npm" && !catalog.evidenceProfiles?.[entry.evidenceProfile]) {
    errors.push(`${entry.name}: public npm skill must reference a valid evidence profile`);
  }

  if (frontmatterName !== entry.name) errors.push(`${entry.name}: frontmatter name does not match directory`);
  if (typeof frontmatterName !== "string" || frontmatterName.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(frontmatterName)) {
    errors.push(`${entry.name}: name must be lowercase hyphenated text of at most 64 characters`);
  }
  if (!description) errors.push(`${entry.name}: frontmatter description is missing`);
  else {
    if (description.length > 1024) errors.push(`${entry.name}: description exceeds the Agent Skills 1024-character limit`);
    if (description.length > 250) errors.push(`${entry.name}: description exceeds the repository's 250-character discovery budget`);
    if (/\b(?:Codex|Claude(?: Code)?|Gemini|Antigravity|ZCode)\b/.test(description)) {
      errors.push(`${entry.name}: description must route by outcome rather than provider name`);
    }
  }
  if (!body.trim()) errors.push(`${entry.name}: SKILL.md body is empty`);
  if (body.split("\n").length > 500) errors.push(`${entry.name}: SKILL.md body exceeds 500 lines`);
  if ((body.match(/\b[\w'-]+\b/g) || []).length > 5000) errors.push(`${entry.name}: SKILL.md body exceeds 5,000 words`);
  if (fields.get("license") && fields.get("license") !== entry.license) {
    errors.push(`${entry.name}: frontmatter and catalog licenses differ`);
  }
  if (entry.license === "MIT" && fields.get("license") !== "MIT") {
    errors.push(`${entry.name}: MIT skill must declare license in frontmatter`);
  }
  if (entry.license === "UNLICENSED" && fields.has("license")) {
    errors.push(`${entry.name}: unlicensed skill must not declare a license grant`);
  }
  checkResourceLinks(skillRoot, skill, entry.name);

  const openaiPath = join(skillRoot, "agents", "openai.yaml");
  if (!existsSync(openaiPath)) errors.push(`${entry.name}: missing agents/openai.yaml`);
  else if (!readFileSync(openaiPath, "utf8").includes(`$${entry.name}`)) {
    errors.push(`${entry.name}: agents/openai.yaml default prompt must invoke $${entry.name}`);
  }
  if (existsSync(join(skillRoot, "skills"))) errors.push(`${entry.name}: generated nested skills directory must not be committed`);

  const packagePath = join(skillRoot, "package.json");
  if (entry.distribution === "npm" || entry.distribution === "internal") {
    if (!existsSync(packagePath)) {
      errors.push(`${entry.name}: ${entry.distribution} distribution requires package.json`);
      continue;
    }
    const manifest = JSON.parse(readFileSync(packagePath, "utf8"));
    if (manifest.name !== entry.package) errors.push(`${entry.name}: package identity mismatch`);
    if (manifest.version !== entry.version) errors.push(`${entry.name}: package version and catalog version differ`);
    if (manifest.license !== entry.license) errors.push(`${entry.name}: package license and catalog license differ`);
    if (entry.distribution === "npm" && manifest.private === true) errors.push(`${entry.name}: public npm package cannot be private`);
    if (entry.distribution === "internal" && manifest.private !== true) errors.push(`${entry.name}: internal package must set private true`);
    if (entry.distribution === "internal" && manifest.publishConfig) errors.push(`${entry.name}: internal package must not define publishConfig`);
    const expectedHooks = {
      pretest: `node ../../scripts/stage-package-skill.mjs stage ${entry.name} test`,
      posttest: `node ../../scripts/stage-package-skill.mjs clean ${entry.name} test`,
      prepack: `node ../../scripts/stage-package-skill.mjs stage ${entry.name} pack`,
      postpack: `node ../../scripts/stage-package-skill.mjs clean ${entry.name} pack`,
    };
    for (const [name, value] of Object.entries(expectedHooks)) {
      if (manifest.scripts?.[name] !== value) errors.push(`${entry.name}: ${name} must use the shared package staging helper`);
    }
  } else if (existsSync(packagePath)) {
    errors.push(`${entry.name}: source-only catalog entry unexpectedly has package.json`);
  }
  if (entry.license === "MIT" && !existsSync(join(skillRoot, "LICENSE"))) errors.push(`${entry.name}: MIT catalog entry is missing LICENSE`);
  if (entry.license === "UNLICENSED" && existsSync(join(skillRoot, "LICENSE"))) errors.push(`${entry.name}: unlicensed catalog entry unexpectedly contains LICENSE`);
}

for (const application of catalog.applications || []) {
  const applicationRoot = join(root, application.directory || "");
  if (!application.name || !application.directory) errors.push("catalog application entries require name and directory");
  if (!existsSync(join(applicationRoot, "package.json"))) errors.push(`${application.name}: application package.json is missing`);
  if (!existsSync(join(applicationRoot, "pnpm-lock.yaml"))) errors.push(`${application.name}: application pnpm lockfile is missing`);
  if (!existsSync(join(applicationRoot, "netlify.toml"))) errors.push(`${application.name}: application netlify.toml is missing`);
  if (application.license === "UNLICENSED" && existsSync(join(applicationRoot, "LICENSE"))) {
    errors.push(`${application.name}: unlicensed application unexpectedly contains LICENSE`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${catalog.skills.length} skills (${catalog.skills.filter((entry) => entry.distribution === "npm").length} npm packages) and ${catalog.applications.length} application.`);
}
