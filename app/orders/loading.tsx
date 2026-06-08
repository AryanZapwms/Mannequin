import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-9 w-40" />

      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex items-center gap-3">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-14 w-14 rounded-lg" />
              ))}
              <div className="flex-1 text-right">
                <Skeleton className="ml-auto h-5 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
