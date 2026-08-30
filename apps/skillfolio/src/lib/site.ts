import { createPublishingMetadata, createSiteIdentity } from "@/lib/publishing"
import { skillCatalog } from "@/lib/skills"

const configuredUrl = import.meta.env.VITE_SITE_URL as string | undefined

export const site = createSiteIdentity(configuredUrl)
export const publishing = createPublishingMetadata(site, skillCatalog)
