#!/usr/bin/env python3
"""Discover and validate a JSON-backed Skillfolio catalog without modifying it."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

EXCLUDED_PARTS = {"node_modules", ".git", "dist", "build", ".next", ".netlify", "coverage"}
IDENTITY_KEYS = ("slug", "id", "name", "title", "package", "packageName", "npmPackage", "repository", "repo", "repoUrl")
URL_HINTS = ("url", "repo", "repository", "homepage", "source")


def arrays_in(value, label: str = "root"):
    if isinstance(value, list) and value and all(isinstance(item, dict) for item in value):
        yield label, value
    elif isinstance(value, dict):
        for key, child in value.items():
            yield from arrays_in(child, f"{label}.{key}")


def candidate_score(path: Path, records: list[dict]) -> int:
    keys = Counter(key for record in records for key in record)
    identity = sum(keys.get(key, 0) for key in IDENTITY_KEYS)
    skill_words = sum(4 for part in path.parts if "skill" in part.lower())
    description = keys.get("description", 0) + keys.get("summary", 0)
    return identity + description + skill_words + min(len(records), 20)


def discover(app: Path):
    candidates = []
    for path in app.rglob("*.json"):
        if any(part in EXCLUDED_PARTS for part in path.relative_to(app).parts):
            continue
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        for label, records in arrays_in(value):
            if records:
                candidates.append((candidate_score(path, records), path, label, records))
    return sorted(candidates, key=lambda item: (-item[0], str(item[1]), item[2]))


def lookup(records: list[dict], query: str) -> list[dict]:
    needle = query.casefold()
    return [
        record for record in records
        if any(str(record.get(key, "")).casefold() == needle for key in IDENTITY_KEYS)
    ]


def valid_http_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


def add(findings, level, code, message):
    findings.append({"level": level, "code": code, "message": message})


def validate(path: Path, label: str, records: list[dict], entry: str | None, app: Path):
    findings = []
    if len(records) < 1:
        add(findings, "error", "empty-catalog", "Catalog has no records.")
        return findings, []

    selected = lookup(records, entry) if entry else records
    if entry and not selected:
        add(findings, "error", "entry-missing", f"No record matches {entry!r} by a known identity field.")
    if entry and len(selected) > 1:
        add(findings, "error", "entry-ambiguous", f"Multiple records match {entry!r}.")

    key_counts = Counter(key for record in records for key in record)
    common_keys = {key for key, count in key_counts.items() if count / len(records) >= 0.8}
    expected_types = {}
    for key in common_keys:
        types = Counter(type(record[key]).__name__ for record in records if key in record and record[key] is not None)
        if types:
            expected_types[key] = types.most_common(1)[0][0]

    for index, record in enumerate(selected):
        identity = next((str(record[key]) for key in IDENTITY_KEYS if record.get(key)), f"record {index}")
        missing = sorted(key for key in common_keys if key not in record)
        if missing:
            add(findings, "error", "common-fields-missing", f"{identity}: missing common fields {', '.join(missing)}")
        for key, expected in expected_types.items():
            if key in record and record[key] is not None and type(record[key]).__name__ != expected:
                add(findings, "error", "field-type", f"{identity}: {key} is {type(record[key]).__name__}, expected {expected}")
        for key, value in record.items():
            lowered = key.lower()
            if isinstance(value, str) and any(hint in lowered for hint in URL_HINTS) and value.startswith(("http://", "https://")):
                if not valid_http_url(value):
                    add(findings, "error", "url-invalid", f"{identity}: {key} must be a canonical HTTPS URL")
            if "version" in lowered and isinstance(value, str) and value and not re.fullmatch(r"v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?", value):
                add(findings, "warning", "version-shape", f"{identity}: {key}={value!r} is not a conventional semantic version")

    for key in IDENTITY_KEYS:
        values = [(str(record[key]).casefold(), str(record[key])) for record in records if record.get(key)]
        counts = Counter(normalized for normalized, _ in values)
        for normalized, count in counts.items():
            if count > 1:
                original = next(original for norm, original in values if norm == normalized)
                add(findings, "error", "duplicate-identity", f"{key} value {original!r} occurs {count} times")

    if entry and selected:
        tokens = {entry.casefold()}
        for record in selected:
            tokens.update(str(record.get(key, "")).casefold() for key in ("slug", "name", "title") if record.get(key))
        readme = app / "README.md"
        if readme.exists() and not any(token in readme.read_text(encoding="utf-8").casefold() for token in tokens):
            add(findings, "warning", "readme-entry-missing", "The target entry was not found in README.md.")
        sitemaps = [app / "public" / "sitemap.xml", app / "sitemap.xml"]
        sitemap = next((item for item in sitemaps if item.exists()), None)
        if sitemap and not any(token in sitemap.read_text(encoding="utf-8").casefold() for token in tokens):
            add(findings, "warning", "sitemap-entry-missing", f"The target entry was not found in {sitemap.relative_to(app)}.")
    return findings, selected


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app", default=".", help="Skillfolio application root")
    parser.add_argument("--catalog", help="Explicit catalog JSON path, relative to app")
    parser.add_argument("--entry", help="Slug, id, name, package, or repository identity to validate")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    args = parser.parse_args()
    app = Path(args.app).resolve()
    if not app.is_dir():
        print(f"App root is not a directory: {app}", file=sys.stderr)
        return 2

    if args.catalog:
        catalog_path = (app / args.catalog).resolve()
        if app not in catalog_path.parents and catalog_path != app:
            print("Catalog must be inside the app root.", file=sys.stderr)
            return 2
        try:
            value = json.loads(catalog_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            print(f"Cannot read catalog: {exc}", file=sys.stderr)
            return 2
        arrays = list(arrays_in(value))
        if not arrays:
            print("No object-record array found in the explicit catalog.", file=sys.stderr)
            return 2
        label, records = max(arrays, key=lambda item: candidate_score(catalog_path, item[1]))
    else:
        candidates = discover(app)
        if not candidates:
            print("No JSON object-record catalog discovered.", file=sys.stderr)
            return 2
        _, catalog_path, label, records = candidates[0]

    findings, selected = validate(catalog_path, label, records, args.entry, app)
    result = {
        "app": str(app),
        "catalog": str(catalog_path),
        "array": label,
        "record_count": len(records),
        "selected_count": len(selected),
        "findings": findings,
    }
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Catalog: {catalog_path} ({label}, {len(records)} records)")
        for item in findings:
            print(f"[{item['level'].upper()}] {item['code']}: {item['message']}")
        if not findings:
            print("No findings.")
    return 1 if any(item["level"] == "error" for item in findings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
