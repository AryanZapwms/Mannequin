import { forwardRef } from "react";
import Image from "next/image";
import type { BrochurePage } from "./flipbook-data";

type FlipbookPageProps = {
  page: BrochurePage;
};

const edgeRing = "pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5";

const FlipbookPage = forwardRef<HTMLDivElement, FlipbookPageProps>(({ page }, ref) => {
  if (page.type === "cover") {
    return (
      <div
        ref={ref}
        className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border border-brand-gold-300 bg-brand-linen bg-glow-gold px-6 text-center"
      >
        <div aria-hidden className="pointer-events-none absolute inset-3 border border-brand-gold-300/70" />
        <p className="font-sub text-[10px] font-medium uppercase tracking-[0.3em] text-brand-copper">
          ✦ Our Catalogue ✦
        </p>
        <p className="mt-2 font-logo text-[clamp(28px,6vw,44px)] font-medium leading-none text-brand-espresso">
          manne<span className="text-[1.3em] font-semibold">Q</span>uin&rsquo;s
        </p>
        <p className="mt-2 font-sub text-[9px] font-medium uppercase tracking-[0.25em] text-brand-mocha">
          Vitamin E Skincare &amp; Haircare
        </p>
        <div aria-hidden className={edgeRing} />
      </div>
    );
  }

  if (page.type === "end") {
    return (
      <div
        ref={ref}
        className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border border-brand-gold-300 bg-brand-linen bg-glow-gold px-6 text-center"
      >
        <div aria-hidden className="pointer-events-none absolute inset-3 border border-brand-gold-300/70" />
        <p className="font-display text-[clamp(22px,4.5vw,34px)] font-light italic text-brand-espresso">
          Thank You
        </p>
        <p className="mt-1.5 max-w-[260px] font-body text-[11px] leading-relaxed text-brand-body">
          for browsing the Mannequin Care catalogue.
        </p>
        <div aria-hidden className="my-3 h-px w-12 bg-brand-gold-400" />
        <p className="font-sub text-[10px] font-medium uppercase tracking-[0.2em] text-brand-copper">
          mannequincare.in
        </p>
        <p className="mt-1 font-sub text-[10px] tracking-[0.1em] text-brand-mocha">
          info@mannequincare.in
        </p>
        <div aria-hidden className={edgeRing} />
      </div>
    );
  }

  if (page.type === "blank") {
    return (
      <div ref={ref} className="relative flex h-full w-full items-center justify-center overflow-hidden bg-brand-linen">
        <span aria-hidden className="font-display text-2xl italic text-brand-gold-300">
          ✦
        </span>
        <div aria-hidden className={edgeRing} />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-white">
      <Image
        src={page.src}
        alt={`Catalogue page ${page.pageNumber}`}
        fill
        sizes="(max-width: 768px) 90vw, 45vw"
        className="object-cover"
        priority={page.pageNumber <= 2}
      />
      <span className="absolute bottom-3 right-4 font-sub text-[11px] font-medium tracking-[0.1em] text-white/80 mix-blend-difference">
        {page.pageNumber}
      </span>
      <div aria-hidden className={edgeRing} />
    </div>
  );
});

FlipbookPage.displayName = "FlipbookPage";

export default FlipbookPage;
