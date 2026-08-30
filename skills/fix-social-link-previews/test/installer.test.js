import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const exec = promisify(execFile);
const bin = path.resolve("bin/fix-social-link-previews.js");

test("installs, refuses replacement, and supports force", async () => {
  const temp = await fs.mkdtemp(
    path.join(os.tmpdir(), "fix-social-link-previews-"),
  );
  try {
    await exec(process.execPath, [bin, "--target", "codex", "--path", temp]);
    const installed = path.join(temp, "fix-social-link-previews", "SKILL.md");
    assert.match(
      await fs.readFile(installed, "utf8"),
      /name: fix-social-link-previews/,
    );

    await assert.rejects(
      exec(process.execPath, [bin, "--target", "codex", "--path", temp]),
      /already exists/,
    );
    await exec(process.execPath, [
      bin,
      "--target",
      "codex",
      "--path",
      temp,
      "--force",
    ]);
    assert.match(
      await fs.readFile(installed, "utf8"),
      /# Fix Social Link Previews/,
    );
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});

test("dry-run does not create the destination", async () => {
  const temp = await fs.mkdtemp(
    path.join(os.tmpdir(), "fix-social-link-previews-dry-"),
  );
  try {
    const { stdout } = await exec(process.execPath, [
      bin,
      "--target",
      "claude",
      "--path",
      temp,
      "--dry-run",
    ]);
    assert.match(stdout, /\[dry-run\] claude/);
    await assert.rejects(fs.access(path.join(temp, "fix-social-link-previews")));
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});
