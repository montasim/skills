import { Link } from "@tanstack/react-router"

import { CopyButton } from "@/components/copy-button"
import { SkillDetailLayout } from "@/components/skill-detail-layout"
import { SkillReadme } from "@/components/skill-readme"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeftIcon,
  DiamondIcon,
  ExternalLinkIcon,
  FileDocIcon,
  GithubLogoIcon,
  PackageCheckIcon,
} from "@/components/ui/icons"
import { Separator } from "@/components/ui/separator"
import type { Skill } from "@/lib/skills"

type SkillDetailState =
  { status: "missing" } | { status: "ready"; skill: Skill }

function MissingSkillDetail() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-start justify-center px-5 py-20 lg:px-10">
      <p className="font-mono text-eyebrow tracking-[0.18em] text-brand uppercase">
        Skill not found
      </p>
      <h1 className="mt-4 max-w-3xl font-heading text-xl leading-tight font-semibold tracking-tight sm:text-page-title">
        Nothing lives at this slug.
      </h1>
      <Button asChild variant="link" className="mt-6 h-auto p-0">
        <Link to="/">
          <ArrowLeftIcon /> Back to the library
        </Link>
      </Button>
    </main>
  )
}

function ReadySkillDetail({ skill }: { skill: Skill }) {
  return (
    <SkillDetailLayout
      hero={
        <div>
          <Button
            asChild
            variant="link"
            className="mb-8 h-auto p-0 font-mono text-meta tracking-wider uppercase"
          >
            <Link to="/" hash="library">
              <ArrowLeftIcon /> Back to library
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-eyebrow tracking-wider text-brand uppercase">
              {skill.category}
            </span>
            <span className="font-mono text-eyebrow">v{skill.version}</span>
            <Badge
              variant="outline"
              className="rounded-none border-ink/30 bg-white font-mono text-meta tracking-wider text-ink/75 uppercase"
            >
              {skill.status}
            </Badge>
          </div>
          <h1 className="mt-5 max-w-3xl font-heading text-xl leading-tight font-semibold tracking-tight sm:text-page-title">
            {skill.name}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-ink/70">
            {skill.summary}
          </p>
        </div>
      }
      install={
        <Card className="animate-in gap-0 rounded-none border border-brand/25 bg-brand-soft/45 py-0 shadow-[0_18px_40px_-28px_rgba(32,36,44,0.42)] ring-0 duration-500 fade-in slide-in-from-right-3 motion-reduce:animate-none">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 font-mono text-meta tracking-widest uppercase">
                <PackageCheckIcon className="size-4" />{" "}
                {skill.packageUrl ? "Install from npm" : "Install skill"}
              </CardTitle>
              <Badge
                variant="outline"
                className="rounded-none border-ink/25 bg-white/80 font-mono text-meta text-ink/75"
              >
                v{skill.version}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <code className="block bg-ink p-4 font-mono text-xs leading-relaxed break-all text-white">
              {skill.installCommand}
            </code>
            <CopyButton
              value={skill.installCommand}
              label="Copy install command"
              className="mt-4 h-12 w-full rounded-none border border-ink/30 bg-white text-ink hover:border-brand/40 hover:bg-white/75"
            >
              Copy install command
            </CopyButton>
          </CardContent>
        </Card>
      }
      sidebar={
        <aside className="lg:sticky lg:top-24">
          <p className="font-mono text-meta tracking-[0.18em] text-ink/45 uppercase">
            Repository
          </p>
          <Separator className="mt-4 h-0.5 bg-ink" />
          <dl className="divide-y divide-ink/15 text-sm">
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-ink/55">Owner</dt>
              <dd className="font-semibold">{skill.repositoryOwner}</dd>
            </div>
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-ink/55">Branch</dt>
              <dd className="font-mono text-xs">{skill.branch}</dd>
            </div>
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-ink/55">Document</dt>
              <dd className="font-mono text-xs">README.md</dd>
            </div>
            {skill.package && skill.packageUrl ? (
              <div className="flex justify-between gap-4 py-4">
                <dt className="text-ink/55">Package</dt>
                <dd className="min-w-0 text-right font-mono text-xs">
                  <a
                    href={skill.packageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline decoration-ink/25 underline-offset-4 hover:text-brand"
                  >
                    {skill.package}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {skill.packageUrl ? (
            <Button
              asChild
              variant="outline"
              className="mt-5 h-11 w-full justify-between rounded-none border-2 border-ink bg-white hover:bg-ink hover:text-white"
            >
              <a href={skill.packageUrl} target="_blank" rel="noreferrer">
                <PackageCheckIcon /> View on npm
                <ExternalLinkIcon className="size-3" />
              </a>
            </Button>
          ) : null}
          <Button
            asChild
            variant="outline"
            className={`${skill.packageUrl ? "mt-3" : "mt-5"} h-11 w-full justify-between rounded-none border-2 border-ink bg-white hover:bg-ink hover:text-white`}
          >
            <a href={skill.repository} target="_blank" rel="noreferrer">
              <GithubLogoIcon /> View on GitHub
              <ExternalLinkIcon className="size-3" />
            </a>
          </Button>
          {skill.hostEvidence ? (
            <div className="mt-8">
              <p className="font-mono text-meta tracking-[0.18em] text-ink/45 uppercase">
                Compatibility evidence
              </p>
              <Separator className="mt-4 bg-ink/20" />
              <dl className="divide-y divide-ink/15 text-sm">
                <div className="py-3">
                  <dt className="text-ink/55">Format</dt>
                  <dd className="mt-1 leading-6 font-medium">
                    {skill.hostEvidence.format}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-ink/55">Installer tested</dt>
                  <dd className="mt-1 leading-6">
                    {skill.hostEvidence.installerTested.join(", ")}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-ink/55">Runtime verified</dt>
                  <dd className="mt-1 leading-6">
                    {skill.hostEvidence.runtimeVerified.join(", ")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink/55">Audited</dt>
                  <dd className="font-mono text-xs">
                    {skill.hostEvidence.auditedOn}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
          <div className="mt-8 hidden lg:block">
            <p className="font-mono text-meta tracking-[0.18em] text-ink/45 uppercase">
              Good for
            </p>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              {skill.uses.map((use) => (
                <li key={use} className="flex gap-2">
                  <DiamondIcon className="mt-0.5 size-3 shrink-0 text-brand-bright" />
                  {use}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      }
      document={
        <article className="min-w-0 overflow-hidden rounded-none border border-ink/30 bg-white shadow-[0_18px_40px_-28px_rgba(32,36,44,0.42)]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/20 bg-paper px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center border border-brand/25 bg-brand-soft/55 text-brand">
                <FileDocIcon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">README.md</p>
                <p className="font-mono text-meta tracking-wider text-ink/45 uppercase">
                  GitHub source · {skill.branch}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="link"
              className="h-auto p-0 font-mono text-meta tracking-wider uppercase"
            >
              <a href={skill.readmeSourceUrl} target="_blank" rel="noreferrer">
                View source <ExternalLinkIcon className="size-3" />
              </a>
            </Button>
          </header>
          <SkillReadme skill={skill} />
        </article>
      }
    />
  )
}

export function SkillDetailFrame({ state }: { state: SkillDetailState }) {
  if (state.status === "missing") return <MissingSkillDetail />
  return <ReadySkillDetail skill={state.skill} />
}
