import { BrandMark } from "@/components/brand-mark"

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 px-5 py-9 text-sm sm:flex-row lg:px-10">
        <p className="flex items-center gap-2 font-heading font-bold">
          <BrandMark className="size-7" /> SKILLFOLIO © 2026
        </p>
        <p className="text-ink/60">
          Reusable AI agent skills for real-world work.
        </p>
      </div>
    </footer>
  )
}
