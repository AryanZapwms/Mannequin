import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="rounded-xl border">
        <div className="flex items-center justify-between border-b p-5">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="p-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
