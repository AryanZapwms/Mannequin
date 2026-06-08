import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery skeleton */}
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-3/4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-16 line-through" />
          </div>
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 flex-1 rounded-lg" />
            <Skeleton className="h-11 w-11 rounded-lg" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
