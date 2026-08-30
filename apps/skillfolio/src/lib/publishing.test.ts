import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { createPublishingMetadata, createSiteIdentity } from "./publishing"
import { skillCatalog } from "./skills"

const site = createSiteIdentity()
const publishing = createPublishingMetadata(site, skillCatalog)

describe("Publishing metadata", () => {
  it("keeps canonical and social page facts aligned", () => {
    const meta = publishing.pageMeta({
      title: "Example",
      description: "Example description",
      path: "/skills/example",
      type: "article",
    })

    expect(meta).toContainEqual({
      property: "og:url",
      content: `${site.url}/skills/example`,
    })
    expect(meta).toContainEqual({
      property: "og:image:width",
      content: String(site.image.width),
    })
    expect(meta).toContainEqual({
      name: "twitter:image",
      content: `${site.url}${site.image.path}`,
    })
  })

  it("builds structured data from the validated catalog", () => {
    const home = publishing.homeStructuredData()
    const skill = skillCatalog.featured()

    expect(home.mainEntity.numberOfItems).toBe(skillCatalog.summary().total)
    expect(publishing.skillStructuredData(skill)).toMatchObject({
      name: skill.name,
      codeRepository: skill.repository,
      url: `${site.url}/skills/${skill.slug}`,
    })
  })

  it("generates deterministic committed crawler files", () => {
    const generated = publishing.crawlerFiles()
    const sitemap = readFileSync(
      new URL("../../public/sitemap.xml", import.meta.url),
      "utf8"
    )
    const robots = readFileSync(
      new URL("../../public/robots.txt", import.meta.url),
      "utf8"
    )

    expect(generated.sitemap).not.toContain("lastmod")
    expect(sitemap).toBe(generated.sitemap)
    expect(robots).toBe(generated.robots)
  })
})
