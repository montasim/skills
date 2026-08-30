import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const visiblePlatformLimit = 2

const platformLabels: Record<string, string> = {
  "OpenAI Codex": "Codex",
  "Claude Code": "Claude Code",
  "Gemini CLI": "Gemini CLI",
  "Google Antigravity": "Antigravity",
  "Antigravity CLI": "Antigravity CLI",
  Cursor: "Cursor",
  "GitHub Copilot": "GitHub Copilot",
  OpenCode: "OpenCode",
}

function platformLabel(platform: string) {
  return platformLabels[platform] ?? platform
}

function platformBadgeClass(platform: string) {
  if (platform === "OpenAI Codex") {
    return "border-ink/25 bg-ink/7 text-ink"
  }

  if (platform === "Claude Code") {
    return "border-brand/25 bg-brand-soft/55 text-brand"
  }

  return "border-ink/15 bg-fog/70 text-ink/80"
}

type SkillPlatformBadgesProps = {
  platforms: readonly string[]
  className?: string
}

export function SkillPlatformBadges({
  platforms,
  className,
}: SkillPlatformBadgesProps) {
  const visiblePlatforms = platforms.slice(0, visiblePlatformLimit)
  const remainingPlatforms = platforms.slice(visiblePlatformLimit)
  const remainingLabel = `+${remainingPlatforms.length} ${
    remainingPlatforms.length === 1 ? "platform" : "platforms"
  }`

  return (
    <div className={cn("border-t border-ink/10 pt-4", className)}>
      <p className="font-mono text-meta tracking-[0.14em] text-ink/55 uppercase">
        Documented format
      </p>
      <ul
        className="mt-2 flex flex-wrap gap-1.5"
        aria-label="Hosts with documented format compatibility"
      >
        {visiblePlatforms.map((platform) => (
          <li key={platform}>
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-meta font-medium tracking-[0.08em] uppercase",
                platformBadgeClass(platform)
              )}
            >
              {platformLabel(platform)}
            </Badge>
          </li>
        ))}
        {remainingPlatforms.length ? (
          <li>
            <Badge
              variant="outline"
              className="border-ink/18 bg-white font-mono text-meta font-medium tracking-[0.08em] text-ink/65 uppercase"
              title={`Also documented for ${remainingPlatforms.join(", ")}`}
              aria-label={`Also documented for ${remainingPlatforms.join(", ")}`}
            >
              {remainingLabel}
            </Badge>
          </li>
        ) : null}
      </ul>
    </div>
  )
}
