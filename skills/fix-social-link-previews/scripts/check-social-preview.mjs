#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const CRAWLER_UA =
  "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)";
const RASTER_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function decode(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function attributes(tag) {
  const result = {};
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(pattern)) {
    result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4]);
  }
  return result;
}

export function parseMetadata(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html;
  const metas = new Map();
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = attributes(tag);
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (!key) continue;
    const values = metas.get(key) ?? [];
    values.push(attrs.content ?? "");
    metas.set(key, values);
  }

  const canonicals = [];
  for (const tag of head.match(/<link\b[^>]*>/gi) ?? []) {
    const attrs = attributes(tag);
    if ((attrs.rel ?? "").toLowerCase().split(/\s+/).includes("canonical")) {
      canonicals.push(attrs.href ?? "");
    }
  }

  return {
    title: decode(head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    metas,
    canonicals,
  };
}

function first(metadata, key) {
  return metadata.metas.get(key)?.[0]?.trim() ?? "";
}

function finding(findings, severity, code, message) {
  findings.push({ severity, code, message });
}

function absoluteHttp(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function pageIdentity(value) {
  try {
    const url = new URL(value);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.origin}${pathname}`;
  } catch {
    return null;
  }
}

function imageDimensions(buffer, type) {
  if (type === "image/png" && buffer.length >= 24) {
    const signature = buffer.subarray(0, 8).toString("hex");
    if (signature === "89504e470d0a1a0a") {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }
  }

  if (type === "image/jpeg" && buffer.length >= 4) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) break;
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        };
      }
      offset += 2 + length;
    }
  }

  if (
    type === "image/webp" &&
    buffer.length >= 30 &&
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  ) {
    const format = buffer.subarray(12, 16).toString();
    if (format === "VP8X") {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }
  }

  return null;
}

export function auditMetadata(
  metadata,
  { deployed = false, pageUrl } = {},
) {
  const findings = [];
  const required = [
    ["og:type", "Open Graph type"],
    ["og:title", "Open Graph title"],
    ["og:description", "Open Graph description"],
    ["og:url", "Open Graph URL"],
    ["og:image", "Open Graph image"],
    ["twitter:card", "Twitter card type"],
    ["twitter:title", "Twitter title"],
    ["twitter:description", "Twitter description"],
    ["twitter:image", "Twitter image"],
  ];

  if (!metadata.title)
    finding(findings, "error", "title-missing", "Document title is missing.");
  if (!first(metadata, "description")) {
    finding(
      findings,
      "error",
      "description-missing",
      "Meta description is missing.",
    );
  }
  if (metadata.canonicals.length !== 1 || !metadata.canonicals[0]) {
    finding(
      findings,
      "error",
      "canonical-invalid",
      `Expected one non-empty canonical link; found ${metadata.canonicals.length}.`,
    );
  }

  for (const [key, label] of required) {
    if (!first(metadata, key))
      finding(findings, "error", `${key}-missing`, `${label} is missing.`);
  }

  if (
    first(metadata, "twitter:card") &&
    first(metadata, "twitter:card") !== "summary_large_image"
  ) {
    finding(
      findings,
      "error",
      "twitter-card-small",
      "twitter:card must be summary_large_image for large-image behavior.",
    );
  }

  for (const key of ["og:image", "twitter:image", "og:url"]) {
    const value = first(metadata, key);
    if (deployed && value && !absoluteHttp(value)) {
      finding(
        findings,
        "error",
        `${key}-relative`,
        `${key} must be an absolute URL on a deployed page.`,
      );
    }
  }

  if (
    deployed &&
    metadata.canonicals[0] &&
    !absoluteHttp(metadata.canonicals[0])
  ) {
    finding(
      findings,
      "error",
      "canonical-relative",
      "Canonical URL must be absolute on a deployed page.",
    );
  }

  if (deployed && pageUrl && absoluteHttp(pageUrl)) {
    const auditedPage = pageIdentity(pageUrl);
    const canonical = metadata.canonicals[0];
    const openGraphUrl = first(metadata, "og:url");

    if (
      canonical &&
      absoluteHttp(canonical) &&
      pageIdentity(canonical) !== auditedPage
    ) {
      finding(
        findings,
        "error",
        "canonical-page-mismatch",
        `Canonical URL points to ${canonical}, not the audited page ${pageUrl}.`,
      );
    }
    if (
      openGraphUrl &&
      absoluteHttp(openGraphUrl) &&
      pageIdentity(openGraphUrl) !== auditedPage
    ) {
      finding(
        findings,
        "error",
        "og-url-page-mismatch",
        `og:url points to ${openGraphUrl}, not the audited page ${pageUrl}.`,
      );
    }
  }

  const openGraphImage = first(metadata, "og:image");
  const twitterImage = first(metadata, "twitter:image");
  if (openGraphImage && twitterImage && openGraphImage !== twitterImage) {
    finding(
      findings,
      "error",
      "social-image-conflict",
      "og:image and twitter:image reference different assets.",
    );
  }

  for (const [key, values] of metadata.metas.entries()) {
    if (values.length > 1 && new Set(values).size > 1) {
      finding(
        findings,
        "warning",
        "metadata-conflict",
        `${key} has conflicting duplicate values.`,
      );
    }
  }

  if (!first(metadata, "og:image:alt")) {
    finding(
      findings,
      "warning",
      "og-image-alt-missing",
      "og:image:alt is missing.",
    );
  }
  if (!first(metadata, "twitter:image:alt")) {
    finding(
      findings,
      "warning",
      "twitter-image-alt-missing",
      "twitter:image:alt is missing.",
    );
  }

  const declaredWidth = Number(first(metadata, "og:image:width"));
  const declaredHeight = Number(first(metadata, "og:image:height"));
  if (!declaredWidth || !declaredHeight) {
    finding(
      findings,
      "warning",
      "image-size-undeclared",
      "Open Graph image width and height are not declared.",
    );
  }

  return findings;
}

async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl, {
    headers: { "user-agent": CRAWLER_UA, accept: "image/*,*/*;q=0.8" },
    redirect: "follow",
  });
  const type = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .toLowerCase();
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    ok: response.ok,
    status: response.status,
    finalUrl: response.url,
    type,
    bytes: buffer.length,
    dimensions: imageDimensions(buffer, type),
  };
}

export function auditImageResponse(image, { declaredType = "" } = {}) {
  const findings = [];

  if (!image.ok) {
    finding(
      findings,
      "error",
      "image-http-error",
      `Social image returned HTTP ${image.status}.`,
    );
  }
  if (!RASTER_TYPES.has(image.type)) {
    finding(
      findings,
      "error",
      "image-type-invalid",
      `Expected PNG, JPEG, or WebP; received ${image.type || "no content type"}.`,
    );
  }
  if (image.type === "image/webp") {
    finding(
      findings,
      "warning",
      "image-format-compatibility",
      "The social image is WebP, which some messaging crawlers do not render reliably; use PNG or JPEG for broad compatibility.",
    );
  }
  if (declaredType && image.type && declaredType.toLowerCase() !== image.type) {
    finding(
      findings,
      "error",
      "image-type-mismatch",
      `og:image:type declares ${declaredType}, but the image response serves ${image.type}.`,
    );
  }
  if (!image.dimensions) {
    finding(
      findings,
      "warning",
      "image-dimensions-unknown",
      "Could not determine social image dimensions.",
    );
  } else {
    const { width, height } = image.dimensions;
    const ratio = width / height;
    if (width < 600 || height < 315) {
      finding(
        findings,
        "error",
        "image-too-small",
        `Social image is ${width}×${height}; use at least 600×315.`,
      );
    }
    if (Math.abs(ratio - 1200 / 630) > 0.08) {
      finding(
        findings,
        "warning",
        "image-ratio",
        `Social image is ${width}×${height}; 1200×630 is recommended.`,
      );
    }
  }
  if (image.bytes > 5_000_000) {
    finding(
      findings,
      "warning",
      "image-heavy",
      `Social image is ${(image.bytes / 1_000_000).toFixed(1)} MB.`,
    );
  }

  return findings;
}

async function auditImage(imageUrl, findings, declaredType) {
  let image;
  try {
    image = await fetchImage(imageUrl);
  } catch (error) {
    finding(
      findings,
      "error",
      "image-fetch-failed",
      `Could not fetch social image: ${error.message}`,
    );
    return null;
  }

  findings.push(...auditImageResponse(image, { declaredType }));
  return image;
}

export async function auditTarget(target, { baseUrl } = {}) {
  const deployed = /^https?:\/\//i.test(target);
  let html;
  let pageUrl;
  let pageResponse = null;

  if (deployed) {
    const response = await fetch(target, {
      headers: {
        "user-agent": CRAWLER_UA,
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    pageResponse = {
      status: response.status,
      ok: response.ok,
      finalUrl: response.url,
    };
    if (!response.ok) throw new Error(`Page returned HTTP ${response.status}`);
    html = await response.text();
    pageUrl = response.url;
  } else {
    const file = path.resolve(target);
    html = await fs.readFile(file, "utf8");
    pageUrl = baseUrl || pathToFileURL(file).href;
  }

  const metadata = parseMetadata(html);
  const findings = auditMetadata(metadata, { deployed, pageUrl });
  const rawImage =
    first(metadata, "og:image") || first(metadata, "twitter:image");
  let image = null;

  if (rawImage) {
    let resolved;
    try {
      resolved = new URL(rawImage, pageUrl).href;
    } catch {
      finding(
        findings,
        "error",
        "image-url-invalid",
        "Social image URL is invalid.",
      );
    }
    if (resolved && /^https?:\/\//i.test(resolved))
      image = await auditImage(
        resolved,
        findings,
        first(metadata, "og:image:type"),
      );
    else if (resolved) {
      finding(
        findings,
        "warning",
        "image-not-verified",
        "Social image could not be fetched without an HTTP base URL.",
      );
    }
  }

  return {
    target,
    page: pageResponse,
    metadata: {
      title: metadata.title,
      description: first(metadata, "description"),
      canonical: metadata.canonicals[0] ?? "",
      openGraph: {
        title: first(metadata, "og:title"),
        description: first(metadata, "og:description"),
        url: first(metadata, "og:url"),
        image: first(metadata, "og:image"),
        imageType: first(metadata, "og:image:type"),
      },
      twitter: {
        card: first(metadata, "twitter:card"),
        title: first(metadata, "twitter:title"),
        description: first(metadata, "twitter:description"),
        image: first(metadata, "twitter:image"),
      },
    },
    image,
    findings,
    clean: findings.length === 0,
  };
}

function parseArgs(argv) {
  let target = "";
  let baseUrl;
  let json = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") json = true;
    else if (arg === "--base-url") baseUrl = argv[++index];
    else if (arg === "--help" || arg === "-h") return { help: true };
    else if (!target) target = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  return { target, baseUrl, json };
}

function printHuman(result) {
  console.log(`Social preview audit: ${result.target}`);
  if (result.page)
    console.log(`Page: HTTP ${result.page.status} ${result.page.finalUrl}`);
  if (result.image) {
    const size = result.image.dimensions
      ? `${result.image.dimensions.width}×${result.image.dimensions.height}`
      : "unknown dimensions";
    console.log(
      `Image: HTTP ${result.image.status}, ${result.image.type || "unknown type"}, ${size}`,
    );
  }
  if (!result.findings.length) {
    console.log(
      "PASS: crawler-visible large-image metadata and asset checks passed.",
    );
    return;
  }
  for (const item of result.findings) {
    console.log(`${item.severity.toUpperCase()} ${item.code}: ${item.message}`);
  }
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }
  if (args.help || !args.target) {
    console.log(
      "Usage: check-social-preview.mjs <url-or-html-file> [--base-url <url>] [--json]",
    );
    process.exitCode = args.help ? 0 : 2;
    return;
  }
  try {
    const result = await auditTarget(args.target, { baseUrl: args.baseUrl });
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else printHuman(result);
    process.exitCode = result.clean ? 0 : 1;
  } catch (error) {
    if (args.json)
      console.log(
        JSON.stringify({ target: args.target, error: error.message }, null, 2),
      );
    else console.error(`ERROR: ${error.message}`);
    process.exitCode = 2;
  }
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) await main();
