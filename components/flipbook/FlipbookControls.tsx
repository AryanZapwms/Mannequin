"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type FlipbookControlsProps = {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function FlipbookControls({
  label,
  isFirst,
  isLast,
  onPrev,
  onNext,
}: FlipbookControlsProps) {
  const buttonClassName =
    "inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-sand bg-white text-brand-espresso shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-300 hover:text-brand-copper hover:shadow-card disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none";

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        aria-label="Previous page"
        onClick={onPrev}
        disabled={isFirst}
        className={buttonClassName}
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <p className="min-w-[88px] font-sub text-xs font-medium uppercase tracking-[0.2em] text-brand-mocha">
        {label}
      </p>

      <button
        type="button"
        aria-label="Next page"
        onClick={onNext}
        disabled={isLast}
        className={buttonClassName}
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
