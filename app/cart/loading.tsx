import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-9 w-32" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border p-4">
              <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex items-center gap-3 pt-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="rounded-xl border p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
