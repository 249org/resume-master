import { Skeleton } from '@/components/ui/skeleton'

export default function ResumesLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-9 w-64 rounded-md" />

      {/* Resume card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-accent flex flex-col overflow-hidden rounded-xl border">
            {/* Thumbnail area */}
            <Skeleton className="h-36 w-full rounded-none" />

            {/* Card body */}
            <div className="space-y-2 px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="ml-auto h-3 w-20" />
              </div>
            </div>

            {/* Action row */}
            <div className="flex border-t">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex flex-1 items-center justify-center py-2.5">
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
