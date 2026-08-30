import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repositoryRoot, "bin", "write-complete-project-readme.js");
const skillSource = join(repositoryRoot, "skills", "write-complete-project-readme");
const skillName = "write-complete-project-readme";
const packageVersion = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8")).version;
const temporaryRoots = [];

after(() => {
  for (const root of temporaryRoots) rmSync(root, { recursive: true, force: true });
});

function temporaryRoot() {
  const root = mkdtempSync(join(tmpdir(), "write-complete-project-readme-test-"));
  temporaryRoots.push(root);
  mkdirSync(join(root, "home"));
  return root;
}

function isolatedEnvironment(root, overrides = {}) {
  return {
    ...process.env,
    HOME: join(root, "home"),
    USERPROFILE: join(root, "home"),
    CODEX_HOME: "",
    CLAUDE_CONFIG_DIR: "",
    NODE_OPTIONS: "",
    PATH: "",
    ...overrides,
  };
}

function run(args = [], { cwd, env, nodeArgs = [] } = {}) {
  return spawnSync(process.execPath, [...nodeArgs, cli, ...args], {
    cwd: cwd ?? repositoryRoot,
    encoding: "utf8",
    env: env ?? process.env,
  });
}

function createInstallation(skillsRoot, name, marker = name) {
  const installation = join(skillsRoot, name);
  mkdirSync(installation, { recursive: true });
  writeFileSync(join(installation, "SKILL.md"), `---\nname: ${name}\ndescription: Test fixture.\n---\n`);
  writeFileSync(join(installation, "marker.txt"), marker);
  return installation;
}

function readMarker(installation) {
  return readFileSync(join(installation, "marker.txt"), "utf8");
}

function assertInstalled(installation) {
  assert.match(readFileSync(join(installation, "SKILL.md"), "utf8"), /^name: write-complete-project-readme$/m);
}

function assertNoTransactions(...skillsRoots) {
  for (const skillsRoot of skillsRoots) {
    const entries = existsSync(skillsRoot) ? readdirSync(skillsRoot) : [];
    assert.deepEqual(
      entries.filter((entry) => entry.startsWith(`.${skillName}-`)),
      [],
      `transaction files remain in ${skillsRoot}`,
    );
  }
}

test("prints the current multi-agent help and package version", () => {
  const help = run(["--help"]);
  const version = run(["--version"]);

  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Install the write-complete-project-readme skill for Codex, Claude Code, or both agents/);
  assert.match(help.stdout, /--target <agent>\s+auto, codex, claude, or both/);
  assert.match(help.stdout, /--scope <scope>\s+user or project/);
  assert.match(help.stdout, /--path cannot be combined with --target both or an explicit --scope/);
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), packageVersion);
});

test("rejects invalid values and repeated custom paths", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const cases = [
    { args: ["--target", "other"], message: /invalid --target other/ },
    { args: ["--scope", "global"], message: /invalid --scope global/ },
    { args: ["--path", "one", "--path", "two"], message: /--path may be specified only once/ },
    { args: ["--target"], message: /--target requires/ },
    { args: ["--scope"], message: /--scope requires/ },
  ];

  for (const entry of cases) {
    const result = run(entry.args, { cwd: root, env });
    assert.equal(result.status, 1);
    assert.match(result.stderr, entry.message);
  }
});

test("reports custom-path conflicts before automatic detection", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const skillsRoot = join(root, "custom-skills");

  const scoped = run(["--path", skillsRoot, "--scope", "user"], { cwd: root, env });
  assert.equal(scoped.status, 1);
  assert.match(scoped.stderr, /--path cannot be combined with --scope/);
  assert.doesNotMatch(scoped.stderr, /auto-detection/);

  const both = run(["--target", "both", "--path", skillsRoot], { cwd: root, env });
  assert.equal(both.status, 1);
  assert.match(both.stderr, /--path cannot be combined with --target both/);
  assert.equal(existsSync(skillsRoot), false);
});

test("installs explicit Codex and Claude Code custom targets with host invocation text", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const codexRoot = join(root, "codex-skills");
  const claudeRoot = join(root, "claude-skills");

  const codex = run(["--target", "codex", "--path", codexRoot], { cwd: root, env });
  const claude = run(["--target", "claude", "--path", claudeRoot], { cwd: root, env });

  assert.equal(codex.status, 0, codex.stderr);
  assert.match(codex.stdout, /Codex: Installed/);
  assert.match(codex.stdout, /\$write-complete-project-readme/);
  assert.doesNotMatch(codex.stdout, /Claude Code: Use \/write-complete-project-readme/);
  assertInstalled(join(codexRoot, skillName));

  assert.equal(claude.status, 0, claude.stderr);
  assert.match(claude.stdout, /Claude Code: Installed/);
  assert.match(claude.stdout, /\/write-complete-project-readme/);
  assert.doesNotMatch(claude.stdout, /Codex: Use \$write-complete-project-readme/);
  assertInstalled(join(claudeRoot, skillName));
  assertNoTransactions(codexRoot, claudeRoot);
});

test("an exact custom path ignores unrelated previous Codex-root installations", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const globalLegacy = createInstallation(join(root, "home", ".codex", "skills"), skillName, "global stays");
  const customRoot = join(root, "custom-skills");

  const result = run(["--target", "codex", "--path", customRoot], { cwd: root, env });

  assert.equal(result.status, 0, result.stderr);
  assertInstalled(join(customRoot, skillName));
  assert.equal(readMarker(globalLegacy), "global stays");
  assertNoTransactions(customRoot, dirname(globalLegacy));
});

test("uses official user roots and honors CLAUDE_CONFIG_DIR", () => {
  const root = temporaryRoot();
  const codexHome = join(root, "legacy-codex-home");
  const claudeConfig = join(root, "claude-config");
  const env = isolatedEnvironment(root, {
    CODEX_HOME: codexHome,
    CLAUDE_CONFIG_DIR: claudeConfig,
  });

  const codex = run(["--target", "codex"], { cwd: root, env });
  const claude = run(["--target", "claude"], { cwd: root, env });

  assert.equal(codex.status, 0, codex.stderr);
  assertInstalled(join(root, "home", ".agents", "skills", skillName));
  assert.equal(existsSync(join(codexHome, "skills", skillName)), false);

  assert.equal(claude.status, 0, claude.stderr);
  assertInstalled(join(claudeConfig, "skills", skillName));
});

test("installs both user targets and prints both invocation forms", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const result = run(["--target", "both"], { cwd: root, env });
  const codexRoot = join(root, "home", ".agents", "skills");
  const claudeRoot = join(root, "home", ".claude", "skills");

  assert.equal(result.status, 0, result.stderr);
  assertInstalled(join(codexRoot, skillName));
  assertInstalled(join(claudeRoot, skillName));
  assert.match(result.stdout, /\$write-complete-project-readme/);
  assert.match(result.stdout, /\/write-complete-project-readme/);
  assertNoTransactions(codexRoot, claudeRoot);
});

test("uses the current directory for project scope outside a Git worktree", () => {
  const root = temporaryRoot();
  const project = join(root, "project");
  mkdirSync(project);
  const env = isolatedEnvironment(root);
  const result = run(["--target", "both", "--scope", "project"], { cwd: project, env });

  assert.equal(result.status, 0, result.stderr);
  assertInstalled(join(project, ".agents", "skills", skillName));
  assertInstalled(join(project, ".claude", "skills", skillName));
});

test("resolves project scope from a nested directory to the Git root", () => {
  const root = temporaryRoot();
  const project = join(root, "repository");
  const nested = join(project, "one", "two");
  mkdirSync(nested, { recursive: true });
  const initialized = spawnSync("git", ["init", "--quiet", project], { encoding: "utf8" });
  assert.equal(initialized.status, 0, initialized.stderr);
  const env = isolatedEnvironment(root, { PATH: process.env.PATH ?? "" });

  const result = run(["--target", "codex", "--scope", "project"], { cwd: nested, env });

  assert.equal(result.status, 0, result.stderr);
  assertInstalled(join(project, ".agents", "skills", skillName));
  assert.equal(existsSync(join(nested, ".agents")), false);
});

test("strict auto detection refuses zero and two detected hosts before writes", () => {
  const noneRoot = temporaryRoot();
  const none = run([], { cwd: noneRoot, env: isolatedEnvironment(noneRoot) });
  assert.equal(none.status, 1);
  assert.match(none.stderr, /auto-detection found neither Codex nor Claude Code/);
  assert.equal(existsSync(join(noneRoot, "home", ".agents")), false);
  assert.equal(existsSync(join(noneRoot, "home", ".claude")), false);

  const bothRoot = temporaryRoot();
  mkdirSync(join(bothRoot, "home", ".agents"));
  mkdirSync(join(bothRoot, "home", ".claude"));
  const both = run([], { cwd: bothRoot, env: isolatedEnvironment(bothRoot) });
  assert.equal(both.status, 1);
  assert.match(both.stderr, /auto-detection found both Codex and Claude Code/);
  assert.equal(existsSync(join(bothRoot, "home", ".agents", "skills")), false);
  assert.equal(existsSync(join(bothRoot, "home", ".claude", "skills")), false);
});

test("auto detection selects exactly one host from directory or environment signals", () => {
  const codexRoot = temporaryRoot();
  mkdirSync(join(codexRoot, "home", ".agents"));
  const codex = run([], { cwd: codexRoot, env: isolatedEnvironment(codexRoot) });
  assert.equal(codex.status, 0, codex.stderr);
  assertInstalled(join(codexRoot, "home", ".agents", "skills", skillName));

  const claudeRoot = temporaryRoot();
  const claudeConfig = join(claudeRoot, "configured-claude");
  const claude = run([], {
    cwd: claudeRoot,
    env: isolatedEnvironment(claudeRoot, { CLAUDE_CONFIG_DIR: claudeConfig }),
  });
  assert.equal(claude.status, 0, claude.stderr);
  assertInstalled(join(claudeConfig, "skills", skillName));
});

test("an explicit target wins when both hosts are detected", () => {
  const root = temporaryRoot();
  mkdirSync(join(root, "home", ".agents"));
  mkdirSync(join(root, "home", ".claude"));

  const result = run(["--target", "codex"], { cwd: root, env: isolatedEnvironment(root) });

  assert.equal(result.status, 0, result.stderr);
  assertInstalled(join(root, "home", ".agents", "skills", skillName));
  assert.equal(existsSync(join(root, "home", ".claude", "skills")), false);
});

test("PATH detection never executes the detected agent binary", { skip: process.platform === "win32" }, () => {
  const root = temporaryRoot();
  const binRoot = join(root, "bin");
  const marker = join(root, "agent-was-executed");
  mkdirSync(binRoot);
  writeFileSync(
    join(binRoot, "codex"),
    `#!/bin/sh\nprintf invoked > ${JSON.stringify(marker)}\n`,
    { mode: 0o755 },
  );

  const result = run([], {
    cwd: root,
    env: isolatedEnvironment(root, { PATH: binRoot }),
  });

  assert.equal(result.status, 0, result.stderr);
  assertInstalled(join(root, "home", ".agents", "skills", skillName));
  assert.equal(existsSync(marker), false, "auto detection executed the codex binary");
});

test("preserves an existing destination unless --force is explicit", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const skillsRoot = join(root, "skills");
  const destination = createInstallation(skillsRoot, skillName, "preserve current");

  const refused = run(["--target", "claude", "--path", skillsRoot], { cwd: root, env });
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /already exists; rerun with --force/);
  assert.equal(readMarker(destination), "preserve current");

  const replaced = run(["--target", "claude", "--path", skillsRoot, "--force"], { cwd: root, env });
  assert.equal(replaced.status, 0, replaced.stderr);
  assertInstalled(destination);
  assert.equal(existsSync(join(destination, "marker.txt")), false);
  assertNoTransactions(skillsRoot);
});

test("migration requires a previous-root installation and existing current destinations require force", () => {
  const emptyRoot = temporaryRoot();
  const empty = run(["--target", "codex", "--migrate"], {
    cwd: emptyRoot,
    env: isolatedEnvironment(emptyRoot),
  });
  assert.equal(empty.status, 1);
  assert.match(empty.stderr, /--migrate requires a recognized legacy installation for Codex/);
  assert.equal(existsSync(join(emptyRoot, "home", ".agents")), false);

  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const currentRoot = join(root, "home", ".agents", "skills");
  const previousRoot = join(root, "home", ".codex", "skills");
  const destination = createInstallation(currentRoot, skillName, "current");
  const legacy = createInstallation(previousRoot, skillName, "legacy");
  const refused = run(["--target", "codex", "--migrate"], { cwd: root, env });
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /--force --migrate/);
  assert.equal(readMarker(destination), "current");
  assert.equal(readMarker(legacy), "legacy");

  const replaced = run(["--target", "codex", "--force", "--migrate"], { cwd: root, env });
  assert.equal(replaced.status, 0, replaced.stderr);
  assertInstalled(destination);
  assert.equal(existsSync(legacy), false);
  assertNoTransactions(currentRoot, previousRoot);
});

test("migrates user Codex installations from CODEX_HOME and ~/.codex into ~/.agents", () => {
  const root = temporaryRoot();
  const codexHome = join(root, "alternate-codex-home");
  const env = isolatedEnvironment(root, { CODEX_HOME: codexHome });
  const oldCurrent = createInstallation(join(codexHome, "skills"), skillName, "old current name");
  const previousDefault = createInstallation(join(root, "home", ".codex", "skills"), skillName, "previous default");

  const result = run(["--target", "codex", "--migrate"], { cwd: root, env });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(oldCurrent), false);
  assert.equal(existsSync(previousDefault), false);
  assertInstalled(join(root, "home", ".agents", "skills", skillName));
  assertNoTransactions(dirname(oldCurrent), dirname(previousDefault), join(root, "home", ".agents", "skills"));
});

test("migrates a project Codex installation from .codex to .agents", () => {
  const root = temporaryRoot();
  const project = join(root, "project");
  mkdirSync(project);
  const legacy = createInstallation(join(project, ".codex", "skills"), skillName, "project legacy");
  const result = run(["--target", "codex", "--scope", "project", "--migrate"], {
    cwd: project,
    env: isolatedEnvironment(root),
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(legacy), false);
  assertInstalled(join(project, ".agents", "skills", skillName));
});

test("both-target migration may migrate one host and freshly install the other", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const codexRoot = join(root, "home", ".agents", "skills");
  const claudeRoot = join(root, "home", ".claude", "skills");
  const previousCodexRoot = join(root, "home", ".codex", "skills");
  const legacy = createInstallation(previousCodexRoot, skillName, "codex legacy");

  const result = run(["--target", "both", "--migrate"], { cwd: root, env });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(legacy), false);
  assertInstalled(join(codexRoot, skillName));
  assertInstalled(join(claudeRoot, skillName));
  assertNoTransactions(codexRoot, claudeRoot, previousCodexRoot);
});

test("both-target migration requires at least one legacy overall", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const result = run(["--target", "both", "--migrate"], { cwd: root, env });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--migrate requires a recognized legacy installation for either target/);
  assert.equal(existsSync(join(root, "home", ".agents")), false);
  assert.equal(existsSync(join(root, "home", ".claude")), false);
});

test("multi-target dry run reports labels, stages, backups, and destinations without writes", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const codexRoot = join(root, "home", ".agents", "skills");
  const claudeRoot = join(root, "home", ".claude", "skills");
  const codexDestination = createInstallation(codexRoot, skillName, "codex current");
  const claudeDestination = createInstallation(claudeRoot, skillName, "claude current");
  const beforeCodex = readdirSync(codexRoot).sort();
  const beforeClaude = readdirSync(claudeRoot).sort();

  const result = run(["--target", "both", "--force", "--dry-run"], { cwd: root, env });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Target: Codex/);
  assert.match(result.stdout, /Target: Claude Code/);
  assert.match(result.stdout, /staged-codex/);
  assert.match(result.stdout, /staged-claude/);
  assert.match(result.stdout, /\{transaction-id\}.*backups/s);
  assert.ok(result.stdout.includes(codexDestination));
  assert.ok(result.stdout.includes(claudeDestination));
  assert.ok(result.stdout.includes(skillSource));
  assert.deepEqual(readdirSync(codexRoot).sort(), beforeCodex);
  assert.deepEqual(readdirSync(claudeRoot).sort(), beforeClaude);
  assert.equal(readMarker(codexDestination), "codex current");
  assert.equal(readMarker(claudeDestination), "claude current");
  assertNoTransactions(codexRoot, claudeRoot);
});

test("a fresh multi-target dry run creates no agent directories", () => {
  const root = temporaryRoot();
  const result = run(["--target", "both", "--dry-run"], {
    cwd: root,
    env: isolatedEnvironment(root),
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Target: Codex/);
  assert.match(result.stdout, /Target: Claude Code/);
  assert.equal(existsSync(join(root, "home", ".agents")), false);
  assert.equal(existsSync(join(root, "home", ".claude")), false);
});

test("refuses to migrate a previous-root directory without a regular SKILL.md", () => {
  const root = temporaryRoot();
  const skillsRoot = join(root, "home", ".codex", "skills");
  const lookalike = join(skillsRoot, skillName);
  mkdirSync(lookalike, { recursive: true });
  writeFileSync(join(lookalike, "marker.txt"), "unrelated directory");

  const result = run(["--target", "codex", "--migrate"], {
    cwd: root,
    env: isolatedEnvironment(root),
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /legacy installation is missing a regular SKILL\.md file/);
  assert.equal(readMarker(lookalike), "unrelated directory");
  assert.equal(existsSync(join(root, "home", ".agents", "skills", skillName)), false);
  assertNoTransactions(skillsRoot);
});

test("rejects non-directories and symlinked installation targets", { skip: process.platform === "win32" }, () => {
  const fileRoot = temporaryRoot();
  const fileSkills = join(fileRoot, "skills");
  mkdirSync(fileSkills);
  writeFileSync(join(fileSkills, skillName), "not a directory");
  const fileResult = run(["--target", "codex", "--path", fileSkills, "--force"], {
    cwd: fileRoot,
    env: isolatedEnvironment(fileRoot),
  });
  assert.equal(fileResult.status, 1);
  assert.match(fileResult.stderr, /is not a regular directory; refusing to modify it/);

  const linkRoot = temporaryRoot();
  const linkSkills = join(linkRoot, "home", ".codex", "skills");
  const outside = createInstallation(linkRoot, "outside", "outside stays");
  mkdirSync(linkSkills, { recursive: true });
  symlinkSync(outside, join(linkSkills, skillName), "dir");
  const linkResult = run(["--target", "codex", "--migrate"], {
    cwd: linkRoot,
    env: isolatedEnvironment(linkRoot),
  });
  assert.equal(linkResult.status, 1);
  assert.match(linkResult.stderr, /legacy installation .* is not a regular directory/);
  assert.equal(readMarker(outside), "outside stays");
});

test("rejects a custom root that aliases the packaged source through a symlinked parent", { skip: process.platform === "win32" }, () => {
  const root = temporaryRoot();
  const repositoryAlias = join(root, "repository-alias");
  symlinkSync(repositoryRoot, repositoryAlias, "dir");
  const originalSkill = readFileSync(join(skillSource, "SKILL.md"), "utf8");

  const result = run(
    ["--target", "codex", "--path", join(repositoryAlias, "skills"), "--force", "--dry-run"],
    { cwd: root, env: isolatedEnvironment(root) },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /overlaps the packaged skill source/);
  assert.equal(readFileSync(join(skillSource, "SKILL.md"), "utf8"), originalSkill);
  assertNoTransactions(join(repositoryRoot, "skills"));
});

test("rejects Codex and Claude roots that alias each other", { skip: process.platform === "win32" }, () => {
  const root = temporaryRoot();
  const home = join(root, "home");
  mkdirSync(join(home, ".agents"));
  symlinkSync(join(home, ".agents"), join(home, ".claude"), "dir");

  const result = run(["--target", "both"], { cwd: root, env: isolatedEnvironment(root) });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Codex skills root .* overlaps Claude Code skills root/);
  assert.equal(existsSync(join(home, ".agents", "skills")), false);
});

test("restores both destinations and the previous Codex-root installation when the second publish fails", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const codexRoot = join(root, "home", ".agents", "skills");
  const claudeRoot = join(root, "home", ".claude", "skills");
  const codexDestination = createInstallation(codexRoot, skillName, "codex current");
  const previousCodexRoot = join(root, "home", ".codex", "skills");
  const codexLegacy = createInstallation(previousCodexRoot, skillName, "codex legacy");
  const claudeDestination = createInstallation(claudeRoot, skillName, "claude current");
  const preload = join(root, "fail-second-publish.cjs");

  writeFileSync(
    preload,
    `const fs = require("node:fs");
const path = require("node:path");
const { syncBuiltinESMExports } = require("node:module");
const originalRenameSync = fs.renameSync;
fs.renameSync = function (source, target) {
  if (path.basename(String(source)) === "staged-claude") {
    throw new Error("simulated Claude publish failure");
  }
  return originalRenameSync(source, target);
};
syncBuiltinESMExports();
`,
  );

  const result = run(["--target", "both", "--force", "--migrate"], {
    cwd: root,
    env,
    nodeArgs: ["--require", preload],
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /simulated Claude publish failure/);
  assert.equal(readMarker(codexDestination), "codex current");
  assert.equal(readMarker(codexLegacy), "codex legacy");
  assert.equal(readMarker(claudeDestination), "claude current");
  assertNoTransactions(codexRoot, claudeRoot, previousCodexRoot);
});

test("a second-target staging failure removes transactions and newly created roots", () => {
  const root = temporaryRoot();
  const env = isolatedEnvironment(root);
  const preload = join(root, "fail-second-stage.cjs");

  writeFileSync(
    preload,
    `const fs = require("node:fs");
const path = require("node:path");
const { syncBuiltinESMExports } = require("node:module");
const originalCpSync = fs.cpSync;
fs.cpSync = function (source, target, options) {
  if (path.basename(String(target)) === "staged-claude") {
    throw new Error("simulated Claude staging failure");
  }
  return originalCpSync(source, target, options);
};
syncBuiltinESMExports();
`,
  );

  const result = run(["--target", "both"], {
    cwd: root,
    env,
    nodeArgs: ["--require", preload],
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /simulated Claude staging failure/);
  assert.equal(existsSync(join(root, "home", ".agents")), false);
  assert.equal(existsSync(join(root, "home", ".claude")), false);
});
