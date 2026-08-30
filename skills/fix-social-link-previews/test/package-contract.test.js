import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const skillDirectory = path.resolve("skills/fix-social-link-previews");

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  assert(match, "SKILL.md must start with YAML frontmatter");

  return Object.fromEntries(
    match[1].split("\n").map((line) => {
      const separator = line.indexOf(":");
      assert(separator > 0, `Invalid frontmatter line: ${line}`);
      return [line.slice(0, separator), line.slice(separator + 1).trim()];
    }),
  );
}

test("package exposes the installer and portable skill", async () => {
  const pkg = JSON.parse(await fs.readFile("package.json", "utf8"));
  assert.equal(pkg.name, "fix-social-link-previews");
  assert.equal(
    pkg.bin["fix-social-link-previews"],
    "bin/fix-social-link-previews.js",
  );
  assert.deepEqual(pkg.files, ["bin/", "skills/"]);

  const skill = await fs.readFile(
    "skills/fix-social-link-previews/SKILL.md",
    "utf8",
  );
  assert.match(skill, /^---\nname: fix-social-link-previews\n/);
  assert(!skill.includes("TODO"));

  const metadata = await fs.readFile(
    "skills/fix-social-link-previews/agents/openai.yaml",
    "utf8",
  );
  assert.match(metadata, /\$fix-social-link-previews/);
});

test("skill follows the portable Agent Skills contract", async () => {
  const skillPath = path.join(skillDirectory, "SKILL.md");
  const skill = await fs.readFile(skillPath, "utf8");
  const frontmatter = parseFrontmatter(skill);

  assert.deepEqual(Object.keys(frontmatter).sort(), ["description", "license", "name"]);
  assert.equal(frontmatter.name, path.basename(skillDirectory));
  assert.match(frontmatter.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(frontmatter.name.length <= 64);
  assert(frontmatter.description.length > 0);
  assert(frontmatter.description.length <= 1024);
  assert.match(frontmatter.description, /Use (?:when|for) /);
  assert.equal(frontmatter.license, "MIT");
  assert(skill.split("\n").length <= 500);

  const referencedFiles = [
    "references/social-preview-standard.md",
    "references/framework-patterns.md",
    "scripts/check-social-preview.mjs",
  ];
  for (const relativePath of referencedFiles) {
    await fs.access(path.join(skillDirectory, relativePath));
  }

  assert.match(skill, /Node\.js 18 or newer/);
});
