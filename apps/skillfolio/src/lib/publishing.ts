import type { Skill, SkillCatalog } from "./skills.ts"

export const defaultSiteUrl = "https://skillfoliox.netlify.app"

export type SiteIdentity = {
  name: string
  title: string
  description: string
  author: string
  url: string
  image: {
    path: string
    type: string
    width: number
    height: number
    alt: string
  }
  locale: string
}

type PageFacts = {
  title: string
  description: string
  path?: string
  type?: "website" | "article"
}

export function createSiteIdentity(url = defaultSiteUrl): SiteIdentity {
  const siteUrl = url || defaultSiteUrl
  return Object.freeze({
    name: "Skillfolio",
    title: "Skillfolio - Reusable AI Agent Skills for Codex and Claude Code",
    description:
      "Explore field-tested skills for Codex, Claude Code, and other AI coding agents. Install focused workflows for documentation and more.",
    author: "Montasim",
    url: siteUrl.replace(/\/$/, ""),
    image: Object.freeze({
      path: "/skillfolio-preview-square-v3.png",
      type: "image/png",
      width: 1200,
      height: 1200,
      alt: "Skillfolio - small files, serious leverage.",
    }),
    locale: "en_US",
  })
}

export function createPublishingMetadata(
  site: SiteIdentity,
  catalog: SkillCatalog
) {
  const absoluteUrl = (path: string) =>
    `${site.url}${path.startsWith("/") ? path : `/${path}`}`

  const pageMeta = ({
    title,
    description,
    path = "/",
    type = "website",
  }: PageFacts) => {
    const url = absoluteUrl(path)
    const image = absoluteUrl(site.image.path)
    return [
      { title },
      { name: "description", content: description },
      { name: "author", content: site.author },
      { name: "application-name", content: site.name },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:type", content: type },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: site.locale },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:image:url", content: image },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:type", content: site.image.type },
      { property: "og:image:width", content: String(site.image.width) },
      { property: "og:image:height", content: String(site.image.height) },
      { property: "og:image:alt", content: site.image.alt },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: site.image.alt },
    ]
  }

  const homeStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: site.name,
    headline: "Small files. Serious leverage.",
    description: site.description,
    url: absoluteUrl("/"),
    author: { "@type": "Person", name: site.author },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: catalog.summary().total,
      itemListElement: catalog.list().map((skill, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: skill.name,
        url: absoluteUrl(`/skills/${skill.slug}`),
      })),
    },
  })

  const skillStructuredData = (skill: Skill) => {
    const path = `/skills/${skill.slug}`
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: skill.name,
      description: skill.description,
      codeRepository: skill.repository,
      version: skill.version,
      programmingLanguage: "Markdown",
      author: { "@type": "Person", name: site.author },
      url: absoluteUrl(path),
    }
  }

  const crawlerFiles = () => {
    const paths = ["/", ...catalog.routePaths()]
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`).join("\n")}
</urlset>
`
    const robots = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`
    return { sitemap, robots }
  }

  return Object.freeze({
    absoluteUrl,
    pageMeta,
    homeStructuredData,
    skillStructuredData,
    crawlerFiles,
  })
}

export type PublishingMetadata = ReturnType<typeof createPublishingMetadata>
