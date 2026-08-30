#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
const configuration = JSON.parse(readFileSync(join(root, "installer-targets.json"), "utf8"));
const runtime = readFileSync(join(root, "scripts", "package-installer-runtime.mjs"), "utf8");
const check = process.argv.includes("--check");
const errors = [];

if (configuration.schemaVersion !== 1) throw new Error("installer-targets.json must use schemaVersion 1");

for (const [skillName, config] of Object.entries(configuration.packages)) {
  const entry = catalog.skills.find((candidate) => candidate.name === skillName);
  if (!entry || !["npm", "internal"].includes(entry.distribution)) {
    errors.push(`${skillName}: installer configuration requires an npm or internal catalog entry`);
    continue;
  }
  const packageRoot = join(root, "skills", skillName);
  const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  const executable = Object.values(manifest.bin || {})[0];
  if (!executable) {
    errors.push(`${skillName}: package has no executable`);
    continue;
  }
  const wrapper = `#!/usr/bin/env node\n\nimport { runInstaller } from "./installer-runtime.js";\n\nrunInstaller(${JSON.stringify({ skillName, errorStatus: config.errorStatus, legacyNames: config.legacyNames || [], forceMigratesLegacy: Boolean(config.forceMigratesLegacy) }, null, 2)}, import.meta.url);\n`;
  const outputs = new Map([
    [join(packageRoot, "bin", "installer-runtime.js"), runtime],
    [join(packageRoot, executable), wrapper],
  ]);
  for (const [path, expected] of outputs) {
    const actual = existsSync(path) ? readFileSync(path, "utf8") : "";
    if (check) {
      if (actual !== expected) errors.push(`${skillName}: generated installer is stale: ${path.slice(root.length + 1)}`);
    } else {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, expected);
    }
  }
}

const configured = new Set([...Object.keys(configuration.packages), ...Object.keys(configuration.compatibilityExceptions || {})]);
for (const entry of catalog.skills.filter((candidate) => ["npm", "internal"].includes(candidate.distribution))) {
  if (!configured.has(entry.name)) errors.push(`${entry.name}: packaged skill has no installer configuration or compatibility exception`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${check ? "Validated" : "Generated"} ${Object.keys(configuration.packages).length} shared package installers and ${Object.keys(configuration.compatibilityExceptions || {}).length} compatibility exception.`);
}
