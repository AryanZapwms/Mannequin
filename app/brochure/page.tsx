import type { Metadata } from "next";
import Flipbook from "@/components/flipbook/Flipbook";
import RevealWrapper from "@/components/RevealWrapper";

export const metadata: Metadata = {
  title: "Brochure",
  description:
    "Browse the Mannequin Care catalogue — flip through our full Vitamin E skincare and haircare range.",
};

export default function BrochurePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-cream bg-glow-gold">
      <section className="w-full">
        <div className="mx-auto max-w-[1280px] px-6 pb-8 pt-[clamp(40px,6vw,72px)] text-center">
          <RevealWrapper>
            <p className="mb-4 flex items-center justify-center gap-2 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper">
              <span aria-hidden className="text-brand-gold-500">
                ✦
              </span>
              Our Catalogue
            </p>
            <h1 className="font-display text-display font-light italic text-brand-espresso">
              The Mannequin Care Brochure
            </h1>
            {/* <p className="mx-auto mt-4 max-w-[560px] font-body text-base leading-[1.8] text-brand-body">
              Flip through our full range of Vitamin E formulations — crafted
              for stretch mark repair, hair strength, and post-pregnancy care.
            </p> */}
          </RevealWrapper>
        </div>
      </section>
      <section className="w-full pb-[clamp(56px,8vw,120px)]">
        <div className="mx-auto max-w-[1280px] px-6">
          <RevealWrapper delay={120}>
            <Flipbook />
          </RevealWrapper>
        </div>
      </section>
    </div>
  );
}
