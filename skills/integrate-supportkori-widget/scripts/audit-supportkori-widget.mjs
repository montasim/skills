#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const MAX_DEPTH = 8;
const MAX_FILES = 20_000;
const MAX_FILE_BYTES = 1_048_576;

const TEXT_EXTENSIONS = new Set([
  ".astro",
  ".cjs",
  ".css",
  ".htm",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".less",
  ".mjs",
  ".scss",
  ".svelte",
  ".toml",
  ".ts",
  ".tsx",
  ".vue",
  ".yaml",
  ".yml",
]);

const SKIPPED_DIRECTORIES = new Set([
  ".cache",
  ".git",
  ".netlify",
  ".next",
  ".nuxt",
  ".output",
  ".parcel-cache",
  ".pnpm",
  ".svelte-kit",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "target",
  "vendor",
]);

const SKIPPED_FILES = new Set([
  "bun.lock",
  "bun.lockb",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
]);

const COMPANION_SITE_DIRECTORIES = new Set([
  "docs",
  "landing",
  "marketing",
  "site",
  "website",
  "web",
]);

const WIDGET_URL_RE = /https?:\/\/(?:www\.)?supportkori\.com\/widget\.js\b/gi;
const SUPPORT_PAGE_RE = /https?:\/\/(?:www\.)?supportkori\.com\/(?!widget\.js\b)[^\s"'`<>)]+/gi;
const PROVIDER_RE = /\bsupportkori\b|supportkori\.com/i;
const THEME_SELECTOR_RE = /(?:\.sk-widget-(?:btn|iframe-container)\b|sk-widget-btn|sk-widget-iframe-container)/i;
const DEFAULT_YELLOW_RE = /#ffdd00\b/i;
const LEGACY_COPY_RE = /\b(?:support\s+montasim|support\s+me|buy\s+me\s+a\s+coffee)\b/i;
const CLIENT_LIFECYCLE_RE = /\b(?:useEffect|useLayoutEffect|onMounted|onBeforeMount|componentDidMount)\b|strategy\s*=\s*["']afterInteractive["']|document\.createElement\(\s*["']script["']/;
const IDEMPOTENCE_RE = /getElementById\s*\(|querySelector\s*\([^)]*(?:supportkori|widget)|\b(?:scriptId|WIDGET_SCRIPT_ID|widgetScriptId)\b|dataset\.(?:loaded|initialized)/i;

function usage() {
  return `Usage: node audit-supportkori-widget.mjs [--path <project>] [--json]

Performs a bounded, read-only static audit. It never changes the project and
never reports a widget as healthy without runtime and visual verification.

Options:
  --path <project>  Project directory to inspect (default: current directory)
  --json            Emit machine-readable JSON
  --help            Show this help text`;
}

function parseArgs(argv) {
  const options = { root: process.cwd(), json: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--path") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--path requires a directory");
      }
      options.root = value;
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function matchesAll(content, expression) {
  expression.lastIndex = 0;
  return [...content.matchAll(expression)];
}

function hasRawWidgetScriptTag(content) {
  return /<script\b[^>]*\bsrc\s*=\s*["'][^"']*supportkori\.com\/widget\.js[^"']*["'][^>]*>/is.test(content);
}

function hasSupportKoriIframe(content) {
  return /<iframe\b[^>]*\bsrc\s*=\s*["'][^"']*supportkori\.com[^"']*["'][^>]*>/is.test(content)
    || /(?:iframe|frame)\.src\s*=\s*["'][^"']*supportkori\.com/i.test(content);
}

function configuredMessages(content) {
  const values = [];
  const expression = /data-message\s*=\s*(?:["']([^"']*)["']|\{\s*["']([^"']*)["']\s*\})/gi;
  for (const match of content.matchAll(expression)) {
    values.push((match[1] ?? match[2] ?? "").trim());
  }
  return values;
}

async function collectFiles(root) {
  const files = [];
  const skipped = {
    depthLimitedDirectories: [],
    oversizedFiles: [],
    unreadableFiles: [],
    fileLimitReached: false,
  };

  async function visit(directory, depth) {
    if (files.length >= MAX_FILES) {
      skipped.fileLimitReached = true;
      return;
    }

    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      skipped.unreadableFiles.push(toPosix(path.relative(root, directory)) || ".");
      return;
    }

    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (files.length >= MAX_FILES) {
        skipped.fileLimitReached = true;
        return;
      }

      const absolutePath = path.join(directory, entry.name);
      const relativePath = toPosix(path.relative(root, absolutePath));

      if (entry.isSymbolicLink()) continue;

      if (entry.isDirectory()) {
        if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
        if (depth >= MAX_DEPTH) {
          skipped.depthLimitedDirectories.push(relativePath);
          continue;
        }
        await visit(absolutePath, depth + 1);
        continue;
      }

      if (!entry.isFile() || SKIPPED_FILES.has(entry.name)) continue;
      if (!TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

      try {
        const metadata = await stat(absolutePath);
        if (metadata.size > MAX_FILE_BYTES) {
          skipped.oversizedFiles.push(relativePath);
          continue;
        }
      } catch (error) {
        skipped.unreadableFiles.push(relativePath);
        continue;
      }

      files.push({ absolutePath, relativePath });
    }
  }

  await visit(root, 0);
  skipped.depthLimitedDirectories = uniqueSorted(skipped.depthLimitedDirectories);
  skipped.oversizedFiles = uniqueSorted(skipped.oversizedFiles);
  skipped.unreadableFiles = uniqueSorted(skipped.unreadableFiles);
  return { files, skipped };
}

function detectFrameworks(records) {
  const frameworks = new Set();
  const dependencyNames = new Set();

  for (const record of records) {
    const basename = path.posix.basename(record.relativePath);
    if (basename === "package.json") {
      try {
        const manifest = JSON.parse(record.content);
        for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
          for (const name of Object.keys(manifest[section] ?? {})) dependencyNames.add(name);
        }
      } catch {
        // Invalid package JSON is outside this auditor's remit.
      }
    }

    if (/^next\.config\./.test(basename)) frameworks.add("Next.js");
    if (/^nuxt\.config\./.test(basename)) frameworks.add("Nuxt");
    if (/^astro\.config\./.test(basename)) frameworks.add("Astro");
    if (/^svelte\.config\./.test(basename)) frameworks.add("SvelteKit");
    if (/^vite\.config\./.test(basename)) frameworks.add("Vite");
  }

  const dependencyMap = new Map([
    ["next", "Next.js"],
    ["nuxt", "Nuxt"],
    ["react", "React"],
    ["vue", "Vue"],
    ["svelte", "Svelte"],
    ["astro", "Astro"],
    ["@tanstack/react-router", "TanStack Router"],
    ["@tanstack/react-start", "TanStack Start"],
    ["vite", "Vite"],
  ]);

  for (const [dependency, framework] of dependencyMap) {
    if (dependencyNames.has(dependency)) frameworks.add(framework);
  }

  return [...frameworks].sort((left, right) => left.localeCompare(right));
}

function isLikelyHydratedSource(relativePath) {
  return new Set([".astro", ".jsx", ".svelte", ".tsx", ".vue"]).has(path.posix.extname(relativePath));
}

function isWithinDirectory(filePath, directoryPath) {
  const relative = path.relative(directoryPath, filePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function isCompanionSiteFile(filePath, extensionRoot) {
  const relative = toPosix(path.relative(extensionRoot, filePath));
  const firstSegment = relative.split("/")[0].toLowerCase();
  return COMPANION_SITE_DIRECTORIES.has(firstSegment);
}

function finding(severity, code, message, files = []) {
  return { severity, code, message, files: uniqueSorted(files) };
}

async function audit(root) {
  const { files, skipped } = await collectFiles(root);
  const records = [];

  for (const file of files) {
    try {
      records.push({ ...file, content: await readFile(file.absolutePath, "utf8") });
    } catch {
      skipped.unreadableFiles.push(file.relativePath);
    }
  }
  skipped.unreadableFiles = uniqueSorted(skipped.unreadableFiles);

  const providerFiles = [];
  const widgetScriptFiles = [];
  const iframeFiles = [];
  const externalSupportFiles = [];
  const themeSelectorFiles = [];
  const defaultYellowFiles = [];
  const legacyCopyFiles = [];
  const configuredWrongLabelFiles = [];
  const rawHydrationScriptFiles = [];
  const lifecycleFiles = [];
  const missingIdempotenceFiles = [];
  const duplicateScriptFiles = [];
  const scriptRecordPaths = new Set();
  const manifestRecords = [];
  const findings = [];

  for (const record of records) {
    const { content, relativePath } = record;
    if (PROVIDER_RE.test(content)) providerFiles.push(relativePath);

    const widgetMatches = matchesAll(content, WIDGET_URL_RE);
    if (widgetMatches.length > 0) {
      widgetScriptFiles.push(relativePath);
      scriptRecordPaths.add(relativePath);
    }
    if (widgetMatches.length > 1) duplicateScriptFiles.push(relativePath);
    if (hasSupportKoriIframe(content)) iframeFiles.push(relativePath);
    if (matchesAll(content, SUPPORT_PAGE_RE).length > 0) externalSupportFiles.push(relativePath);
    if (THEME_SELECTOR_RE.test(content)) themeSelectorFiles.push(relativePath);
    if (DEFAULT_YELLOW_RE.test(content) && widgetMatches.length > 0) defaultYellowFiles.push(relativePath);
    if (LEGACY_COPY_RE.test(content)) legacyCopyFiles.push(relativePath);

    const messages = configuredMessages(content);
    if (messages.some((message) => message !== "Support")) configuredWrongLabelFiles.push(relativePath);

    if (widgetMatches.length > 0 && CLIENT_LIFECYCLE_RE.test(content)) lifecycleFiles.push(relativePath);
    if (widgetMatches.length > 0 && isLikelyHydratedSource(relativePath) && !IDEMPOTENCE_RE.test(content)) {
      missingIdempotenceFiles.push(relativePath);
    }
    if (widgetMatches.length > 0 && isLikelyHydratedSource(relativePath) && hasRawWidgetScriptTag(content)) {
      rawHydrationScriptFiles.push(relativePath);
    }

    if (path.posix.basename(relativePath) === "manifest.json") {
      try {
        const manifest = JSON.parse(content);
        if (Number.isInteger(manifest.manifest_version)) {
          manifestRecords.push({
            absolutePath: record.absolutePath,
            relativePath,
            manifestVersion: manifest.manifest_version,
            hasContentSecurityPolicy: Object.hasOwn(manifest, "content_security_policy"),
          });
        }
      } catch {
        findings.push(finding(
          "warning",
          "manifest-parse-failed",
          "A manifest.json file could not be parsed, so extension constraints may be under-reported.",
          [relativePath],
        ));
      }
    }
  }

  const uniqueWidgetScriptFiles = uniqueSorted(widgetScriptFiles);
  const uniqueIframeFiles = uniqueSorted(iframeFiles);
  const uniqueExternalFiles = uniqueSorted(externalSupportFiles);
  const hasEmbeddedIntegration = uniqueWidgetScriptFiles.length > 0 || uniqueIframeFiles.length > 0;

  if (!hasEmbeddedIntegration && uniqueExternalFiles.length === 0) {
    findings.push(finding(
      "warning",
      "missing-widget",
      "No SupportKori widget script or embedded SupportKori frame was found in the scanned source.",
    ));
  }

  if (!hasEmbeddedIntegration && uniqueExternalFiles.length > 0) {
    findings.push(finding(
      "warning",
      "external-only-support",
      "SupportKori appears only as a URL. Activation may navigate outside the app instead of opening an in-app panel.",
      uniqueExternalFiles,
    ));
  }

  if (legacyCopyFiles.length > 0 || configuredWrongLabelFiles.length > 0) {
    findings.push(finding(
      "warning",
      "label-not-support",
      "Legacy or configured widget copy differs from the required visible label “Support”.",
      [...legacyCopyFiles, ...configuredWrongLabelFiles],
    ));
  }

  if (defaultYellowFiles.length > 0) {
    findings.push(finding(
      "warning",
      "provider-default-color",
      "The provider's default yellow is configured. Confirm that it is an intentional app token rather than an off-theme default.",
      defaultYellowFiles,
    ));
  }

  if (rawHydrationScriptFiles.length > 0) {
    findings.push(finding(
      "warning",
      "raw-script-in-hydrated-source",
      "A raw provider script tag appears in hydrated component source. Use a client-aware script primitive or idempotent client lifecycle and verify hydration.",
      rawHydrationScriptFiles,
    ));
  }

  if (missingIdempotenceFiles.length > 0) {
    findings.push(finding(
      "warning",
      "idempotence-not-evident",
      "Widget script usage in hydrated source has no obvious duplicate guard. Review mounts, route transitions, strict mode, and cleanup.",
      missingIdempotenceFiles,
    ));
  }

  if (duplicateScriptFiles.length > 0) {
    findings.push(finding(
      "warning",
      "duplicate-script-reference",
      "The provider script URL occurs more than once in a source file. Confirm that only one executable integration is installed.",
      duplicateScriptFiles,
    ));
  }

  if (uniqueWidgetScriptFiles.length > 1) {
    findings.push(finding(
      "notice",
      "multiple-integration-files",
      "Widget script references appear in multiple files. They may represent separate surfaces, but each surface must initialize exactly once.",
      uniqueWidgetScriptFiles,
    ));
  }

  if (hasEmbeddedIntegration && themeSelectorFiles.length === 0) {
    findings.push(finding(
      "notice",
      "theme-treatment-not-evident",
      "No provider-specific theme selector was found. Data attributes may provide a color, but visual consistency still needs manual review.",
      [...uniqueWidgetScriptFiles, ...uniqueIframeFiles],
    ));
  }

  if (hasEmbeddedIntegration) {
    findings.push(finding(
      "notice",
      "runtime-verification-required",
      "Static inspection cannot prove one trigger, in-app opening, iframe loading, unchanged navigation, accessibility, or visual consistency.",
      [...uniqueWidgetScriptFiles, ...uniqueIframeFiles],
    ));
  }

  for (const manifest of manifestRecords.filter((item) => item.manifestVersion === 3)) {
    const extensionRoot = path.dirname(manifest.absolutePath);
    const runtimeScriptFiles = records
      .filter((record) => scriptRecordPaths.has(record.relativePath))
      .filter((record) => isWithinDirectory(record.absolutePath, extensionRoot))
      .filter((record) => !isCompanionSiteFile(record.absolutePath, extensionRoot))
      .map((record) => record.relativePath);

    if (runtimeScriptFiles.length > 0) {
      findings.push(finding(
        "warning",
        "manifest-v3-remote-script",
        "A Manifest V3 surface appears to load SupportKori's remote widget script. Extension logic must be packaged; audit companion-site and extension-runtime surfaces separately.",
        [manifest.relativePath, ...runtimeScriptFiles],
      ));
    }
  }

  const warningCodes = findings.filter((item) => item.severity === "warning").map((item) => item.code);
  let status = "present-for-review";
  if (warningCodes.includes("missing-widget")) status = "missing";
  else if (warningCodes.length > 0) status = "integration-risk";

  findings.sort((left, right) => {
    const severityOrder = { warning: 0, notice: 1 };
    return severityOrder[left.severity] - severityOrder[right.severity]
      || left.code.localeCompare(right.code);
  });

  return {
    schemaVersion: 1,
    root,
    status,
    project: {
      frameworkHints: detectFrameworks(records),
      extensionManifests: manifestRecords
        .map(({ relativePath, manifestVersion, hasContentSecurityPolicy }) => ({
          path: relativePath,
          manifestVersion,
          hasContentSecurityPolicy,
        }))
        .sort((left, right) => left.path.localeCompare(right.path)),
    },
    evidence: {
      providerFiles: uniqueSorted(providerFiles),
      widgetScriptFiles: uniqueWidgetScriptFiles,
      iframeFiles: uniqueIframeFiles,
      externalSupportFiles: uniqueExternalFiles,
      themeSelectorFiles: uniqueSorted(themeSelectorFiles),
      lifecycleFiles: uniqueSorted(lifecycleFiles),
    },
    findings,
    auditScope: {
      scannedFiles: records.length,
      limits: {
        maxDepth: MAX_DEPTH,
        maxFiles: MAX_FILES,
        maxFileBytes: MAX_FILE_BYTES,
      },
      skipped,
      notProven: [
        "runtime loading and provider availability",
        "visual consistency with the app theme",
        "exactly one rendered trigger and panel",
        "in-app opening with unchanged navigation",
        "accessibility and responsive behavior",
        "deployed revision health",
      ],
    },
    boundary: "Read-only static audit. The project was not changed, and this result cannot establish a healthy outcome by itself.",
  };
}

function renderText(report) {
  const lines = [
    "SupportKori static audit",
    `Root: ${report.root}`,
    `Status: ${report.status}`,
    `Scanned files: ${report.auditScope.scannedFiles}`,
  ];

  const frameworks = report.project.frameworkHints.join(", ") || "none detected";
  lines.push(`Framework hints: ${frameworks}`);

  if (report.project.extensionManifests.length > 0) {
    const manifests = report.project.extensionManifests
      .map((item) => `${item.path} (MV${item.manifestVersion})`)
      .join(", ");
    lines.push(`Extension manifests: ${manifests}`);
  }

  lines.push("", "Findings:");
  if (report.findings.length === 0) {
    lines.push("- No static findings. Runtime and visual verification are still required.");
  } else {
    for (const item of report.findings) {
      const locations = item.files.length > 0 ? ` [${item.files.join(", ")}]` : "";
      lines.push(`- ${item.severity.toUpperCase()} ${item.code}: ${item.message}${locations}`);
    }
  }

  lines.push("", "Not proven:");
  for (const limitation of report.auditScope.notProven) lines.push(`- ${limitation}`);
  lines.push("", report.boundary);
  return lines.join("\n");
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    console.log(usage());
    return;
  }

  const root = path.resolve(options.root);
  try {
    const metadata = await stat(root);
    if (!metadata.isDirectory()) throw new Error("path is not a directory");
  } catch (error) {
    console.error(`Cannot audit ${root}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const report = await audit(root);
  console.log(options.json ? JSON.stringify(report, null, 2) : renderText(report));
}

await main();
