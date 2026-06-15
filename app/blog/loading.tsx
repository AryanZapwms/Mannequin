import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="w-full bg-brand-cream bg-glow-gold">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center px-6 pb-10 pt-[clamp(40px,6vw,72px)]">
          <Skeleton className="mb-4 h-4 w-28 bg-brand-sand/50" />
          <Skeleton className="mb-4 h-12 w-56 bg-brand-sand/50" />
          <Skeleton className="h-5 w-80 max-w-full bg-brand-sand/50" />
        </div>
      </section>

      <section className="w-full pb-[clamp(56px,8vw,120px)]">
        <div className="mx-auto max-w-[1160px] px-6">
          {/* Featured post */}
          <div className="mb-14 grid overflow-hidden rounded-feature border border-brand-sand bg-white shadow-soft lg:grid-cols-2">
            <Skeleton className="aspect-video w-full bg-brand-linen lg:aspect-auto lg:min-h-[340px]" />
            <div className="space-y-3 p-8 lg:p-10">
              <Skeleton className="h-5 w-24 rounded-full bg-brand-linen" />
              <Skeleton className="h-8 w-3/4 bg-brand-linen" />
              <Skeleton className="h-4 w-full bg-brand-linen" />
              <Skeleton className="h-4 w-2/3 bg-brand-linen" />
              <Skeleton className="h-4 w-32 bg-brand-linen" />
            </div>
          </div>

          {/* Post grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-card border border-brand-sand bg-white shadow-soft"
              >
                <Skeleton className="aspect-video w-full bg-brand-linen" />
                <div className="space-y-2 p-6">
                  <Skeleton className="h-4 w-20 rounded-full bg-brand-linen" />
                  <Skeleton className="h-5 w-3/4 bg-brand-linen" />
                  <Skeleton className="h-4 w-full bg-brand-linen" />
                  <Skeleton className="h-4 w-24 bg-brand-linen" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
