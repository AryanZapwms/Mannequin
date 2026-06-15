"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import RevealWrapper from "./RevealWrapper";

const CAROUSEL_IMAGES = [
  "/hero-banner.png", 
  "/1.png", 
  "/2.png", 
  "/3.png", 
  "/4.png"


  // "/models/1.jpeg",
  // "/models/2.jpeg",
  // "/models/3.jpeg",
  // "/models/4.jpeg",
  // "/models/5.jpeg",
  // "/models/6.jpeg",
  // "/models/7.jpeg",
  // "/models/8.jpeg",
  // "/models/9.jpeg",
  
];


const MODELS_IMAGES = [
  "/models/1.jpeg",
  "/models/2.jpeg",
  "/models/3.jpeg",
  "/models/4.jpeg",
  "/models/5.jpeg",
  "/models/6.jpeg",
  "/models/7.jpeg",
  "/models/8.jpeg",
  "/models/9.jpeg",
  
];



const BENEFIT_PILLS = [
  "Stretch Mark Repair",
  "Hair Strengthening",
  "Post-Pregnancy Care",
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <section className="relative w-full overflow-hidden bg-brand-cream bg-glow-gold">
      <div className="mx-auto flex max-w-[1280px] flex-col lg:flex-row lg:items-stretch">
        {/* ── Left half — copy ───────────────────────────────────── */}
        <div className="relative z-10 flex w-full flex-col justify-center px-6 py-16 sm:px-10 lg:w-[55%] lg:py-24 lg:pl-6 lg:pr-16 xl:py-28">
          <RevealWrapper>
            <p className="mb-5 flex items-center justify-center gap-2 font-sub text-[11px] font-medium uppercase tracking-[0.2em] text-brand-copper lg:justify-start">
              <span aria-hidden className="text-brand-gold-500">
                ✦
              </span>
              India&rsquo;s Vitamin E Skincare Specialist
            </p>
          </RevealWrapper>

          <RevealWrapper delay={80}>
            <h1 className="text-center font-display text-hero font-light italic leading-[1.05] text-brand-espresso lg:text-left">
              Crafted for
              <br />
              <span className="text-brand-gold-500">Every</span> Woman&rsquo;s
              <br />
              Skin Story
            </h1>
          </RevealWrapper>

          <RevealWrapper delay={160}>
            <p className="mx-auto mt-6 max-w-[420px] text-center font-body text-base leading-[1.8] text-brand-body lg:mx-0 lg:text-left">
              Fade stretch marks. Grow stronger hair. Reveal radiant skin —
              with Vitamin E formulated for Indian skin tones.
            </p>
          </RevealWrapper>

          <RevealWrapper delay={240}>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
              {BENEFIT_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="rounded-[20px] border border-brand-sand bg-brand-gold-100 px-4 py-2 font-sub text-xs font-medium tracking-[0.06em] text-brand-mocha"
                >
                  ✓ {pill}
                </span>
              ))}
            </div>
          </RevealWrapper>

          <RevealWrapper delay={320}>
            <div className="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-9 py-4 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
              >
                Shop All Products
              </Link>
              <Link
                href="/about-us"
                className="group inline-flex items-center gap-2 rounded border border-brand-sand px-9 py-4 font-sub text-sm font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:bg-white hover:shadow-soft"
              >
                Our Story
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </RevealWrapper>

          <RevealWrapper delay={400}>
            <div className="mt-10 flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex -space-x-3">
                {MODELS_IMAGES.map((src, i) => (
                  <div
                    key={src}
                    className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-brand-cream"
                    style={{ zIndex: 3 - i }}
                  >
                    <Image src={src} alt="" fill sizes="36px" className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
              <p className="font-sub text-[13px] text-brand-mocha">
                <span className="tracking-tight text-brand-gold-500">★★★★★</span>{" "}
                4.8 · Loved by 12,000+ women
              </p>
            </div>
          </RevealWrapper>
        </div>

        {/* ── Right half — imagery ───────────────────────────────── */}
        <div className="relative h-[380px] w-full sm:h-[480px] lg:h-auto lg:w-[45%] lg:min-h-[640px]">
          {/* Main rotating image */}
          <div className="absolute inset-0">
            {CAROUSEL_IMAGES.map((src, index) => (
              <div
                key={src}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-in-out",
                  index === currentSlide ? "opacity-100" : "opacity-0",
                )}
              >
                <Image
                  src={src}
                  alt={`Mannequin Care — Vitamin E range, look ${index + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain"
                  priority={index === 0}
                  unoptimized
                />
              </div>
            ))}
          </div>

          {/* Slide thumbnails — frosted vertical rail (desktop) */}
          <div className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 rounded-2xl border border-brand-sand/60 bg-white/50 p-1.5 shadow-soft backdrop-blur-md lg:flex">
            {CAROUSEL_IMAGES.map((src, idx) => (
              <button
                key={src}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Show slide ${idx + 1}`}
                aria-current={idx === currentSlide}
                className={cn(
                  "relative h-16 w-12 overflow-hidden rounded-thumb transition-all duration-300",
                  idx === currentSlide
                    ? "opacity-100 ring-2 ring-brand-gold-500"
                    : "opacity-60 ring-1 ring-brand-sand hover:opacity-100 hover:ring-brand-gold-300",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>

          {/* Slide dots (mobile / tablet) */}
          <div className="absolute bottom-4 right-5 z-20 flex items-center gap-2 lg:hidden">
            {CAROUSEL_IMAGES.map((src, idx) => (
              <button
                key={src}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Show slide ${idx + 1}`}
                aria-current={idx === currentSlide}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentSlide
                    ? "w-6 bg-brand-gold-500"
                    : "w-1.5 bg-brand-espresso/25 hover:bg-brand-espresso/40",
                )}
              />
            ))}
          </div>

          {/* Floating ingredient card */}
          <div className="absolute bottom-8 left-6 z-20 w-[200px] animate-float rounded-2xl border border-brand-sand bg-[rgba(253,246,236,0.95)] p-4 shadow-card backdrop-blur-sm sm:left-10 lg:-left-12">
            <p className="font-sub text-[10px] font-medium uppercase tracking-[0.15em] text-brand-copper">
              Key Ingredient
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-brand-espresso">
              Vitamin E
            </p>
            <p className="mt-1.5 font-body text-[11px] leading-snug text-brand-body">
              α-Tocopherol — clinically proven to repair skin barrier
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
