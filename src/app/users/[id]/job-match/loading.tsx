import { Skeleton } from '@/components/ui/skeleton'

export default function JobMatchLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48" />

      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Split panel */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Left: Resume viewer */}
        <div className="bg-accent space-y-4 rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          {/* Upload / preview area */}
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>

          {/* Job description textarea */}
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Right: ATS analysis */}
        <div className="space-y-4">
          {/* Score circle */}
          <div className="bg-accent rounded-xl border p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Skeleton className="h-9 w-full rounded-lg" />

          {/* Keyword list */}
          <div className="bg-accent space-y-3 rounded-xl border p-4">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="bg-accent space-y-3 rounded-xl border p-4">
            <Skeleton className="h-4 w-36" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
