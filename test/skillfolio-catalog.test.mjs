import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildSkillfolioCatalog,
  serializeSkillfolioCatalog,
} from "../scripts/generate-skillfolio-catalog.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

test("Skillfolio derives managed release facts from the root catalog", () => {
  const catalog = buildSkillfolioCatalog(root);
  const readme = catalog.find((entry) => entry.slug === "write-complete-project-readme");
  const social = catalog.find(
    (entry) => entry.slug === "fix-social-link-previews",
  );

  assert.equal(readme.version, "0.4.0");
  assert.equal(readme.package, "write-complete-project-readme");
  assert.equal(
    readme.installCommand,
    "npx --yes --package=write-complete-project-readme@latest write-complete-project-readme --target codex",
  );
  assert.equal(social.version, "0.3.0");
  assert.equal(readme.hostEvidence.format, "Agent Skills structure validated");
  assert.deepEqual(readme.hostEvidence.runtimeVerified, ["OpenAI Codex"]);
  assert.deepEqual(readme.compatibility, readme.hostEvidence.documentedHosts);
  assert.equal(catalog.filter((entry) => entry.featured).length, 1);
});

test("Skillfolio keeps external skills and includes every public managed skill", () => {
  const names = buildSkillfolioCatalog(root).map((entry) => entry.slug);

  assert.equal(names.includes("contractguard"), true);
  assert.equal(names.includes("docs-watch"), true);
  assert.equal(names.includes("integrate-supportkori-widget"), true);
  assert.equal(names.includes("deploy-prebuilt-app-to-netlify"), true);
  assert.equal(names.includes("update-skillfolio-catalog"), true);
  assert.equal(names.includes("build-android-app-from-web"), true);
  assert.equal(names.length, 15);
});

test("Skillfolio assigns every published skill to its primary outcome category", () => {
  const categories = Object.fromEntries(
    buildSkillfolioCatalog(root).map((entry) => [entry.slug, entry.category]),
  );

  assert.deepEqual(categories, {
    "build-android-app-from-web": "Mobile Development",
    "write-complete-project-readme": "Documentation",
    "fix-social-link-previews": "Web Visibility",
    "fix-project-metadata-mismatches": "Repository Management",
    "publish-verified-github-release": "Release Engineering",
    contractguard: "API Quality",
    "docs-watch": "Documentation",
    "verify-github-npm-release": "Release Engineering",
    "make-project-github-ready": "Repository Management",
    "make-app-netlify-ready": "Deployment",
    "deploy-prebuilt-app-to-netlify": "Deployment",
    "find-ui-inconsistencies": "Frontend Quality",
    "integrate-supportkori-widget": "Frontend Quality",
    "release-agent-skill": "Release Engineering",
    "update-skillfolio-catalog": "Repository Management",
  });
});

test("committed runtime catalog matches its authorities", () => {
  const generated = readFileSync(
    new URL(
      "../apps/skillfolio/src/data/skills.generated.json",
      import.meta.url,
    ),
    "utf8",
  );
  assert.equal(generated, serializeSkillfolioCatalog(root));
});

test("Netlify separates repository base selection from app-local build settings", () => {
  const repositoryConfig = readFileSync(
    new URL("../netlify.toml", import.meta.url),
    "utf8",
  );
  const applicationConfig = readFileSync(
    new URL("../apps/skillfolio/netlify.toml", import.meta.url),
    "utf8",
  );

  assert.match(repositoryConfig, /base\s*=\s*"apps\/skillfolio"/);
  assert.doesNotMatch(repositoryConfig, /command\s*=/);
  assert.doesNotMatch(repositoryConfig, /publish\s*=/);
  assert.match(applicationConfig, /base\s*=\s*"\."/);
  assert.match(applicationConfig, /command\s*=\s*"pnpm run build"/);
  assert.match(applicationConfig, /publish\s*=\s*"dist\/client"/);
});

test("Skillfolio project links target the central repository", () => {
  const applicationPackage = JSON.parse(
    readFileSync(
      new URL("../apps/skillfolio/package.json", import.meta.url),
      "utf8",
    ),
  );
  const siteHeader = readFileSync(
    new URL(
      "../apps/skillfolio/src/components/site-header.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.deepEqual(applicationPackage.repository, {
    type: "git",
    url: "git+https://github.com/montasim/skills.git",
    directory: "apps/skillfolio",
  });
  assert.equal(
    applicationPackage.bugs.url,
    "https://github.com/montasim/skills/issues",
  );
  assert.match(siteHeader, /https:\/\/github\.com\/montasim\/skills/);
  assert.doesNotMatch(siteHeader, /montasim\/Skillfoliox/);
});
