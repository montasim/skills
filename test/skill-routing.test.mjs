import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
const fixtures = JSON.parse(readFileSync(join(root, "test", "fixtures", "skill-routing.json"), "utf8"));
const names = catalog.skills.map((entry) => entry.name).sort();

test("routing fixtures cover every canonical skill and decision branch", () => {
  assert.equal(fixtures.schemaVersion, 1);
  assert.deepEqual(Object.keys(fixtures.skills).sort(), names);
  const prompts = new Set();

  for (const [name, cases] of Object.entries(fixtures.skills)) {
    for (const key of ["positive", "authorization", "unavailableTool"]) {
      assert.equal(typeof cases[key], "string", `${name}.${key}`);
      assert.ok(cases[key].length >= 24, `${name}.${key} is too weak to be a useful fixture`);
      assert.equal(prompts.has(cases[key]), false, `${name}.${key} duplicates another prompt`);
      prompts.add(cases[key]);
    }
    assert.equal(typeof cases.negative?.prompt, "string", `${name}.negative.prompt`);
    assert.ok(cases.negative.routeTo === null || names.includes(cases.negative.routeTo), `${name}.negative.routeTo`);
    assert.equal(typeof cases.ambiguous?.prompt, "string", `${name}.ambiguous.prompt`);
    assert.ok(Array.isArray(cases.ambiguous.allowed) && cases.ambiguous.allowed.includes(name), `${name}.ambiguous.allowed`);
    assert.ok(cases.ambiguous.allowed.every((candidate) => names.includes(candidate)), `${name}.ambiguous has an unknown route`);
  }
});

test("frontmatter descriptions stay provider-neutral and within the discovery budget", () => {
  for (const name of names) {
    const skill = readFileSync(join(root, "skills", name, "SKILL.md"), "utf8");
    const description = skill.match(/^description:\s*(.+)$/m)?.[1];
    assert.ok(description, `${name} has no description`);
    assert.ok(description.length <= 250, `${name} description is ${description.length} characters`);
    assert.doesNotMatch(description, /\b(?:Codex|Claude(?: Code)?|Gemini|Antigravity|ZCode)\b/, name);
  }
});

test("known overlapping skills route to their narrower neighbor", () => {
  const expected = {
    "publish-verified-github-release": "verify-github-npm-release",
    "deploy-prebuilt-app-to-netlify": "make-app-netlify-ready",
    "make-project-github-ready": "fix-project-metadata-mismatches",
    "fix-project-metadata-mismatches": "make-project-github-ready",
    "verify-github-npm-release": "publish-verified-github-release",
  };
  for (const [name, routeTo] of Object.entries(expected)) {
    assert.equal(fixtures.skills[name].negative.routeTo, routeTo);
  }
});
