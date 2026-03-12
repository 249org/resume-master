import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyzerHistoryLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      {/* Controls: search + filters + upload */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="ml-auto h-9 w-36 rounded-md" />
      </div>

      {/* Table card */}
      <div className="bg-accent overflow-hidden rounded-xl border">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="h-4 w-4 rounded" />
          {[100, 80, 60, 70, 60, 60, 40].map((w, i) => (
            <Skeleton key={i} className={`h-4 w-${w === 100 ? 'full' : w} flex-1`} />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
            <Skeleton className="h-4 w-4 shrink-0 rounded" />
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-3 flex-1 max-w-[120px]" />
            <Skeleton className="h-3 flex-1 max-w-[80px]" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
