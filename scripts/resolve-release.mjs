#!/usr/bin/env node

import { appendFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function resolveRelease(tag, root = repositoryRoot) {
  const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
  const matches = catalog.skills.filter((entry) => entry.distribution === "npm" && `${entry.package}-v${entry.version}` === tag);
  if (matches.length !== 1) throw new Error(`tag ${tag ?? "<missing>"} must match exactly one <package-name>-v<version> catalog entry`);
  const entry = matches[0];
  const workspace = `skills/${entry.name}`;
  const manifest = JSON.parse(readFileSync(join(root, workspace, "package.json"), "utf8"));
  if (manifest.name !== entry.package || manifest.version !== entry.version) throw new Error(`${workspace}/package.json does not match catalog.json`);
  return { name: entry.package, version: entry.version, workspace, tag };
}

function run() {
  const result = resolveRelease(process.argv[2] || process.env.GITHUB_REF_NAME);
  if (process.env.GITHUB_OUTPUT) {
    for (const [name, value] of Object.entries(result)) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
  console.log(JSON.stringify(result));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    run();
  } catch (error) {
    console.error(`release resolution failed: ${error.message}`);
    process.exitCode = 1;
  }
}
