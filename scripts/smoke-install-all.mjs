#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { installLocal } from "./install-local.mjs";
import { portableEntries } from "./stage-package-skill.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
const temporary = mkdtempSync(join(tmpdir(), "skills-smoke-"));

function filesUnder(directory) {
  const files = [];
  if (!statSync(directory).isDirectory()) return files;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const value = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(value));
    else if (entry.isFile()) files.push(value);
  }
  return files;
}

function portableHashes(skillRoot) {
  const result = {};
  for (const entry of portableEntries) {
    const value = join(skillRoot, entry);
    try {
      if (statSync(value).isFile()) result[entry] = createHash("sha256").update(readFileSync(value)).digest("hex");
      else for (const file of filesUnder(value)) result[relative(skillRoot, file)] = createHash("sha256").update(readFileSync(file)).digest("hex");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return result;
}

try {
  for (const entry of catalog.skills) {
    const destination = installLocal({ name: entry.name, root: temporary, sourceRoot: root });
    const expected = portableHashes(join(root, "skills", entry.name));
    const actual = portableHashes(destination);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${entry.name}: installed portable files differ from source`);
  }
  console.log(`Smoke-installed ${catalog.skills.length} skills with matching portable files.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
