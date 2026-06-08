import { Skeleton } from "@/components/ui/skeleton";

export default function OrderConfirmationLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <Skeleton className="mx-auto mb-6 h-20 w-20 rounded-full" />
      <Skeleton className="mx-auto mb-3 h-9 w-64" />
      <Skeleton className="mx-auto mb-8 h-5 w-80" />

      <div className="rounded-xl border p-6 text-left space-y-4">
        <Skeleton className="h-6 w-40" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Skeleton className="h-11 w-36 rounded-lg" />
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
    </div>
  );
}
