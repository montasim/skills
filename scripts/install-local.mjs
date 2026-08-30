#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { isAbsolute, join, parse, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { portableEntries } from "./stage-package-skill.mjs";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

function usage() {
  return `Usage: node scripts/install-local.mjs <skill-name> --path <absolute-skills-root> [--force] [--dry-run]`;
}

function parseArgs(argv) {
  const [name, ...rest] = argv;
  const options = { name, force: false, dryRun: false };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--force") options.force = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--path") options.root = rest[++index];
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`unknown option: ${arg}`);
  }
  return options;
}

function contained(parent, child) {
  const value = relative(resolve(parent), resolve(child));
  return value === "" || (!value.startsWith("..") && !isAbsolute(value));
}

export function installLocal({ name, root, force = false, dryRun = false, sourceRoot = repositoryRoot }) {
  const catalog = JSON.parse(readFileSync(join(sourceRoot, "catalog.json"), "utf8"));
  if (!catalog.skills.some((entry) => entry.name === name)) throw new Error(`unknown skill: ${name}`);
  if (!root || !isAbsolute(root)) throw new Error("--path must be an absolute skills root");
  if (resolve(root) === parse(resolve(root)).root) throw new Error("refusing to use the filesystem root as a skills root");

  const source = join(sourceRoot, "skills", name);
  const destination = join(resolve(root), name);
  if (!existsSync(join(source, "SKILL.md"))) throw new Error(`skill source is missing: ${source}`);
  if (contained(source, destination) || contained(destination, source)) throw new Error("destination overlaps the skill source");

  if (existsSync(destination)) {
    const state = lstatSync(destination);
    if (state.isSymbolicLink() || !state.isDirectory()) throw new Error(`refusing unsafe destination: ${destination}`);
    if (!force) throw new Error(`destination exists; use --force to replace it: ${destination}`);
  }
  if (dryRun) return destination;

  mkdirSync(resolve(root), { recursive: true });
  const token = `${process.pid}-${Date.now()}`;
  const stage = join(resolve(root), `.${name}.stage-${token}`);
  const backup = join(resolve(root), `.${name}.backup-${token}`);
  mkdirSync(stage);
  try {
    for (const entry of portableEntries) {
      const value = join(source, entry);
      if (existsSync(value)) cpSync(value, join(stage, entry), { recursive: true, errorOnExist: true });
    }
    if (existsSync(destination)) renameSync(destination, backup);
    renameSync(stage, destination);
    if (existsSync(backup)) rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    if (existsSync(stage)) rmSync(stage, { recursive: true, force: true });
    if (!existsSync(destination) && existsSync(backup)) renameSync(backup, destination);
    throw error;
  }
  return destination;
}

function run() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) console.log(usage());
    else {
      const destination = installLocal(options);
      console.log(`${options.dryRun ? "Would install" : "Installed"} ${options.name}: ${destination}`);
    }
  } catch (error) {
    console.error(`install-local: ${error.message}`);
    console.error(usage());
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) run();
