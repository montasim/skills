import { SkillDetailLayout } from "@/components/skill-detail-layout"
import { ReadmeSkeleton } from "@/components/readme-skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkillDetailPending() {
  return (
    <SkillDetailLayout
      label="Loading skill"
      hero={
        <div>
          <Skeleton className="mb-8 h-4 w-28" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-5 h-14 w-3/4" />
          <Skeleton className="mt-6 h-5 w-full max-w-2xl" />
          <Skeleton className="mt-3 h-5 w-4/5 max-w-xl" />
        </div>
      }
      install={
        <Card className="gap-0 rounded-none border border-brand/25 bg-brand-soft/45 py-0 shadow-[0_18px_40px_-28px_rgba(32,36,44,0.42)] ring-0">
          <CardHeader className="p-6 pb-0">
            <Skeleton className="h-4 w-36 bg-ink/15" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-20 w-full rounded-none bg-ink/20" />
            <Skeleton className="mt-4 h-12 w-full rounded-none bg-white" />
          </CardContent>
        </Card>
      }
      sidebar={
        <aside className="hidden space-y-4 lg:block">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-0.5 w-full bg-ink" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </aside>
      }
      document={
        <article className="min-w-0 overflow-hidden rounded-none border border-ink/30 bg-white shadow-[0_18px_40px_-28px_rgba(32,36,44,0.42)]">
          <header className="flex items-center gap-3 border-b border-ink/20 bg-paper px-5 py-4 sm:px-7">
            <Skeleton className="size-9" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-36" />
            </div>
          </header>
          <ReadmeSkeleton />
        </article>
      }
    />
  )
}
