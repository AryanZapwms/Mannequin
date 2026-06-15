"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { onPreloaderDone } from "@/components/preloader/preloader-events";

interface RevealWrapperProps {
  children: ReactNode;
  className?: string;
  /** Additional delay in ms, useful for staggering siblings (e.g. index * 100). */
  delay?: number;
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number;
}

/**
 * Fades + slides content up into view the first time it crosses the
 * viewport threshold. Reusable across every homepage section so reveals
 * stay perfectly consistent.
 *
 * Decoupled from the preloader: it only subscribes to the
 * `preloaderComplete` / `preloaderSkipped` contract, so in-viewport
 * sections hold their entrance until the overlay dissolves instead of
 * revealing unseen behind it.
 */
export default function RevealWrapper({
  children,
  className,
  delay = 0,
  threshold = 0.15,
}: RevealWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let observer: IntersectionObserver | undefined;

    const unsubscribe = onPreloaderDone(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer?.disconnect();
          }
        },
        { threshold },
      );
      observer.observe(node);
    });

    return () => {
      unsubscribe();
      observer?.disconnect();
    };
  }, [threshold]);

  const style: CSSProperties | undefined = delay
    ? { transitionDelay: `${delay}ms` }
    : undefined;

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
