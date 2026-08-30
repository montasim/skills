import type { ReactNode } from "react"

type SkillDetailLayoutProps = {
  label?: string
  hero: ReactNode
  install: ReactNode
  sidebar: ReactNode
  document: ReactNode
}

export function SkillDetailLayout({
  label,
  hero,
  install,
  sidebar,
  document,
}: SkillDetailLayoutProps) {
  return (
    <main aria-label={label}>
      <section className="border-b border-ink/20">
        <div className="mx-auto grid max-w-[1380px] items-end gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16 lg:px-10 lg:py-14">
          {hero}
          {install}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1380px] items-start gap-8 px-5 py-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:py-16">
        {sidebar}
        {document}
      </section>
    </main>
  )
}
