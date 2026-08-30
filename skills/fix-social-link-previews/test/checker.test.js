import assert from "node:assert/strict";
import test from "node:test";

import {
  auditImageResponse,
  auditMetadata,
  parseMetadata,
} from "../skills/fix-social-link-previews/scripts/check-social-preview.mjs";

const cleanHtml = `<!doctype html><html><head>
<title>Example - A useful product</title>
<meta name="description" content="A concrete description of the useful product.">
<link rel="canonical" href="https://example.com/">
<meta property="og:type" content="website">
<meta property="og:title" content="Example - A useful product">
<meta property="og:description" content="A concrete description of the useful product.">
<meta property="og:url" content="https://example.com/">
<meta property="og:image" content="https://example.com/social-preview.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Example product preview">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Example - A useful product">
<meta name="twitter:description" content="A concrete description of the useful product.">
<meta name="twitter:image" content="https://example.com/social-preview.png">
<meta name="twitter:image:alt" content="Example product preview">
</head><body></body></html>`;

test("accepts complete crawler-visible metadata", () => {
  const result = auditMetadata(parseMetadata(cleanHtml), { deployed: true });
  assert.deepEqual(result, []);
});

test("reports missing large-image metadata", () => {
  const metadata = parseMetadata(
    "<html><head><title>Small</title></head></html>",
  );
  const result = auditMetadata(metadata, { deployed: true });
  const codes = new Set(result.map((item) => item.code));
  assert(codes.has("description-missing"));
  assert(codes.has("og:image-missing"));
  assert(codes.has("twitter:card-missing"));
  assert(codes.has("canonical-invalid"));
});

test("detects conflicting duplicate metadata", () => {
  const metadata = parseMetadata(
    cleanHtml.replace(
      "</head>",
      '<meta property="og:title" content="Conflicting title"></head>',
    ),
  );
  const result = auditMetadata(metadata, { deployed: true });
  assert(result.some((item) => item.code === "metadata-conflict"));
});

test("rejects relative deployed URLs", () => {
  const metadata = parseMetadata(
    cleanHtml
      .replace("https://example.com/social-preview.png", "/social-preview.png")
      .replace('https://example.com/"', '/"'),
  );
  const result = auditMetadata(metadata, { deployed: true });
  assert(result.some((item) => item.code === "og:image-relative"));
});

test("flags WebP as a cross-platform compatibility risk", () => {
  const result = auditImageResponse({
    ok: true,
    status: 200,
    type: "image/webp",
    bytes: 20_000,
    dimensions: { width: 1200, height: 630 },
  });

  assert(
    result.some((item) => item.code === "image-format-compatibility"),
  );
});

test("detects declared and served image type mismatches", () => {
  const result = auditImageResponse(
    {
      ok: true,
      status: 200,
      type: "image/png",
      bytes: 20_000,
      dimensions: { width: 1200, height: 630 },
    },
    { declaredType: "image/webp" },
  );

  assert(result.some((item) => item.code === "image-type-mismatch"));
});

test("detects canonical metadata pointing at another production origin", () => {
  const metadata = parseMetadata(
    cleanHtml
      .replaceAll("https://example.com/", "https://old-host.example/"),
  );
  const result = auditMetadata(metadata, {
    deployed: true,
    pageUrl: "https://example.com/article",
  });

  assert(result.some((item) => item.code === "canonical-page-mismatch"));
  assert(result.some((item) => item.code === "og-url-page-mismatch"));
});

test("allows a query-string cache probe to keep the clean canonical URL", () => {
  const result = auditMetadata(parseMetadata(cleanHtml), {
    deployed: true,
    pageUrl: "https://example.com/?v=3",
  });

  assert(!result.some((item) => item.code.endsWith("page-mismatch")));
});
