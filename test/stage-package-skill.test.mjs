import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  cleanPackageSkill,
  stagePackageSkill,
} from "../scripts/stage-package-skill.mjs";

test("a repeated owner refreshes stale package staging after an interrupted lifecycle", async () => {
  const root = await mkdtemp(join(tmpdir(), "skill-stage-refresh-"));
  try {
    writeFileSync(
      join(root, "SKILL.md"),
      "---\nname: example-skill\ndescription: Example.\n---\n\n# Example\n",
    );
    mkdirSync(join(root, "scripts"));
    writeFileSync(join(root, "scripts", "check.txt"), "first\n");

    const destination = stagePackageSkill(root, "example-skill", "test");
    assert.equal(
      readFileSync(join(destination, "scripts", "check.txt"), "utf8"),
      "first\n",
    );

    writeFileSync(join(root, "scripts", "check.txt"), "second\n");
    stagePackageSkill(root, "example-skill", "test");
    assert.equal(
      readFileSync(join(destination, "scripts", "check.txt"), "utf8"),
      "second\n",
    );

    cleanPackageSkill(root, "example-skill", "test");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
