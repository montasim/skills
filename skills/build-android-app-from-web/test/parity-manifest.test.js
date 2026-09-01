import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const validator = join(root, "scripts", "validate_parity_manifest.py");
const fixture = (name) => join(root, "test", "fixtures", name);

function run(name, ...args) {
  return spawnSync("python3", [validator, ...args, fixture(name)], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
}

function jsonReport(name) {
  const result = run(name, "--json");
  assert.doesNotThrow(() => JSON.parse(result.stdout), result.stderr || result.stdout);
  return { result, report: JSON.parse(result.stdout) };
}

function codes(report) {
  return report.findings.map((item) => item.code);
}

test("accepts a complete manifest whose capabilities satisfy disposition-specific closure", () => {
  const { result, report } = jsonReport("valid-complete.json");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(report.valid, true);
  assert.equal(report.summary.manifest_status, "complete");
  assert.equal(report.summary.capability_count, 3);
  assert.deepEqual(report.findings, []);
  assert.match(report.limitations[0], /cannot discover omitted web capabilities/);
});

test("reports duplicate and missing capability IDs with stable codes", () => {
  const duplicate = jsonReport("duplicate-id.json");
  assert.equal(duplicate.result.status, 1);
  assert.ok(codes(duplicate.report).includes("E_DUPLICATE_ID"));

  const missing = jsonReport("missing-id.json");
  assert.equal(missing.result.status, 1);
  assert.ok(codes(missing.report).includes("E_REQUIRED_FIELD"));
  assert.ok(missing.report.findings.some((item) => item.path === "capabilities[0].id"));
});

test("rejects unknown enum values", () => {
  const { result, report } = jsonReport("invalid-enum.json");
  assert.equal(result.status, 1);
  assert.ok(codes(report).includes("E_ENUM"));
  assert.ok(report.findings.some((item) => item.path === "capabilities[0].android.disposition"));
});

test("validates target variants and optional capability priority", () => {
  const { result, report } = jsonReport("invalid-target-variant.json");
  assert.equal(result.status, 1);
  assert.ok(report.findings.some((item) => item.code === "E_ENUM" && item.path.endsWith(".priority")));
  assert.ok(codes(report).includes("E_TARGET_VARIANT_UNKNOWN"));
});

test("requires structured evidence provenance", () => {
  const { result, report } = jsonReport("missing-provenance.json");
  assert.equal(result.status, 1);
  assert.ok(
    report.findings.some(
      (item) => item.code === "E_REQUIRED_FIELD" && item.path === "discovery.evidence[0].provenance",
    ),
  );
});

test("does not treat implemented code as verified closure", () => {
  const { result, report } = jsonReport("unverified-closure.json");
  assert.equal(result.status, 1);
  assert.ok(codes(report).includes("E_COMPLETE_CAPABILITY"));
});

test("requires explicit justification for deferred and not-applicable dispositions", () => {
  for (const name of ["deferred-no-justification.json", "not-applicable-no-justification.json"]) {
    const { result, report } = jsonReport(name);
    assert.equal(result.status, 1, name);
    assert.ok(
      report.findings.some(
        (item) => item.code === "E_REQUIRED_FIELD" && item.path === "capabilities[0].android.justification",
      ),
      name,
    );
  }
});

test("rejects unknown dependency references and dependency cycles", () => {
  const unknown = jsonReport("unknown-dependency.json");
  assert.equal(unknown.result.status, 1);
  assert.ok(codes(unknown.report).includes("E_DEPENDENCY_UNKNOWN"));

  const cycle = jsonReport("dependency-cycle.json");
  assert.equal(cycle.result.status, 1);
  assert.ok(codes(cycle.report).includes("E_DEPENDENCY_CYCLE"));
});

test("human and JSON output are deterministic interfaces", () => {
  const human = run("valid-complete.json");
  assert.equal(human.status, 0, human.stderr);
  assert.match(human.stdout, /Capabilities: 3/);
  assert.match(human.stdout, /Valid\./);
  assert.match(human.stdout, /Structural validation only/);

  const { report } = jsonReport("invalid-enum.json");
  assert.equal(typeof report.valid, "boolean");
  assert.equal(typeof report.summary.finding_count, "number");
  assert.ok(Array.isArray(report.findings));
  assert.ok(report.findings.every((item) => item.level && item.code && item.path && item.message));
});

test("invalid invocation exits 2", () => {
  const result = spawnSync("python3", [validator], { cwd: root, encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /manifest/);
});

test("unreadable input exits 2 instead of becoming a manifest finding", () => {
  const result = spawnSync("python3", [validator, join(root, "test", "fixtures", "does-not-exist.json")], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Cannot read manifest/);
});
