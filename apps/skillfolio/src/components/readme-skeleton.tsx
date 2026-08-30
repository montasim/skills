import { Skeleton } from "@/components/ui/skeleton"

export function ReadmeSkeleton() {
  return (
    <div className="space-y-5 p-6 sm:p-10 lg:p-12" aria-label="Loading README">
      <div className="border-b border-ink/20 pb-4">
        <Skeleton className="h-10 w-3/4 sm:w-1/2" />
      </div>
      <div className="border border-brand-soft bg-paper p-5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-3 h-4 w-4/5" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-28 w-full rounded-none bg-ink/15" />
      <div className="border-b border-ink/15 pt-8 pb-3">
        <Skeleton className="h-9 w-2/5" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
