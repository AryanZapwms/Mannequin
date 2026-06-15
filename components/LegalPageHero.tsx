import RevealWrapper from "./RevealWrapper";

type LegalPageHeroProps = {
  title: string;
  lastUpdated: string;
};

export default function LegalPageHero({ title, lastUpdated }: LegalPageHeroProps) {
  return (
    <section className="w-full bg-brand-cream bg-glow-gold">
      <div className="mx-auto max-w-[760px] px-6 py-[clamp(48px,6vw,80px)]">
        <RevealWrapper>
          <h1 className="font-display text-display font-light italic text-brand-espresso">
            {title}
          </h1>
          <p className="mt-3 font-sub text-xs font-medium uppercase tracking-[0.2em] text-brand-mocha">
            Last updated: {lastUpdated}
          </p>
        </RevealWrapper>
      </div>
    </section>
  );
}
