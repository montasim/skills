import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"

import { SkillPlatformBadges } from "@/components/skill-platform-badges"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  FileDocIcon,
  GithubLogoIcon,
  LayersIcon,
  SearchIcon,
  SearchXIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { skillCatalog } from "@/lib/skills"
import { publishing, site } from "@/lib/site"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: publishing.pageMeta({
      title: site.title,
      description: site.description,
    }),
    links: [{ rel: "canonical", href: publishing.absoluteUrl("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(publishing.homeStructuredData()),
      },
    ],
  }),
  component: App,
})

const categories = skillCatalog.categories()

function App() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")

  const visibleSkills = skillCatalog.discover({ query, category })
  const featuredSkill = skillCatalog.featured()
  const catalogSummary = skillCatalog.summary()

  return (
    <main>
      <section className="border-b-2 border-ink/10">
        <div className="mx-auto grid max-w-[1440px] items-stretch gap-12 px-5 py-12 sm:py-16 lg:grid-cols-[1.12fr_.88fr] lg:gap-16 lg:px-10 lg:py-16 xl:gap-24">
          <div className="flex animate-in flex-col justify-center duration-700 fade-in slide-in-from-bottom-3 motion-reduce:animate-none">
            <p
              className="mb-4 font-mono text-eyebrow tracking-[0.18em] text-brand uppercase"
              style={{ fontSize: "0.8696875rem" }}
            >
              Montasim&apos;s agent skill portfolio / 2026
            </p>
            <h1
              className="max-w-[850px] font-heading text-display font-semibold"
              style={{ fontSize: "2.371875rem" }}
            >
              Small files.
              <br />
              <span className="text-brand">Serious leverage.</span>
            </h1>
            <p
              className="mt-6 max-w-xl text-base leading-7"
              style={{ fontSize: "1.265rem" }}
            >
              A curated portfolio of skills that teach AI agents how to do one
              job exceptionally well.
            </p>
            <Button
              asChild
              variant="ghost"
              className="mt-6 h-auto w-fit gap-4 p-0 font-heading text-sm font-bold tracking-wider hover:bg-transparent"
              style={{ fontSize: "1.106875rem" }}
            >
              <a href="#library">
                EXPLORE THE SHELF
                <span className="grid size-11 place-items-center border-2 border-ink bg-brand-bright text-white transition-transform group-hover/button:translate-y-1">
                  <ArrowDownIcon className="size-4" />
                </span>
              </a>
            </Button>
          </div>

          <Card className="animate-in gap-0 rounded-none border border-ink/30 bg-white py-0 shadow-[0_18px_40px_-28px_rgba(32,36,44,0.42)] ring-0 duration-700 [animation-delay:140ms] [animation-fill-mode:both] fade-in slide-in-from-bottom-3 motion-reduce:animate-none">
            <CardHeader className="p-6 sm:p-8">
              <div>
                <Badge
                  variant="outline"
                  className="rounded-none border-brand/25 bg-brand-soft/55 font-mono text-meta font-normal tracking-[0.16em] text-brand"
                >
                  QUICK STATS
                </Badge>
                <CardTitle className="mt-4 text-xl">Library snapshot</CardTitle>
              </div>
              <CardAction>
                <Badge className="rounded-none border border-ink/20 bg-ink font-mono text-meta tracking-widest text-white">
                  2026
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-6 pb-6 sm:px-8 sm:pb-8">
              <dl className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Skills published",
                    value: String(catalogSummary.total).padStart(2, "0"),
                    Icon: FileDocIcon,
                  },
                  {
                    label: "Disciplines",
                    value: String(catalogSummary.categories).padStart(2, "0"),
                    Icon: LayersIcon,
                  },
                  {
                    label: "Stable releases",
                    value: String(catalogSummary.stable).padStart(2, "0"),
                    Icon: ShieldCheckIcon,
                  },
                  {
                    label: "Status",
                    value: "Growing",
                    Icon: TrendingUpIcon,
                  },
                ].map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="border border-ink/15 bg-paper/60 p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <dt className="font-mono text-meta tracking-[0.16em] text-ink/50 uppercase">
                        {label}
                      </dt>
                      <Icon className="size-4 text-brand" aria-hidden="true" />
                    </div>
                    <dd className="mt-2 font-heading text-2xl font-semibold">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                to="/skills/$slug"
                params={{ slug: featuredSkill.slug }}
                className="group mt-6 flex items-center justify-between gap-4 border border-ink/15 p-4 transition-colors hover:border-brand hover:bg-brand-soft/30"
              >
                <span>
                  <span className="block font-mono text-meta tracking-[0.16em] text-brand uppercase">
                    Featured now
                  </span>
                  <span className="mt-1 block font-semibold">
                    {featuredSkill.name}
                  </span>
                </span>
                <span className="grid size-10 shrink-0 place-items-center border border-ink/30 bg-brand-soft/55 transition-transform group-hover:translate-x-1">
                  <ArrowRightIcon className="size-4" />
                </span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        id="library"
        className="mx-auto max-w-[1440px] scroll-mt-20 px-5 py-16 lg:px-10 lg:py-24"
      >
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 font-mono text-eyebrow tracking-[0.18em] text-brand uppercase">
              The working shelf
            </p>
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-section-title">
              Choose a capability.
            </h2>
          </div>
          <label className="relative block w-full lg:w-80">
            <span className="sr-only">Search skills</span>
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the shelf..."
              className="h-12 rounded-none border border-ink/30 bg-white pr-11 font-mono shadow-none focus-visible:border-brand/70 focus-visible:ring-brand-soft"
            />
            <SearchIcon className="absolute top-1/2 right-4 size-4 -translate-y-1/2" />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" aria-label="Filter skills">
          {["All", ...categories].map((item) => (
            <Button
              key={item}
              type="button"
              variant={category === item ? "default" : "outline"}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={
                category === item
                  ? "rounded-none border border-ink/30 bg-ink px-4 text-white"
                  : "rounded-none border border-ink/25 bg-white px-4 text-ink/80 hover:border-ink/40 hover:bg-brand-soft/55"
              }
            >
              {item}
            </Button>
          ))}
        </div>

        {visibleSkills.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleSkills.map((skill) => (
              <Card
                key={skill.slug}
                className="min-h-[350px] gap-0 rounded-none border border-ink/30 bg-white py-0 shadow-[0_14px_30px_-24px_rgba(32,36,44,0.42)] ring-0 transition-all hover:-translate-y-0.5 hover:border-ink/45 hover:shadow-[0_18px_36px_-24px_rgba(32,36,44,0.5)]"
              >
                <CardHeader className="border-b border-ink/20 p-6">
                  <div className="grid size-14 place-items-center border border-ink/35 bg-paper font-heading text-lg font-semibold text-ink/85">
                    {skill.mark}
                  </div>
                  <CardAction>
                    <Badge
                      variant="outline"
                      className="rounded-none border-ink/30 font-mono text-meta font-normal tracking-wider text-ink/75 uppercase"
                    >
                      {skill.status} · v{skill.version}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-eyebrow tracking-widest text-brand uppercase">
                    {skill.category}
                  </p>
                  <CardTitle className="mt-2 text-lg tracking-tight">
                    {skill.name}
                  </CardTitle>
                  <CardDescription className="mt-3 leading-relaxed text-ink/65">
                    {skill.summary}
                  </CardDescription>
                  <SkillPlatformBadges
                    platforms={skill.compatibility}
                    className="mt-5"
                  />
                  <div className="mt-auto flex items-center justify-between gap-5 pt-8">
                    <Button asChild variant="link" className="h-auto p-0">
                      <Link to="/skills/$slug" params={{ slug: skill.slug }}>
                        View skill <ArrowRightIcon />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="link"
                      className="h-auto p-0 text-ink/65 hover:text-brand"
                    >
                      <a
                        href={skill.repository}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <GithubLogoIcon /> GitHub source
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card
            role="status"
            aria-live="polite"
            className="mt-10 gap-0 rounded-none border border-ink/30 bg-white py-0 shadow-[0_14px_30px_-24px_rgba(32,36,44,0.42)] ring-0"
          >
            <CardContent className="flex min-h-56 flex-col items-start gap-8 p-6 sm:p-8 md:flex-row md:items-center md:justify-between lg:p-10">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="grid size-14 shrink-0 place-items-center border-2 border-ink bg-brand-soft text-brand">
                  <SearchXIcon className="size-6" />
                </div>
                <div>
                  <p className="font-mono text-eyebrow tracking-[0.18em] text-brand uppercase">
                    No matches
                  </p>
                  <h3 className="mt-2 font-heading text-lg font-semibold tracking-tight">
                    Nothing on this shelf yet.
                  </h3>
                  <p className="mt-2 text-ink/60">
                    Try another keyword or reset the shelf.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-11 rounded-none border-2 border-ink bg-white px-5 hover:bg-brand-soft"
                onClick={() => {
                  setQuery("")
                  setCategory("All")
                }}
              >
                Reset shelf
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section
        id="principles"
        className="scroll-mt-16 border-y-2 border-ink bg-ink text-paper"
      >
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.75fr_1.25fr]">
          <div className="border-b-2 border-paper/20 p-8 lg:border-r-2 lg:border-b-0 lg:p-14">
            <p className="font-mono text-eyebrow tracking-[0.18em] text-brand-soft uppercase">
              What makes the cut
            </p>
            <h2 className="mt-4 font-heading text-xl font-semibold tracking-tight sm:text-section-title">
              Built from work,
              <br />
              not theory.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3">
            {[
              [
                "01",
                "Specific",
                "One clear job, with boundaries that keep the agent focused.",
              ],
              [
                "02",
                "Tested",
                "Shaped by real repositories, edge cases, and revision.",
              ],
              [
                "03",
                "Portable",
                "Useful across projects without losing its point of view.",
              ],
            ].map(([number, title, description]) => (
              <article
                key={title}
                className="border-b border-paper/20 p-8 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0 lg:p-10"
              >
                <span className="font-mono text-brand-bright">{number}</span>
                <h3 className="mt-8 font-heading text-lg font-semibold">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/65">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
