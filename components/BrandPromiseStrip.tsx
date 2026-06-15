import Link from "next/link";
import { ArrowRight, Droplet, Leaf, Shield, Sparkles } from "lucide-react";
import RevealWrapper from "./RevealWrapper";

const HIGHLIGHTS = [
  {
    Icon: Leaf,
    title: "Plant-Based",
    text: "Sourced from nature",
  },
  {
    Icon: Droplet,
    title: "Hydrating",
    text: "12-hour skin moisture",
  },
  {
    Icon: Shield,
    title: "Dermatologist Approved",
    text: "Clinically tested",
  },
  {
    Icon: Sparkles,
    title: "Results in 4 Weeks",
    text: "Visible improvement",
  },
];

export default function BrandPromiseStrip() {
  return (
    <section className="w-full bg-brand-espresso bg-grain">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 py-[clamp(60px,8vw,120px)] lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* Left — quote */}
        <RevealWrapper>
          <p className="font-display text-[clamp(28px,3vw,44px)] font-light italic leading-[1.25] text-white">
            True radiance begins
            <br />
            with self-care.
          </p>
          <p className="mt-6 font-sub text-[13px] font-normal text-brand-gold-300">
            — The Mannequin Care Promise
          </p>
          <Link
            href="/about-us"
            className="group mt-8 inline-flex items-center gap-2 border-b border-white pb-1 font-sub text-sm font-medium text-white transition-colors hover:text-brand-gold-300"
          >
            Discover Our Story
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </RevealWrapper>

        {/* Right — ingredient highlights */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {HIGHLIGHTS.map(({ Icon, title, text }, i) => (
            <RevealWrapper key={title} delay={i * 100}>
              <div className="flex flex-col gap-3">
                <Icon className="h-6 w-6 text-brand-gold-400" strokeWidth={1.5} />
                <p className="font-sub text-sm font-semibold text-white">{title}</p>
                <p className="font-body text-[13px] leading-relaxed text-white/70">{text}</p>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
