import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-9 w-40" />

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Left — checkout form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section: Contact */}
          <div className="rounded-xl border p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Section: Shipping address */}
          <div className="rounded-xl border p-6 space-y-4">
            <Skeleton className="h-6 w-44" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
          </div>

          {/* Section: Payment */}
          <div className="rounded-xl border p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border p-5 space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
            <Skeleton className="h-px w-full" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
