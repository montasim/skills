import { useEffect, useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { ReadmeSkeleton } from "@/components/readme-skeleton"
import { Button } from "@/components/ui/button"
import { RefreshIcon, WarningCircleIcon } from "@/components/ui/icons"
import type { Skill } from "@/lib/skills"

type SkillReadmeProps = { skill: Skill }

type ReadmeState =
  | { status: "loading" }
  | { status: "ready"; markdown: string }
  | { status: "error"; message: string }

function resolveUrl(value: string | undefined, skill: Skill, image = false) {
  if (
    !value ||
    /^(https?:|mailto:|data:)/i.test(value) ||
    value.startsWith("#")
  )
    return value
  const path = value.replace(/^\.?\//, "")
  const baseUrl = image ? skill.rawContentBaseUrl : skill.sourceContentBaseUrl
  return `${baseUrl}/${path}`
}

function markdownComponents(skill: Skill): Components {
  return {
    h1: ({ children }) => (
      <h1 className="mt-0 mb-6 border-b border-ink/20 pb-4 font-heading text-xl leading-[1.35] font-semibold tracking-tight text-ink sm:text-2xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 mb-4 border-b border-ink/15 pb-3 font-heading text-lg leading-tight font-semibold tracking-tight text-ink sm:text-xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 font-heading text-base leading-tight font-semibold text-ink sm:text-lg">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-2 font-heading text-base font-semibold text-ink">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="my-4 leading-7 text-ink-muted">{children}</p>
    ),
    a: ({ href, children }) => (
      <a
        href={resolveUrl(href, skill)}
        target={href?.startsWith("#") ? undefined : "_blank"}
        rel={href?.startsWith("#") ? undefined : "noreferrer"}
        className="font-medium text-brand underline decoration-1 underline-offset-4 hover:text-brand-bright"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-5 border border-brand-soft bg-paper px-5 py-3 text-ink/70 [&>p]:my-0">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className="my-4 list-disc space-y-1 pl-6 text-ink-muted marker:text-brand-bright">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 list-decimal space-y-1 pl-6 text-ink-muted marker:font-mono marker:text-brand">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-bold text-ink">{children}</strong>
    ),
    code: ({ className, children }) => (
      <code
        className={`rounded-none bg-fog px-1.5 py-0.5 font-mono text-[0.86em] text-ink ${className ?? ""}`}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-5 overflow-x-auto border-2 border-ink bg-ink p-5 font-mono text-sm leading-7 text-paper shadow-[4px_4px_0_var(--color-brand-soft)] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-ink text-white">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-ink/15">{children}</tbody>
    ),
    tr: ({ children }) => <tr className="even:bg-paper">{children}</tr>,
    th: ({ children }) => (
      <th className="border border-ink/20 p-3 align-top font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-ink/20 p-3 align-top leading-6">
        {children}
      </td>
    ),
    img: ({ src, alt }) => (
      <img
        src={resolveUrl(src, skill, true)}
        alt={alt ?? ""}
        loading="lazy"
        className="my-1 inline-block h-auto max-w-full"
      />
    ),
    hr: () => <hr className="my-12 border-0 border-t-2 border-ink" />,
  }
}

export function SkillReadme({ skill }: SkillReadmeProps) {
  const [state, setState] = useState<ReadmeState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)
  const components = useMemo(() => markdownComponents(skill), [skill])

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: "loading" })
    fetch(skill.readmeUrl, {
      headers: { Accept: "text/plain" },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
        return response.text()
      })
      .then((markdown) => setState({ status: "ready", markdown }))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError")
          return
        setState({
          status: "error",
          message:
            reason instanceof Error
              ? reason.message
              : "The README could not be loaded",
        })
      })
    return () => controller.abort()
  }, [attempt, skill.readmeUrl])

  if (state.status === "error") {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="grid size-14 place-items-center border-2 border-ink bg-brand-soft text-brand">
          <WarningCircleIcon />
        </span>
        <h2 className="mt-5 font-heading text-lg font-semibold sm:text-xl">
          README unavailable.
        </h2>
        <p className="mt-3 max-w-lg text-ink/60">
          {state.message}. Check the connection or open the source directly on
          GitHub.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            className="h-10 border-2 border-ink bg-white hover:bg-brand-soft"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RefreshIcon /> Retry
          </Button>
          <Button asChild className="h-10 border-2 border-ink">
            <a href={skill.repository} target="_blank" rel="noreferrer">
              Open GitHub
            </a>
          </Button>
        </div>
      </div>
    )
  }

  if (state.status === "loading") {
    return <ReadmeSkeleton />
  }

  return (
    <div className="w-full min-w-0 p-6 sm:p-10 lg:p-12">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
      >
        {state.markdown}
      </ReactMarkdown>
    </div>
  )
}
