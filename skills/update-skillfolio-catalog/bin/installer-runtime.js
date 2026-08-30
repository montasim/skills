import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, parse, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const hostDefinitions = Object.freeze({
  codex: { label: "OpenAI Codex", user: [".agents", "skills"], project: [".agents", "skills"] },
  claude: { label: "Claude Code", user: [".claude", "skills"], project: [".claude", "skills"] },
  gemini: { label: "Gemini CLI", user: [".gemini", "skills"], project: [".gemini", "skills"] },
  antigravity: { label: "Google Antigravity", user: [".gemini", "config", "skills"], project: [".agents", "skills"] },
  "antigravity-cli": { label: "Antigravity CLI", user: [".gemini", "antigravity-cli", "skills"], project: [".agent", "skills"] },
  zcode: { label: "ZCode", user: [".zcode", "skills"], project: null },
  cursor: { label: "Cursor", user: [".cursor", "skills"], project: [".cursor", "skills"] },
  copilot: { label: "GitHub Copilot", user: [".copilot", "skills"], project: [".github", "skills"] },
  opencode: { label: "OpenCode", user: [".config", "opencode", "skills"], project: [".opencode", "skills"] },
});

const providerNames = Object.freeze(Object.keys(hostDefinitions));

function pathState(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error?.code === "ENOENT") return undefined;
    throw error;
  }
}

function contained(parent, child) {
  const value = relative(resolve(parent), resolve(child));
  return value === "" || (!value.startsWith("..") && !isAbsolute(value));
}

function inspectDirectoryPath(directory) {
  const resolved = resolve(directory);
  const parsed = parse(resolved);
  let current = parsed.root;
  for (const part of resolved.slice(parsed.root.length).split(process.platform === "win32" ? /[\\/]/ : "/").filter(Boolean)) {
    current = join(current, part);
    const state = pathState(current);
    if (!state) continue;
    if (state.isSymbolicLink()) throw new Error(`unsafe symlink in destination path: ${current}`);
    if (!state.isDirectory()) throw new Error(`destination path component is not a directory: ${current}`);
  }
}

function projectRoot() {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: process.cwd(),
    encoding: "utf8",
    windowsHide: true,
  });
  return result.status === 0 && result.stdout.trim() ? resolve(result.stdout.trim()) : resolve(process.cwd());
}

function detectedTarget() {
  const root = projectRoot();
  const codex = Boolean(process.env.CODEX_HOME || existsSync(join(homedir(), ".agents")) || existsSync(join(root, ".agents")));
  const claude = Boolean(process.env.CLAUDE_CONFIG_DIR || existsSync(join(homedir(), ".claude")) || existsSync(join(root, ".claude")));
  if (codex === claude) throw new Error(`auto-detection found ${codex ? "both Codex and Claude Code" : "neither Codex nor Claude Code"}; select --target explicitly`);
  return codex ? "codex" : "claude";
}

function expandTargets(value) {
  const requested = value.split(",").map((target) => target.trim()).filter(Boolean);
  if (requested.length === 0) throw new Error("--target requires at least one provider");
  if (requested.includes("all") && requested.length > 1) throw new Error("--target all cannot be combined with other providers");
  if (requested.includes("both") && requested.length > 1) throw new Error("--target both cannot be combined with other providers");
  if (requested.includes("auto") && requested.length > 1) throw new Error("--target auto cannot be combined with other providers");
  const expanded = requested[0] === "all"
    ? providerNames
    : requested[0] === "both"
      ? ["codex", "claude"]
      : requested[0] === "auto"
        ? [detectedTarget()]
        : requested;
  const unknown = expanded.filter((target) => !providerNames.includes(target));
  if (unknown.length) throw new Error(`Unknown provider: ${unknown.join(", ")}; supported providers: ${providerNames.join(", ")}, all, both, auto`);
  return [...new Set(expanded)];
}

function parseArgs(argv) {
  const options = { targets: [], scope: "user", dryRun: false, force: false, migrate: false, scopeExplicit: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--version" || argument === "-v") options.version = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--migrate") options.migrate = true;
    else if (["--target", "--scope", "--path"].includes(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) throw new Error(`${argument} requires a value`);
      if (argument === "--target") options.targets.push(...expandTargets(value));
      else if (argument === "--scope") {
        options.scope = value;
        options.scopeExplicit = true;
      } else options.customRoot = value;
      index += 1;
    } else throw new Error(`unknown option: ${argument}`);
  }
  options.targets = [...new Set(options.targets)];
  if (options.help || options.version) return options;
  if (options.targets.length === 0 && !options.customRoot) throw new Error("--target is required");
  if (!new Set(["user", "project"]).has(options.scope)) throw new Error("--scope must be user or project");
  if (options.customRoot && !isAbsolute(options.customRoot)) throw new Error("--path must be absolute");
  if (options.customRoot && options.targets.length > 1) throw new Error("--path requires a single target");
  if (options.customRoot && options.scopeExplicit) throw new Error("--path cannot be combined with an explicit --scope");
  return options;
}

function rootFor(target, scope, project) {
  if (target === "claude" && scope === "user" && process.env.CLAUDE_CONFIG_DIR) {
    return join(resolve(process.env.CLAUDE_CONFIG_DIR), "skills");
  }
  const parts = hostDefinitions[target][scope];
  if (!parts) throw new Error(`${target} has no documented ${scope}-scope skill root`);
  return join(scope === "user" ? homedir() : project, ...parts);
}

function configuredRoots(options) {
  if (options.customRoot) {
    return [{ targets: options.targets.length ? options.targets : ["custom"], root: resolve(options.customRoot) }];
  }
  const project = projectRoot();
  const unique = new Map();
  for (const target of options.targets) {
    const root = resolve(rootFor(target, options.scope, project));
    const existing = unique.get(root);
    if (existing) existing.targets.push(target);
    else unique.set(root, { targets: [target], root });
  }
  return [...unique.values()];
}

function helpText(skillName, version, legacyNames) {
  return `${skillName} ${version}

Usage: ${skillName} (--target <provider[,provider...]> | --path <absolute-skills-root>) [options]

Install ${skillName} for one or more Agent Skills hosts.

Options:
  --target <value>  ${providerNames.join(", ")}, all, both, or auto
  --scope <value>   user or project (default: user)
  --path <dir>      exact absolute skills root; one target only
  --force           replace an existing safe installation
  --migrate         replace configured legacy skill directories${legacyNames.length ? `: ${legacyNames.join(", ")}` : ""}
  --dry-run         show destinations without writing
  --help, -h        show help
  --version, -v     show version

Legacy target syntax remains supported: --target <codex|claude|both>.`;
}

function legacyPaths(root, legacyNames) {
  return legacyNames.map((name) => join(root, name));
}

function planInstall(item, skillName, source, options, config) {
  const root = resolve(item.root);
  if (root === parse(root).root) throw new Error(`refusing unsafe skills root: ${root}`);
  inspectDirectoryPath(root);
  const destination = join(root, skillName);
  if (contained(destination, source) || contained(source, destination)) throw new Error(`destination overlaps the packaged skill source: ${destination}`);
  const destinationState = pathState(destination);
  if (destinationState?.isSymbolicLink()) throw new Error(`Refusing to replace symlink destination: ${destination}`);
  if (destinationState && !destinationState.isDirectory()) throw new Error(`Refusing to replace non-directory destination: ${destination}`);
  const legacy = legacyPaths(root, config.legacyNames || []).filter((path) => existsSync(path));
  for (const path of legacy) {
    const state = pathState(path);
    if (state?.isSymbolicLink() || !state?.isDirectory()) throw new Error(`refusing unsafe legacy destination: ${path}`);
  }
  if (destinationState && !options.force) throw new Error(`destination exists; the skill already exists there and is already installed; use --force to replace it: ${destination}`);
  if (legacy.length && !options.migrate && !(config.forceMigratesLegacy && options.force)) {
    throw new Error(`Legacy skill exists; legacy skill installed at ${legacy[0]}; use ${config.forceMigratesLegacy ? "--force or " : ""}--migrate to replace it`);
  }
  return { ...item, root, destination, exists: Boolean(destinationState), legacy };
}

function installPlans(plans, skillName, source, options) {
  if (options.dryRun) return;
  const token = `${process.pid}-${Date.now()}`;
  const staged = [];
  try {
    for (const plan of plans) {
      mkdirSync(plan.root, { recursive: true });
      plan.stage = join(plan.root, `.${skillName}.stage-${token}`);
      plan.backup = join(plan.root, `.${skillName}.backup-${token}`);
      plan.legacyBackups = plan.legacy.map((path, index) => ({ path, backup: join(plan.root, `.${skillName}.legacy-${index}-${token}`) }));
      cpSync(source, plan.stage, { recursive: true, errorOnExist: true });
      staged.push(plan);
    }
    for (const plan of plans) {
      if (plan.exists) renameSync(plan.destination, plan.backup);
      for (const item of plan.legacyBackups) renameSync(item.path, item.backup);
      renameSync(plan.stage, plan.destination);
      plan.committed = true;
    }
    for (const plan of plans) {
      if (existsSync(plan.backup)) rmSync(plan.backup, { recursive: true, force: true });
      for (const item of plan.legacyBackups) rmSync(item.backup, { recursive: true, force: true });
    }
  } catch (error) {
    for (const plan of [...staged].reverse()) {
      if (plan.committed && existsSync(plan.destination)) rmSync(plan.destination, { recursive: true, force: true });
      if (plan.backup && existsSync(plan.backup)) renameSync(plan.backup, plan.destination);
      for (const item of plan.legacyBackups || []) if (existsSync(item.backup)) renameSync(item.backup, item.path);
      if (plan.stage && existsSync(plan.stage)) rmSync(plan.stage, { recursive: true, force: true });
    }
    throw error;
  }
}

export function runInstaller(config, moduleUrl = import.meta.url) {
  const packageRoot = resolve(dirname(fileURLToPath(moduleUrl)), "..");
  const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  const skillName = config.skillName;
  const source = join(packageRoot, "skills", skillName);
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) return console.log(helpText(skillName, manifest.version, config.legacyNames || []));
    if (options.version) return console.log(manifest.version);
    if (!existsSync(join(source, "SKILL.md"))) throw new Error(`package is missing a valid skill source: ${source}`);
    const plans = configuredRoots(options).map((item) => planInstall(item, skillName, source, options, config));
    installPlans(plans, skillName, source, options);
    for (const plan of plans) {
      const prefix = options.dryRun ? `[dry-run] ${plan.targets.join(", ")}: Would install` : "Installed";
      console.log(`${prefix} ${skillName} for ${plan.targets.join(", ")}: ${plan.destination}`);
    }
  } catch (error) {
    console.error(`${skillName}: ${error.message}`);
    console.error(helpText(skillName, manifest.version, config.legacyNames || []));
    process.exitCode = config.errorStatus || 1;
  }
}
