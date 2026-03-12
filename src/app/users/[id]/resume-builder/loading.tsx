import { Skeleton } from '@/components/ui/skeleton'

export default function ResumeBuilderLoading() {
  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-0">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* Split panel */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Left: Editor */}
        <div className="space-y-4 overflow-hidden">
          {/* Tab bar */}
          <Skeleton className="h-9 w-full rounded-lg" />

          {/* Section heading */}
          <Skeleton className="h-3 w-40" />

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>

          {/* Experience card */}
          <div className="bg-accent space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-6 rounded-md" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="bg-accent flex flex-col overflow-hidden rounded-lg border">
          {/* Toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
            <div className="flex gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>

          {/* Resume preview skeleton */}
          <div className="flex-1 overflow-hidden p-4">
            <div className="mx-auto max-w-[520px] space-y-4 rounded bg-white p-8 shadow-md">
              {/* Header section */}
              <div className="flex justify-between border-b pb-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-40 bg-gray-200" />
                  <Skeleton className="h-3 w-28 bg-gray-100" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="ml-auto h-2.5 w-32 bg-gray-100" />
                  <Skeleton className="ml-auto h-2.5 w-24 bg-gray-100" />
                  <Skeleton className="ml-auto h-2.5 w-20 bg-gray-100" />
                </div>
              </div>
              {/* Experience */}
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-24 bg-gray-200" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-2.5 w-full bg-gray-100" />
                    <Skeleton className="h-2 w-3/4 bg-gray-100" />
                  </div>
                ))}
              </div>
              {/* Skills */}
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-16 bg-gray-200" />
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-14 rounded-sm bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI toast */}
          <div className="mx-4 mb-4 shrink-0 rounded-lg border bg-background p-3">
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-7 w-16 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
