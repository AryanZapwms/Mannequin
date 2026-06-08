import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Featured post */}
      <div className="mb-10 overflow-hidden rounded-2xl border">
        <Skeleton className="h-72 w-full" />
        <div className="p-6 space-y-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Post grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            <Skeleton className="h-44 w-full" />
            <div className="p-5 space-y-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
