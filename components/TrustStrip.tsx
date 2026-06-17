import { Leaf, FlaskConical, Truck, RotateCcw } from "lucide-react";
import RevealWrapper from "./RevealWrapper";

const TRUST_ITEMS = [
  { Icon: Leaf, label: "100% Natural Ingredients" },
  { Icon: FlaskConical, label: "Dermatologist Tested" },
  { Icon: Truck, label: "Free Delivery Above ₹499" },
  { Icon: RotateCcw, label: "30-Day Easy Returns" },
];

export default function TrustStrip() {
  return (
    <section className="w-full bg-brand-gold-500">
      <RevealWrapper>
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-y-5 px-6 py-6 sm:grid-cols-4 sm:gap-y-0 sm:py-0 lg:h-[72px] lg:items-center">
          {TRUST_ITEMS.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2.5 px-2 text-center sm:border-l sm:border-brand-espresso/20 sm:first:border-l-0"
            >
              <Icon className="h-4 w-4 shrink-0 text-brand-espresso" strokeWidth={1.75} />
              <span className="font-sub text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-espresso">
                {label}
              </span>
            </div>
          ))}
        </div>
      </RevealWrapper>
    </section>
  );
}


