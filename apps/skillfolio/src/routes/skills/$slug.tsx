import { createFileRoute } from "@tanstack/react-router"

import { SkillDetailFrame } from "@/components/skill-detail-frame"
import { SkillDetailPending } from "@/components/skill-detail-pending"
import { publishing, site } from "@/lib/site"
import { skillCatalog } from "@/lib/skills"

export const Route = createFileRoute("/skills/$slug")({
  head: ({ params }) => {
    const skill = skillCatalog.find(params.slug)
    if (!skill) return { meta: [{ title: `Skill not found - ${site.name}` }] }

    const path = `/skills/${skill.slug}`
    const title = `${skill.name} - ${site.name}`
    return {
      meta: publishing.pageMeta({
        title,
        description: skill.description,
        path,
        type: "article",
      }),
      links: [{ rel: "canonical", href: publishing.absoluteUrl(path) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(publishing.skillStructuredData(skill)),
        },
      ],
    }
  },
  pendingComponent: SkillDetailPending,
  pendingMs: 100,
  pendingMinMs: 300,
  component: SkillPage,
})

function SkillPage() {
  const { slug } = Route.useParams()
  const skill = skillCatalog.find(slug)
  return (
    <SkillDetailFrame
      state={skill ? { status: "ready", skill } : { status: "missing" }}
    />
  )
}
