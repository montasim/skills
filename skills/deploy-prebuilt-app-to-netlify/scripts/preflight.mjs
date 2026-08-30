#!/usr/bin/env node

import { existsSync, lstatSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, parse, relative, resolve } from "node:path";
import process from "node:process";

const usage = `Usage: preflight.mjs [project-root] --publish <directory> [--functions <directory>] [--json]

Inspect local Netlify upload artifacts without authenticating or uploading.`;

function parseArgs(argv) {
  const options = { root: ".", json: false };
  let hasRoot = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--json") options.json = true;
    else if (argument === "--publish" || argument === "--functions") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) throw new Error(`${argument} requires a value`);
      options[argument.slice(2)] = value;
      index += 1;
    } else if (argument.startsWith("-")) throw new Error(`unknown option: ${argument}`);
    else if (hasRoot) throw new Error("expected at most one project-root argument");
    else {
      options.root = argument;
      hasRoot = true;
    }
  }
  if (!options.publish) throw new Error("--publish is required");
  return options;
}

function contained(parent, child) {
  const value = relative(resolve(parent), resolve(child));
  return value === "" || (!value.startsWith("..") && !isAbsolute(value));
}

function entries(directory, depth = 0) {
  if (depth > 5) return [];
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    result.push(path);
    if (entry.isDirectory() && !entry.isSymbolicLink()) result.push(...entries(path, depth + 1));
  }
  return result;
}

function inspectDirectory(path, label, projectRoot, findings) {
  if (!existsSync(path)) {
    findings.push({ severity: "error", code: `missing-${label}`, message: `${label} directory does not exist`, path });
    return [];
  }
  const state = lstatSync(path);
  if (state.isSymbolicLink() || !state.isDirectory()) {
    findings.push({ severity: "error", code: `unsafe-${label}`, message: `${label} must be a regular directory`, path });
    return [];
  }
  if (resolve(path) === parse(resolve(path)).root || resolve(path) === resolve(homedir()) || resolve(path) === resolve(projectRoot)) {
    findings.push({ severity: "error", code: `broad-${label}`, message: `${label} resolves to an unsafe broad directory`, path });
    return [];
  }
  if (!contained(projectRoot, path)) {
    findings.push({ severity: "error", code: `outside-project-${label}`, message: `${label} is outside the project root`, path });
    return [];
  }
  const content = entries(path);
  if (content.length === 0) findings.push({ severity: "error", code: `empty-${label}`, message: `${label} directory is empty`, path });
  for (const item of content) {
    const name = item.slice(item.lastIndexOf("/") + 1);
    if (name === ".env" || name.startsWith(".env.")) {
      findings.push({ severity: "error", code: "secret-file", message: "upload artifacts contain an environment file", path: item });
    }
  }
  return content;
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(`preflight: ${error.message}`);
  console.error(usage);
  process.exit(2);
}
if (options.help) {
  console.log(usage);
  process.exit(0);
}

const root = resolve(options.root);
if (!existsSync(root) || !lstatSync(root).isDirectory()) {
  console.error(`preflight: project root is not a directory: ${root}`);
  process.exit(2);
}
const publish = resolve(root, options.publish);
const functions = options.functions ? resolve(root, options.functions) : null;
const findings = [];
const publishEntries = inspectDirectory(publish, "publish", root, findings);
const functionEntries = functions ? inspectDirectory(functions, "functions", root, findings) : [];
const hasEntry = publishEntries.some((path) => /(?:^|\/)(?:index\.html|server\.mjs|server\.js)$/.test(path));
if (publishEntries.length > 0 && !hasEntry && functionEntries.length === 0) {
  findings.push({ severity: "warning", code: "entry-artifact-unconfirmed", message: "publish output has no index.html or server entry; confirm the framework output contract", path: publish });
}

const result = {
  root,
  publish,
  functions,
  safeToUpload: !findings.some((finding) => finding.severity === "error"),
  findings,
  notChecked: [
    "artifact freshness",
    "framework runtime correctness",
    "Netlify authentication and site linkage",
    "remote deploy behavior and public routes"
  ]
};

if (options.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Netlify artifact preflight: ${result.safeToUpload ? "PASS" : "FAIL"}`);
  console.log(`Publish: ${publish}`);
  if (functions) console.log(`Functions: ${functions}`);
  for (const finding of findings) console.log(`${finding.severity.toUpperCase()} ${finding.code}: ${finding.message}`);
}
process.exit(result.safeToUpload ? 0 : 1);
