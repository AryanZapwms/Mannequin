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
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
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
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        {discount > 0 && (
          <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white z-10">
            -{discount}%
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === activeIndex
                  ? "border-black ring-1 ring-black"
                  : "border-gray-200 hover:border-gray-400",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
