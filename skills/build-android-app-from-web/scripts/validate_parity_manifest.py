#!/usr/bin/env python3
"""Validate a web-to-Android parity manifest without modifying it."""

from __future__ import annotations

import argparse
import heapq
import json
import re
import sys
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "1.0"
MANIFEST_STATUSES = {"draft", "in-progress", "complete"}
DISCOVERY_STATUSES = {"in-progress", "complete"}
EVIDENCE_KINDS = {"source", "runtime", "test", "documentation", "artifact", "decision"}
EVIDENCE_PROVENANCE = {"observed", "inferred", "historical", "inaccessible"}
EVIDENCE_OUTCOMES = {"pass", "fail", "blocked", "not-run"}
DISPOSITIONS = {
    "native-parity",
    "native-adaptation",
    "shared",
    "decision-required",
    "deferred",
    "not-applicable",
}
CAPABILITY_STATUSES = {
    "discovered",
    "planned",
    "in-progress",
    "blocked",
    "implemented",
    "verified",
    "closed",
}
PRIORITIES = {"critical", "high", "medium", "low"}
IMPLEMENTATION_DISPOSITIONS = {"native-parity", "native-adaptation", "shared"}
NON_IMPLEMENTATION_DISPOSITIONS = {"deferred", "not-applicable"}
CAPABILITY_ID = re.compile(r"^[a-z0-9]+(?:[.-][a-z0-9]+)*$")

LIMITATION = (
    "Structural validation only: this tool cannot discover omitted web capabilities, run either app, "
    "judge visual or behavioral equivalence, or authenticate evidence and claimed outcomes."
)


def finding(code: str, path: str, message: str) -> dict[str, str]:
    return {"level": "error", "code": code, "path": path, "message": message}


class Validator:
    def __init__(self) -> None:
        self.findings: list[dict[str, str]] = []

    def add(self, code: str, path: str, message: str) -> None:
        self.findings.append(finding(code, path, message))

    def required(self, value: dict[str, Any], key: str, expected: type, path: str) -> Any | None:
        field_path = f"{path}.{key}" if path else key
        if key not in value:
            self.add("E_REQUIRED_FIELD", field_path, "Required field is missing.")
            return None
        child = value[key]
        if not isinstance(child, expected) or (expected is str and not child.strip()):
            self.add("E_FIELD_TYPE", field_path, f"Expected a non-empty {expected.__name__}.")
            return None
        return child

    def enum(self, value: Any, allowed: set[str], path: str) -> str | None:
        if not isinstance(value, str) or value not in allowed:
            self.add("E_ENUM", path, f"Expected one of: {', '.join(sorted(allowed))}.")
            return None
        return value

    def string_list(self, value: Any, path: str, *, non_empty: bool = False) -> list[str] | None:
        if not isinstance(value, list):
            self.add("E_FIELD_TYPE", path, "Expected an array of non-empty strings.")
            return None
        if non_empty and not value:
            self.add("E_VALUE", path, "Expected at least one item.")
        valid: list[str] = []
        seen: set[str] = set()
        for index, item in enumerate(value):
            item_path = f"{path}[{index}]"
            if not isinstance(item, str) or not item.strip():
                self.add("E_FIELD_TYPE", item_path, "Expected a non-empty string.")
                continue
            if item in seen:
                self.add("E_DUPLICATE_VALUE", item_path, f"Duplicate value {item!r}.")
            seen.add(item)
            valid.append(item)
        return valid

    def evidence(self, value: Any, path: str, *, verification: bool, non_empty: bool) -> None:
        if not isinstance(value, list):
            self.add("E_FIELD_TYPE", path, "Expected an array of evidence records.")
            return
        if non_empty and not value:
            self.add("E_VALUE", path, "Expected at least one evidence record.")
        for index, item in enumerate(value):
            item_path = f"{path}[{index}]"
            if not isinstance(item, dict):
                self.add("E_FIELD_TYPE", item_path, "Expected an evidence object.")
                continue
            kind = self.required(item, "kind", str, item_path)
            if kind is not None:
                self.enum(kind, EVIDENCE_KINDS, f"{item_path}.kind")
            provenance = self.required(item, "provenance", str, item_path)
            if provenance is not None:
                self.enum(provenance, EVIDENCE_PROVENANCE, f"{item_path}.provenance")
            self.required(item, "location", str, item_path)
            self.required(item, "detail", str, item_path)
            if verification:
                outcome = self.required(item, "outcome", str, item_path)
                if outcome is not None:
                    self.enum(outcome, EVIDENCE_OUTCOMES, f"{item_path}.outcome")

    def validate_discovery(self, value: Any) -> str | None:
        path = "discovery"
        if not isinstance(value, dict):
            self.add("E_FIELD_TYPE", path, "Expected an object.")
            return None
        status = self.required(value, "status", str, path)
        if status is not None:
            status = self.enum(status, DISCOVERY_STATUSES, f"{path}.status")
        evidence = value.get("evidence")
        if evidence is None:
            self.add("E_REQUIRED_FIELD", f"{path}.evidence", "Required field is missing.")
        else:
            self.evidence(evidence, f"{path}.evidence", verification=False, non_empty=True)
        exclusions = value.get("exclusions")
        if exclusions is None:
            self.add("E_REQUIRED_FIELD", f"{path}.exclusions", "Required field is missing.")
        elif not isinstance(exclusions, list):
            self.add("E_FIELD_TYPE", f"{path}.exclusions", "Expected an array.")
        else:
            for index, item in enumerate(exclusions):
                item_path = f"{path}.exclusions[{index}]"
                if not isinstance(item, dict):
                    self.add("E_FIELD_TYPE", item_path, "Expected an exclusion object.")
                    continue
                self.required(item, "scope", str, item_path)
                self.required(item, "justification", str, item_path)
        return status

    def validate_capability(
        self,
        item: Any,
        index: int,
        target_variant_ids: set[str],
        target_has_multiple_variants: bool,
    ) -> dict[str, Any] | None:
        path = f"capabilities[{index}]"
        if not isinstance(item, dict):
            self.add("E_FIELD_TYPE", path, "Expected a capability object.")
            return None

        capability_id = self.required(item, "id", str, path)
        if capability_id is not None and not CAPABILITY_ID.fullmatch(capability_id):
            self.add("E_VALUE", f"{path}.id", "Use lowercase letters and digits separated by dots or hyphens.")
        self.required(item, "name", str, path)
        self.required(item, "area", str, path)
        source_evidence = item.get("source_evidence")
        if source_evidence is None:
            self.add("E_REQUIRED_FIELD", f"{path}.source_evidence", "Required field is missing.")
        else:
            self.evidence(source_evidence, f"{path}.source_evidence", verification=False, non_empty=True)
        self.required(item, "expected_behavior", str, path)

        if "priority" in item:
            self.enum(item["priority"], PRIORITIES, f"{path}.priority")

        states = item.get("states")
        if states is None:
            self.add("E_REQUIRED_FIELD", f"{path}.states", "Required field is missing.")
        else:
            self.string_list(states, f"{path}.states", non_empty=True)
        dependencies = item.get("dependencies")
        if dependencies is None:
            self.add("E_REQUIRED_FIELD", f"{path}.dependencies", "Required field is missing.")
            valid_dependencies = None
        else:
            valid_dependencies = self.string_list(dependencies, f"{path}.dependencies")

        android = item.get("android")
        disposition: str | None = None
        implementation_locations: list[str] | None = None
        if not isinstance(android, dict):
            code = "E_REQUIRED_FIELD" if android is None else "E_FIELD_TYPE"
            self.add(code, f"{path}.android", "Expected an Android decision object.")
        else:
            raw_disposition = self.required(android, "disposition", str, f"{path}.android")
            if raw_disposition is not None:
                disposition = self.enum(raw_disposition, DISPOSITIONS, f"{path}.android.disposition")
            self.required(android, "rationale", str, f"{path}.android")
            locations = android.get("implementation_locations")
            if locations is None:
                self.add("E_REQUIRED_FIELD", f"{path}.android.implementation_locations", "Required field is missing.")
            else:
                implementation_locations = self.string_list(locations, f"{path}.android.implementation_locations")
            if disposition == "native-adaptation":
                self.required(android, "adaptation", str, f"{path}.android")
            if disposition in NON_IMPLEMENTATION_DISPOSITIONS:
                self.required(android, "justification", str, f"{path}.android")
            target_variants = android.get("target_variants")
            if target_variants is None:
                if target_has_multiple_variants:
                    self.add(
                        "E_TARGET_VARIANTS_REQUIRED",
                        f"{path}.android.target_variants",
                        "Capabilities in a multi-variant target must name at least one target variant.",
                    )
            else:
                valid_target_variants = self.string_list(
                    target_variants,
                    f"{path}.android.target_variants",
                    non_empty=True,
                )
                if valid_target_variants is not None:
                    for target_index, target_variant in enumerate(valid_target_variants):
                        if target_variant not in target_variant_ids:
                            self.add(
                                "E_TARGET_VARIANT_UNKNOWN",
                                f"{path}.android.target_variants[{target_index}]",
                                f"Unknown target variant ID {target_variant!r}.",
                            )

        verification = item.get("verification")
        requirements: list[str] | None = None
        verification_evidence: list[Any] | None = None
        if not isinstance(verification, dict):
            code = "E_REQUIRED_FIELD" if verification is None else "E_FIELD_TYPE"
            self.add(code, f"{path}.verification", "Expected a verification object.")
        else:
            raw_requirements = verification.get("requirements")
            if raw_requirements is None:
                self.add("E_REQUIRED_FIELD", f"{path}.verification.requirements", "Required field is missing.")
            else:
                requirements = self.string_list(raw_requirements, f"{path}.verification.requirements")
            verification_evidence = verification.get("evidence")
            if verification_evidence is None:
                self.add("E_REQUIRED_FIELD", f"{path}.verification.evidence", "Required field is missing.")
            else:
                self.evidence(
                    verification_evidence,
                    f"{path}.verification.evidence",
                    verification=True,
                    non_empty=False,
                )

        raw_status = self.required(item, "status", str, path)
        status = self.enum(raw_status, CAPABILITY_STATUSES, f"{path}.status") if raw_status is not None else None
        blockers = item.get("blockers")
        if blockers is None:
            self.add("E_REQUIRED_FIELD", f"{path}.blockers", "Required field is missing.")
            valid_blockers = None
        else:
            valid_blockers = self.string_list(blockers, f"{path}.blockers")
        self.required(item, "owner", str, path)

        if status == "blocked" and valid_blockers is not None and not valid_blockers:
            self.add("E_BLOCKER_REQUIRED", f"{path}.blockers", "Blocked status requires at least one blocker.")
        if status != "blocked" and valid_blockers:
            self.add("E_BLOCKER_STATUS", f"{path}.blockers", "Set status to blocked while blockers are present.")

        if disposition in IMPLEMENTATION_DISPOSITIONS:
            if status == "closed":
                self.add("E_CLOSURE_DISPOSITION", f"{path}.status", "Implementation dispositions close as verified, not closed.")
            if status in {"implemented", "verified"} and not implementation_locations:
                self.add(
                    "E_IMPLEMENTATION_LOCATION",
                    f"{path}.android.implementation_locations",
                    f"Status {status} requires at least one implementation location.",
                )
        elif disposition in NON_IMPLEMENTATION_DISPOSITIONS and status in {"implemented", "verified"}:
            self.add("E_CLOSURE_DISPOSITION", f"{path}.status", "Deferred and not-applicable dispositions close as closed.")
        elif disposition == "decision-required" and status in {"implemented", "verified", "closed"}:
            self.add("E_CLOSURE_DISPOSITION", f"{path}.status", "Resolve the Android disposition before closing this capability.")

        if status == "verified":
            if disposition not in IMPLEMENTATION_DISPOSITIONS:
                self.add("E_CLOSURE_VERIFICATION", f"{path}.status", "Verified is reserved for implementation dispositions.")
            if not requirements:
                self.add(
                    "E_CLOSURE_VERIFICATION",
                    f"{path}.verification.requirements",
                    "Verified status requires at least one verification requirement.",
                )
            if not verification_evidence:
                self.add(
                    "E_CLOSURE_VERIFICATION",
                    f"{path}.verification.evidence",
                    "Verified status requires at least one evidence record.",
                )
            elif any(not isinstance(entry, dict) or entry.get("outcome") != "pass" for entry in verification_evidence):
                self.add(
                    "E_CLOSURE_VERIFICATION",
                    f"{path}.verification.evidence",
                    "Every verification outcome must be pass before status can be verified.",
                )

        if status == "closed" and disposition not in NON_IMPLEMENTATION_DISPOSITIONS:
            self.add("E_CLOSURE_DISPOSITION", f"{path}.status", "Closed is reserved for deferred and not-applicable dispositions.")

        return {
            "id": capability_id,
            "path": path,
            "dependencies": valid_dependencies or [],
            "disposition": disposition,
            "status": status,
            "blockers": valid_blockers or [],
        }

    def validate(self, document: Any) -> list[dict[str, str]]:
        if not isinstance(document, dict):
            self.add("E_ROOT_TYPE", "$", "Expected a JSON object at the document root.")
            return self.findings

        version = self.required(document, "schema_version", str, "")
        if version is not None and version != SCHEMA_VERSION:
            self.add("E_SCHEMA_VERSION", "schema_version", f"Expected schema version {SCHEMA_VERSION!r}.")
        raw_manifest_status = self.required(document, "manifest_status", str, "")
        manifest_status = (
            self.enum(raw_manifest_status, MANIFEST_STATUSES, "manifest_status")
            if raw_manifest_status is not None
            else None
        )

        source = document.get("source")
        if not isinstance(source, dict):
            code = "E_REQUIRED_FIELD" if source is None else "E_FIELD_TYPE"
            self.add(code, "source", "Expected a source object.")
        else:
            self.required(source, "web_root", str, "source")
            self.required(source, "revision", str, "source")

        target = document.get("target")
        target_variant_ids: set[str] = set()
        target_has_multiple_variants = False
        if not isinstance(target, dict):
            code = "E_REQUIRED_FIELD" if target is None else "E_FIELD_TYPE"
            self.add(code, "target", "Expected a target object.")
        else:
            self.required(target, "android_root", str, "target")
            variants = target.get("variants")
            if variants is not None:
                if not isinstance(variants, list) or not variants:
                    self.add("E_FIELD_TYPE", "target.variants", "Expected a non-empty array of target variants.")
                else:
                    target_has_multiple_variants = len(variants) > 1
                    for index, variant in enumerate(variants):
                        variant_path = f"target.variants[{index}]"
                        if not isinstance(variant, dict):
                            self.add("E_FIELD_TYPE", variant_path, "Expected a target variant object.")
                            continue
                        variant_id = self.required(variant, "id", str, variant_path)
                        self.required(variant, "description", str, variant_path)
                        if variant_id is not None:
                            if not CAPABILITY_ID.fullmatch(variant_id):
                                self.add(
                                    "E_VALUE",
                                    f"{variant_path}.id",
                                    "Use lowercase letters and digits separated by dots or hyphens.",
                                )
                            elif variant_id in target_variant_ids:
                                self.add(
                                    "E_DUPLICATE_ID",
                                    f"{variant_path}.id",
                                    f"Target variant ID {variant_id!r} is duplicated.",
                                )
                            else:
                                target_variant_ids.add(variant_id)

        discovery = document.get("discovery")
        if discovery is None:
            self.add("E_REQUIRED_FIELD", "discovery", "Required field is missing.")
            discovery_status = None
        else:
            discovery_status = self.validate_discovery(discovery)

        limitations = document.get("limitations")
        if limitations is None:
            self.add("E_REQUIRED_FIELD", "limitations", "Required field is missing.")
        elif not isinstance(limitations, list):
            self.add("E_FIELD_TYPE", "limitations", "Expected an array of limitation objects.")
        else:
            for index, item in enumerate(limitations):
                item_path = f"limitations[{index}]"
                if not isinstance(item, dict):
                    self.add("E_FIELD_TYPE", item_path, "Expected a limitation object.")
                    continue
                self.required(item, "scope", str, item_path)
                self.required(item, "impact", str, item_path)
                self.required(item, "next_action", str, item_path)

        raw_capabilities = document.get("capabilities")
        capability_records: list[dict[str, Any]] = []
        if raw_capabilities is None:
            self.add("E_REQUIRED_FIELD", "capabilities", "Required field is missing.")
        elif not isinstance(raw_capabilities, list):
            self.add("E_FIELD_TYPE", "capabilities", "Expected an array of capability records.")
        else:
            if not raw_capabilities:
                self.add("E_VALUE", "capabilities", "Expected at least one discovered capability.")
            for index, item in enumerate(raw_capabilities):
                record = self.validate_capability(
                    item,
                    index,
                    target_variant_ids,
                    target_has_multiple_variants,
                )
                if record is not None:
                    capability_records.append(record)

        by_id: dict[str, dict[str, Any]] = {}
        duplicate_ids: set[str] = set()
        for record in capability_records:
            capability_id = record["id"]
            if not isinstance(capability_id, str) or not capability_id:
                continue
            if capability_id in by_id:
                duplicate_ids.add(capability_id)
                self.add("E_DUPLICATE_ID", f"{record['path']}.id", f"Capability ID {capability_id!r} is duplicated.")
            else:
                by_id[capability_id] = record

        adjacency: dict[str, list[str]] = {key: [] for key in by_id if key not in duplicate_ids}
        for record in capability_records:
            capability_id = record["id"]
            if not isinstance(capability_id, str) or capability_id not in adjacency:
                continue
            for dep_index, dependency in enumerate(record["dependencies"]):
                dep_path = f"{record['path']}.dependencies[{dep_index}]"
                if dependency == capability_id:
                    self.add("E_DEPENDENCY_SELF", dep_path, "A capability cannot depend on itself.")
                elif dependency not in by_id:
                    self.add("E_DEPENDENCY_UNKNOWN", dep_path, f"Unknown capability ID {dependency!r}.")
                elif dependency not in duplicate_ids:
                    adjacency[capability_id].append(dependency)

        # Kahn's algorithm avoids recursion limits on large capability inventories.
        indegree = {key: 0 for key in adjacency}
        for dependencies in adjacency.values():
            for dependency in dependencies:
                indegree[dependency] += 1
        ready = [key for key, count in indegree.items() if count == 0]
        heapq.heapify(ready)
        visited = 0
        while ready:
            node = heapq.heappop(ready)
            visited += 1
            for dependency in adjacency[node]:
                indegree[dependency] -= 1
                if indegree[dependency] == 0:
                    heapq.heappush(ready, dependency)
        if visited != len(adjacency):
            unresolved = sorted(key for key, count in indegree.items() if count > 0)
            self.add(
                "E_DEPENDENCY_CYCLE",
                "capabilities",
                "Dependency graph contains a cycle; unresolved IDs: " + ", ".join(unresolved),
            )

        if manifest_status == "complete":
            if discovery_status != "complete":
                self.add("E_COMPLETE_DISCOVERY", "discovery.status", "A complete manifest requires complete discovery.")
            for record in capability_records:
                if record["blockers"]:
                    self.add("E_COMPLETE_BLOCKER", f"{record['path']}.blockers", "A complete manifest cannot contain blockers.")
                if record["disposition"] in IMPLEMENTATION_DISPOSITIONS and record["status"] != "verified":
                    self.add(
                        "E_COMPLETE_CAPABILITY",
                        f"{record['path']}.status",
                        "Implementation dispositions must be verified in a complete manifest.",
                    )
                elif record["disposition"] in NON_IMPLEMENTATION_DISPOSITIONS and record["status"] != "closed":
                    self.add(
                        "E_COMPLETE_CAPABILITY",
                        f"{record['path']}.status",
                        "Deferred and not-applicable dispositions must be closed in a complete manifest.",
                    )
                elif record["disposition"] == "decision-required":
                    self.add(
                        "E_COMPLETE_DECISION",
                        f"{record['path']}.android.disposition",
                        "A complete manifest cannot contain an unresolved Android decision.",
                    )

        self.findings.sort(key=lambda item: (item["path"], item["code"], item["message"]))
        return self.findings


def parse_document(path: Path) -> tuple[Any | None, list[dict[str, str]]]:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(f"Cannot read manifest: {exc}") from exc
    try:
        return json.loads(text), []
    except json.JSONDecodeError as exc:
        return None, [finding("E_JSON_PARSE", "$", f"Invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}.")]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", help="Path to a JSON parity manifest")
    parser.add_argument("--json", action="store_true", help="Emit a machine-readable JSON report")
    args = parser.parse_args(argv)
    path = Path(args.manifest).resolve()

    try:
        document, findings = parse_document(path)
        if not findings:
            findings = Validator().validate(document)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    except Exception as exc:  # pragma: no cover - defensive CLI boundary
        print(f"Internal validation error: {exc}", file=sys.stderr)
        return 2

    capability_count = len(document.get("capabilities", [])) if isinstance(document, dict) and isinstance(document.get("capabilities"), list) else 0
    manifest_status = document.get("manifest_status") if isinstance(document, dict) else None
    report = {
        "manifest": str(path),
        "valid": not findings,
        "summary": {
            "manifest_status": manifest_status,
            "capability_count": capability_count,
            "finding_count": len(findings),
        },
        "limitations": [LIMITATION],
        "findings": findings,
    }

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(f"Manifest: {path}")
        print(f"Capabilities: {capability_count}")
        for item in findings:
            print(f"[{item['level'].upper()}] {item['code']} {item['path']}: {item['message']}")
        print("Valid." if not findings else f"{len(findings)} finding(s).")
        print(f"Scope: {LIMITATION}")
    return 1 if findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
