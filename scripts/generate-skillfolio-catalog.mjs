#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = join(repositoryRoot, "apps", "skillfolio");
const generatedPath = join(appRoot, "src", "data", "skills.generated.json");
const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function indexUnique(entries, label) {
  const index = new Map();
  for (const entry of entries) {
    if (!entry?.name || typeof entry.name !== "string")
      throw new Error(`${label} entry is missing a name`);
    if (index.has(entry.name))
      throw new Error(`${label} contains duplicate name: ${entry.name}`);
    index.set(entry.name, entry);
  }
  return index;
}

function managedFacts(entry, evidenceProfiles) {
  if (entry.distribution !== "npm" || !entry.package || !entry.version) {
    throw new Error(
      `managed public skill ${entry.name} must have an npm package and version`,
    );
  }
  const repository = entry.repository || entry.legacyRepository;
  if (!repository)
    throw new Error(
      `managed public skill ${entry.name} has no public repository`,
    );
  const hostEvidence = evidenceProfiles?.[entry.evidenceProfile];
  if (!hostEvidence) {
    throw new Error(
      `managed public skill ${entry.name} has no valid evidence profile`,
    );
  }
  return {
    package: entry.package,
    version: entry.version,
    repository,
    branch: entry.branch || "main",
    sourceDirectory: entry.repository ? entry.sourceDirectory : undefined,
    installCommand: `npx --yes --package=${entry.package}@latest ${entry.package} --target codex`,
    hostEvidence,
  };
}

function externalFacts(entry) {
  if (!entry.version || !semverPattern.test(entry.version))
    throw new Error(`external skill ${entry.name} has an invalid version`);
  if (!entry.repository || !entry.branch || !entry.installCommand)
    throw new Error(`external skill ${entry.name} has incomplete source facts`);
  return {
    version: entry.version,
    repository: entry.repository,
    branch: entry.branch,
    sourceDirectory: entry.sourceDirectory,
    installCommand: entry.installCommand,
  };
}

export function buildSkillfolioCatalog(root = repositoryRoot) {
  const catalog = readJson(join(root, "catalog.json"));
  const categories = readJson(
    join(root, "apps", "skillfolio", "src", "data", "categories.json"),
  );
  const presentation = readJson(
    join(root, "apps", "skillfolio", "src", "data", "skill-presentation.json"),
  );
  const external = readJson(
    join(root, "apps", "skillfolio", "src", "data", "external-skills.json"),
  );
  const managedByName = indexUnique(catalog.skills, "catalog.json");
  const categoriesByName = indexUnique(categories, "categories.json");
  const externalByName = indexUnique(external, "external-skills.json");
  const slugs = new Set();

  for (const category of categories) {
    if (!category.definition || typeof category.definition !== "string") {
      throw new Error(`category ${category.name} is missing a definition`);
    }
  }

  const result = presentation.map((entry, index) => {
    if (!entry?.slug || typeof entry.slug !== "string")
      throw new Error(`presentation entry ${index + 1} is missing a slug`);
    if (slugs.has(entry.slug))
      throw new Error(
        `skill presentation contains duplicate slug: ${entry.slug}`,
      );
    slugs.add(entry.slug);
    if (!categoriesByName.has(entry.category)) {
      throw new Error(
        `presentation entry ${entry.slug} uses unknown category ${entry.category}`,
      );
    }
    const source = entry.source;
    if (
      !source ||
      !["managed", "external"].includes(source.kind) ||
      !source.name
    ) {
      throw new Error(`presentation entry ${entry.slug} has an invalid source`);
    }
    const sourceEntry =
      source.kind === "managed"
        ? managedByName.get(source.name)
        : externalByName.get(source.name);
    if (!sourceEntry)
      throw new Error(
        `${entry.slug} references unknown ${source.kind} source ${source.name}`,
      );
    const facts =
      source.kind === "managed"
        ? managedFacts(sourceEntry, catalog.evidenceProfiles)
        : externalFacts(sourceEntry);
    return {
      slug: entry.slug,
      name: entry.name,
      mark: entry.mark,
      category: entry.category,
      status: entry.status,
      version: facts.version,
      featured: entry.featured,
      summary: entry.summary,
      description: entry.description,
      ...(facts.package ? { package: facts.package } : {}),
      repository: facts.repository,
      branch: facts.branch,
      ...(facts.sourceDirectory
        ? { sourceDirectory: facts.sourceDirectory }
        : {}),
      installCommand: facts.installCommand,
      compatibility:
        source.kind === "managed"
          ? facts.hostEvidence.documentedHosts
          : entry.compatibility,
      ...(facts.hostEvidence ? { hostEvidence: facts.hostEvidence } : {}),
      uses: entry.uses,
    };
  });

  if (result.filter((entry) => entry.featured).length !== 1)
    throw new Error(
      "Skillfolio catalog must contain exactly one featured skill",
    );
  const usedCategories = new Set(result.map((entry) => entry.category));
  const unusedCategories = categories
    .filter((category) => !usedCategories.has(category.name))
    .map((category) => category.name);
  if (unusedCategories.length > 0)
    throw new Error(
      `Skillfolio categories are unused: ${unusedCategories.join(", ")}`,
    );
  return result;
}

export function serializeSkillfolioCatalog(root = repositoryRoot) {
  return `${JSON.stringify(buildSkillfolioCatalog(root), null, 2)}\n`;
}

function run() {
  const expected = serializeSkillfolioCatalog();
  if (process.argv.includes("--check")) {
    const actual = existsSync(generatedPath)
      ? readFileSync(generatedPath, "utf8")
      : "";
    if (actual !== expected)
      throw new Error(
        "Skillfolio catalog is stale; run npm run generate:skillfolio-catalog",
      );
    console.log("Skillfolio generated catalog is current.");
    return;
  }
  writeFileSync(generatedPath, expected);
  console.log(
    `Generated ${buildSkillfolioCatalog().length} Skillfolio entries.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    run();
  } catch (error) {
    console.error(`Skillfolio catalog generation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
