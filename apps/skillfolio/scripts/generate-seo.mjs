import { writeFileSync } from "node:fs"

import {
  createPublishingMetadata,
  createSiteIdentity,
} from "../src/lib/publishing.ts"
import { skillCatalog } from "../src/lib/skills.ts"

const site = createSiteIdentity(process.env.VITE_SITE_URL)
const publishing = createPublishingMetadata(site, skillCatalog)
const { sitemap, robots } = publishing.crawlerFiles()

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), sitemap)
writeFileSync(new URL("../public/robots.txt", import.meta.url), robots)
