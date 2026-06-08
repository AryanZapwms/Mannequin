import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-9 w-40" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
