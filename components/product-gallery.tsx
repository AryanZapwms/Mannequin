"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  discount?: number;
}

export function ProductGallery({ images, discount = 0 }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card border border-brand-sand bg-brand-gold-50 font-sub text-sm text-brand-mocha">
        No Image Available
      </div>
    );
  }

  const active = images[activeIndex];

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="group relative aspect-square overflow-hidden rounded-card border border-brand-sand bg-brand-gold-50 shadow-soft">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-6"
          priority
        />
        {discount > 0 && (
          <div className="absolute left-0 top-0 z-10 rounded-[0_0_8px_0] bg-brand-espresso px-3 py-1 font-mono text-sm text-white">
            -{discount}%
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-sand bg-white/90 shadow-soft backdrop-blur-sm transition-all hover:bg-white sm:left-3 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5 text-brand-espresso" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-sand bg-white/90 shadow-soft backdrop-blur-sm transition-all hover:bg-white sm:right-3 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5 text-brand-espresso" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-thumb bg-brand-gold-50 transition-all duration-200",
                i === activeIndex
                  ? "opacity-100 ring-2 ring-brand-gold-500"
                  : "opacity-60 ring-1 ring-brand-sand hover:opacity-100 hover:ring-brand-gold-300",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
