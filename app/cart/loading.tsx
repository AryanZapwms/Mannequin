import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero skeleton */}
      <div className="w-full bg-brand-cream bg-glow-gold">
        <div className="mx-auto max-w-[760px] px-6 py-[clamp(48px,6vw,80px)] text-center">
          <Skeleton className="mx-auto mb-4 h-4 w-32 bg-brand-sand/50" />
          <Skeleton className="mx-auto h-10 w-64 bg-brand-sand/50" />
          <Skeleton className="mx-auto mt-4 h-5 w-80 bg-brand-sand/50" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-[clamp(40px,6vw,80px)] sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
            {/* Cart items skeleton */}
            <div className="rounded-card border border-brand-sand bg-white p-4 shadow-soft sm:p-6 lg:p-8">
              <div className="mb-5 flex items-center justify-between border-b border-brand-sand pb-4">
                <Skeleton className="h-7 w-32 bg-brand-sand/50" />
                <Skeleton className="h-6 w-16 rounded-full bg-brand-gold-100/50" />
              </div>
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 border-b border-brand-sand/60 pb-5 last:border-b-0 last:pb-0">
                    <Skeleton className="h-20 w-20 shrink-0 rounded-thumb bg-brand-sand/40 sm:h-28 sm:w-28" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 bg-brand-sand/40" />
                      <Skeleton className="h-4 w-1/3 bg-brand-sand/40" />
                      <div className="flex items-center gap-2 pt-1">
                        <Skeleton className="h-8 w-8 rounded-lg bg-brand-sand/40" />
                        <Skeleton className="h-8 w-10 bg-brand-sand/40" />
                        <Skeleton className="h-8 w-8 rounded-lg bg-brand-sand/40" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Skeleton className="h-5 w-16 bg-brand-sand/40" />
                      <Skeleton className="h-7 w-7 rounded bg-brand-sand/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary skeleton */}
            <div className="rounded-card border border-brand-sand bg-white p-5 shadow-card sm:p-6">
              <Skeleton className="h-7 w-40 bg-brand-sand/50" />
              <div className="mt-5 space-y-3 border-b border-brand-sand pb-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20 bg-brand-sand/40" />
                    <Skeleton className="h-4 w-16 bg-brand-sand/40" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-5">
                <Skeleton className="h-5 w-28 bg-brand-sand/50" />
                <Skeleton className="h-7 w-24 bg-brand-sand/50" />
              </div>
              <Skeleton className="h-12 w-full rounded bg-brand-gold-100/60" />
              <Skeleton className="mt-3 h-12 w-full rounded bg-brand-sand/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
