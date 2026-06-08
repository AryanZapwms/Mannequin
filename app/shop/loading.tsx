import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filter skeleton */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <Skeleton className="h-6 w-24" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
          <Skeleton className="h-10 w-full rounded-md mt-4" />
        </aside>

        {/* Products grid skeleton */}
        <div className="flex-1">
          {/* Sort + count bar */}
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
