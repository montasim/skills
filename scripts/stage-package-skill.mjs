#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const portableEntries = ["SKILL.md", "agents", "assets", "references", "scripts"];

function markerPath(packageRoot, name) {
  return join(packageRoot, ".monorepo-stage-owners.json");
}

function readOwners(marker) {
  if (!existsSync(marker)) return [];
  const value = JSON.parse(readFileSync(marker, "utf8"));
  return Array.isArray(value.owners) ? value.owners : [];
}

function writeOwners(marker, owners) {
  writeFileSync(marker, `${JSON.stringify({ owners: [...new Set(owners)].sort() }, null, 2)}\n`);
}

export function stagePackageSkill(packageRoot, name, owner) {
  const root = resolve(packageRoot);
  const skillPath = join(root, "SKILL.md");
  if (!existsSync(skillPath)) throw new Error(`${name} is missing SKILL.md`);
  const skill = readFileSync(skillPath, "utf8");
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`^name:\\s*${escapedName}\\s*$`, "m").test(skill)) {
    throw new Error(`SKILL.md frontmatter does not match ${name}`);
  }

  const destination = join(root, "skills", name);
  const marker = markerPath(root, name);
  if (existsSync(destination)) {
    if (!existsSync(marker)) throw new Error(`refusing to replace unmanaged package staging directory: ${destination}`);
    const owners = readOwners(marker);
    if (owners.length === 1 && owners[0] === owner) {
      rmSync(destination, { recursive: true, force: true });
    } else {
      writeOwners(marker, [...owners, owner]);
      return destination;
    }
  }

  const temporary = join(root, `.skill-stage-${process.pid}-${Date.now()}`);
  mkdirSync(temporary, { recursive: false });
  try {
    for (const entry of portableEntries) {
      const source = join(root, entry);
      if (existsSync(source)) cpSync(source, join(temporary, entry), { recursive: true, errorOnExist: true });
    }
    mkdirSync(dirname(destination), { recursive: true });
    renameSync(temporary, destination);
    writeOwners(marker, [owner]);
  } catch (error) {
    rmSync(temporary, { recursive: true, force: true });
    if (existsSync(destination) && !existsSync(marker)) rmSync(destination, { recursive: true, force: true });
    throw error;
  }
  return destination;
}

export function cleanPackageSkill(packageRoot, name, owner) {
  const root = resolve(packageRoot);
  const destination = join(root, "skills", name);
  const marker = markerPath(root, name);
  if (!existsSync(destination)) return;
  if (!existsSync(marker)) throw new Error(`refusing to remove unmanaged package staging directory: ${destination}`);

  const owners = readOwners(marker).filter((value) => value !== owner);
  if (owners.length > 0) {
    writeOwners(marker, owners);
    return;
  }

  rmSync(destination, { recursive: true, force: true });
  rmSync(marker, { force: true });
  const parent = dirname(destination);
  if (existsSync(parent) && readdirSync(parent).length === 0) rmdirSync(parent);
}

function run() {
  const [action, name, owner = "manual"] = process.argv.slice(2);
  if (!name || !["stage", "clean"].includes(action)) {
    throw new Error("usage: stage-package-skill.mjs <stage|clean> <package-name> [owner]");
  }
  if (action === "stage") stagePackageSkill(process.cwd(), name, owner);
  else cleanPackageSkill(process.cwd(), name, owner);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    run();
  } catch (error) {
    console.error(`package skill staging failed: ${error.message}`);
    process.exitCode = 1;
  }
}
