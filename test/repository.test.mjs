import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { installLocal } from "../scripts/install-local.mjs";
import { resolveRelease } from "../scripts/resolve-release.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));

test("catalog covers each direct skill directory", () => {
  const directories = readdirSync(join(root, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(catalog.skills.map((entry) => entry.name).sort(), directories);
  for (const name of directories) assert.equal(existsSync(join(root, "skills", name, "SKILL.md")), true);
});

test("namespaced release tags resolve one npm workspace", () => {
  assert.deepEqual(resolveRelease("fix-social-link-previews-v0.3.1", root), {
    name: "fix-social-link-previews",
    version: "0.3.1",
    workspace: "skills/fix-social-link-previews",
    tag: "fix-social-link-previews-v0.3.1",
  });
  assert.throws(() => resolveRelease("v0.1.0", root), /exactly one/);
  assert.deepEqual(resolveRelease("deploy-prebuilt-app-to-netlify-v0.1.1", root), {
    name: "deploy-prebuilt-app-to-netlify",
    version: "0.1.1",
    workspace: "skills/deploy-prebuilt-app-to-netlify",
    tag: "deploy-prebuilt-app-to-netlify-v0.1.1",
  });
  assert.deepEqual(resolveRelease("update-skillfolio-catalog-v0.1.1", root), {
    name: "update-skillfolio-catalog",
    version: "0.1.1",
    workspace: "skills/update-skillfolio-catalog",
    tag: "update-skillfolio-catalog-v0.1.1",
  });
  assert.deepEqual(resolveRelease("integrate-supportkori-widget-v0.1.1", root), {
    name: "integrate-supportkori-widget",
    version: "0.1.1",
    workspace: "skills/integrate-supportkori-widget",
    tag: "integrate-supportkori-widget-v0.1.1",
  });
});

test("local installer copies only portable skill resources", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "skills-install-test-"));
  try {
    const destination = installLocal({ name: "find-ui-inconsistencies", root: temporary, sourceRoot: root });
    assert.equal(existsSync(join(destination, "SKILL.md")), true);
    assert.equal(existsSync(join(destination, "agents", "openai.yaml")), true);
    assert.equal(existsSync(join(destination, "package.json")), false);
    assert.equal(existsSync(join(destination, "bin")), false);
    assert.throws(() => installLocal({ name: "find-ui-inconsistencies", root: temporary, sourceRoot: root }), /--force/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("release workflow uses namespaced tags and trusted publishing", () => {
  const workflow = readFileSync(join(root, ".github", "workflows", "publish.yml"), "utf8");
  assert.match(workflow, /tags:\s*\n\s*- ['"]\*-v\*['"]/);
  assert.match(workflow, /node scripts\/resolve-release\.mjs/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /npm publish --workspace/);
  assert.match(workflow, /npm view --prefer-online/);
  assert.match(workflow, /steps\.registry\.outputs\.published/);
  assert.match(workflow, /gh release create/);
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN/);
});
