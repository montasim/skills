#!/usr/bin/env python3
"""Read-only audit of a web project's Netlify build contract."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python < 3.11
    tomllib = None


FRAMEWORKS = (
    ("tanstack-start", ("@tanstack/react-start", "@tanstack/start")),
    ("next", ("next",)),
    ("astro", ("astro",)),
    ("sveltekit", ("@sveltejs/kit",)),
    ("nuxt", ("nuxt",)),
    ("vite", ("vite",)),
)


def parse_version(value: str) -> tuple[int, int, int] | None:
    match = re.search(r"(\d+)\.(\d+)(?:\.(\d+))?", value or "")
    if not match:
        return None
    return tuple(int(part or 0) for part in match.groups())


def finding(level: str, code: str, message: str) -> dict[str, str]:
    return {"level": level, "code": code, "message": message}


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Cannot read {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise ValueError(f"Expected a JSON object in {path}")
    return value


def resolved_package_version(root: Path, package_name: str, declared: str) -> tuple[str | None, str | None]:
    """Resolve an installed version before falling back to a numeric manifest range."""
    installed = root / "node_modules" / Path(*package_name.split("/")) / "package.json"
    if installed.exists():
        try:
            version = load_json(installed).get("version")
            if isinstance(version, str) and parse_version(version):
                return version, str(installed.relative_to(root))
        except ValueError:
            pass

    package_lock = root / "package-lock.json"
    if package_lock.exists():
        try:
            lock = load_json(package_lock)
            key = f"node_modules/{package_name}"
            candidate = lock.get("packages", {}).get(key, {}).get("version")
            if not candidate:
                candidate = lock.get("dependencies", {}).get(package_name, {}).get("version")
            if isinstance(candidate, str) and parse_version(candidate):
                return candidate, "package-lock.json"
        except ValueError:
            pass

    for lock_name in ("pnpm-lock.yaml", "yarn.lock"):
        lock_file = root / lock_name
        if not lock_file.exists():
            continue
        try:
            text = lock_file.read_text(encoding="utf-8")
        except OSError:
            continue
        escaped = re.escape(package_name)
        patterns = (
            rf"[\"']?{escaped}[^\n]*?[\"']?:\s*\n(?:[ \t]+[^\n]*\n){{0,5}}?[ \t]+version:\s*[\"']?(\d+\.\d+(?:\.\d+)?)",
            rf"[\"']?{escaped}@[^\n]*[\"']?:\s*\n(?:[ \t]+[^\n]*\n){{0,5}}?[ \t]+version[ :]\s*[\"']?(\d+\.\d+(?:\.\d+)?)",
            rf"[\"']?{escaped}@(\d+\.\d+(?:\.\d+)?)",
        )
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1), lock_name

    if parse_version(declared):
        return declared, "package.json"
    return None, None


def detect(root: Path) -> dict:
    package_file = root / "package.json"
    package = load_json(package_file) if package_file.exists() else {}
    dependencies = {}
    for key in ("dependencies", "devDependencies", "peerDependencies"):
        value = package.get(key, {})
        if isinstance(value, dict):
            dependencies.update(value)

    framework = "unknown"
    framework_package = None
    for candidate, packages in FRAMEWORKS:
        framework_package = next((name for name in packages if name in dependencies), None)
        if framework_package:
            framework = candidate
            break

    locks = {
        "pnpm": "pnpm-lock.yaml",
        "npm": "package-lock.json",
        "yarn": "yarn.lock",
        "bun": "bun.lockb",
    }
    managers = [name for name, lock in locks.items() if (root / lock).exists()]
    declared_version = dependencies.get(framework_package, "") if framework_package else ""
    resolved_version, version_source = (
        resolved_package_version(root, framework_package, declared_version)
        if framework_package else (None, None)
    )
    return {
        "package": package,
        "dependencies": dependencies,
        "framework": framework,
        "framework_package": framework_package,
        "framework_spec": declared_version or None,
        "framework_version": resolved_version,
        "framework_version_source": version_source,
        "package_managers": managers,
    }


def expected_contract(detected: dict) -> tuple[str | None, str | None, str]:
    framework = detected["framework"]
    if framework == "tanstack-start":
        version = parse_version(detected.get("framework_version") or "")
        if version is None:
            return None, None, "SSR (version-specific contract unresolved)"
        if version and version < (1, 121, 0):
            return "vinxi build", None, "SSR"
        if version and version < (1, 132, 0):
            return "vite build", "dist", "SSR"
        return "vite build", "dist/client", "SSR"
    return {
        "next": ("next build", ".next", "hybrid/SSR"),
        "astro": ("astro build", "dist", "static or SSR"),
        "sveltekit": ("vite build", "build", "static or SSR"),
        "nuxt": ("nuxt build", "dist", "hybrid/SSR"),
        "vite": ("vite build", "dist", "static or SPA"),
    }.get(framework, (None, None, "unknown"))


def audit(root: Path) -> dict:
    root = root.resolve()
    findings: list[dict[str, str]] = []
    if not root.is_dir():
        return {"root": str(root), "findings": [finding("error", "root-missing", "App root is not a directory.")]}

    try:
        detected = detect(root)
    except ValueError as exc:
        return {"root": str(root), "findings": [finding("error", "manifest-invalid", str(exc))]}

    package = detected["package"]
    command, expected_publish, runtime = expected_contract(detected)
    if detected["framework"] != "unknown" and not detected.get("framework_version"):
        findings.append(finding(
            "warning",
            "framework-version-unresolved",
            f"Could not resolve the installed {detected['framework_package']} version from node_modules, a supported lockfile, or package.json; version-specific defaults were not applied.",
        ))
    config_file = root / "netlify.toml"
    config = {}
    if config_file.exists():
        if tomllib is None:
            findings.append(finding("warning", "toml-unchecked", "Python 3.11+ is required to parse netlify.toml."))
        else:
            try:
                config = tomllib.loads(config_file.read_text(encoding="utf-8"))
            except (OSError, tomllib.TOMLDecodeError) as exc:
                findings.append(finding("error", "toml-invalid", f"Cannot parse netlify.toml: {exc}"))
    else:
        findings.append(finding("warning", "config-missing", "No netlify.toml was found; dashboard or framework defaults may be in use."))

    build = config.get("build", {}) if isinstance(config.get("build", {}), dict) else {}
    configured_command = build.get("command")
    configured_publish = build.get("publish")
    scripts = package.get("scripts", {}) if isinstance(package.get("scripts", {}), dict) else {}
    redirects = config.get("redirects", []) if isinstance(config.get("redirects", []), list) else []

    if package and "build" not in scripts:
        findings.append(finding("error", "build-script-missing", "package.json has no build script."))
    if len(detected["package_managers"]) > 1:
        findings.append(finding("warning", "multiple-lockfiles", "Multiple package-manager lockfiles were found: " + ", ".join(detected["package_managers"])))
    if command and configured_command and command not in str(configured_command) and "run build" not in str(configured_command):
        findings.append(finding("warning", "build-command-unexpected", f"Configured command {configured_command!r} differs from the typical {command!r}."))
    if expected_publish and configured_publish and Path(str(configured_publish)).as_posix().rstrip("/") != expected_publish:
        findings.append(finding("warning", "publish-unexpected", f"Configured publish directory {configured_publish!r} differs from the typical {expected_publish!r}."))

    spa_fallbacks = [
        index for index, redirect in enumerate(redirects)
        if isinstance(redirect, dict)
        and redirect.get("from") == "/*"
        and redirect.get("to") == "/index.html"
        and redirect.get("status") == 200
    ]
    if len(spa_fallbacks) > 1:
        findings.append(finding("error", "spa-fallback-duplicate", "Multiple SPA history fallbacks are configured."))
    if spa_fallbacks and spa_fallbacks[-1] != len(redirects) - 1:
        findings.append(finding("error", "spa-fallback-order", "The SPA catch-all must follow all specific redirects."))
    if spa_fallbacks and runtime not in ("static or SPA", "unknown"):
        findings.append(finding("error", "spa-fallback-runtime", f"An SPA catch-all is unsafe for the detected {runtime} runtime."))

    effective_publish = str(configured_publish or expected_publish or "")
    output_exists = None
    if effective_publish:
        base = str(build.get("base") or "")
        output = root / base / effective_publish
        output_exists = output.is_dir()
        if not output_exists:
            findings.append(finding("warning", "output-missing", f"Expected publish directory does not currently exist: {output}"))
        elif runtime in ("static or SPA", "static or SSR") and not (output / "index.html").exists():
            findings.append(finding("warning", "index-missing", f"No index.html exists in {output}; confirm this is adapter-managed SSR output."))

    if detected["framework"] == "tanstack-start":
        version = parse_version(detected.get("framework_version") or "")
        if version and version >= (1, 132, 0) and "@netlify/vite-plugin-tanstack-start" not in detected["dependencies"]:
            findings.append(finding("error", "tanstack-plugin-missing", "TanStack Start 1.132+ typically requires @netlify/vite-plugin-tanstack-start."))

    return {
        "root": str(root),
        "framework": detected["framework"],
        "framework_spec": detected.get("framework_spec"),
        "framework_version": detected.get("framework_version"),
        "framework_version_source": detected.get("framework_version_source"),
        "package_managers": detected["package_managers"],
        "runtime": runtime,
        "expected": {"command": command, "publish": expected_publish},
        "configured": {"command": configured_command, "publish": configured_publish, "base": build.get("base")},
        "output_exists": output_exists,
        "scope": "Configuration and path heuristics only; generated function correctness, output freshness, and deployed runtime behavior are not verified.",
        "findings": findings,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="Application root")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    args = parser.parse_args()
    result = audit(Path(args.root))
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Framework: {result.get('framework', 'unknown')}")
        print(f"Runtime: {result.get('runtime', 'unknown')}")
        print(f"Expected: {result.get('expected', {})}")
        for item in result["findings"]:
            print(f"[{item['level'].upper()}] {item['code']}: {item['message']}")
        if not result["findings"]:
            print("No findings.")
    return 1 if any(item["level"] == "error" for item in result["findings"]) else 0


if __name__ == "__main__":
    raise SystemExit(main())
