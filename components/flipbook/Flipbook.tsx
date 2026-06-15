"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LEAF_COUNT, PHOTO_COUNT } from "./webgl/book-constants";
import FlipbookControls from "./FlipbookControls";

// react-three-fiber renders to a <canvas> and touches the DOM/WebGL, so the
// whole scene must stay client-only.
const BookScene = dynamic(() => import("./webgl/BookScene"), {
  ssr: false,
  loading: () => <FlipbookSkeleton />,
});

function FlipbookSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse items-center justify-center rounded-feature border border-brand-sand bg-brand-linen">
      <p className="font-sub text-xs font-medium uppercase tracking-[0.2em] text-brand-mocha">
        Loading catalogue…
      </p>
    </div>
  );
}

/** Shown when the browser/device can't do WebGL — keeps the page useful. */
function FlipbookFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-feature border border-brand-gold-300 bg-brand-linen bg-glow-gold px-6 text-center">
      <p className="font-logo text-2xl font-medium text-brand-espresso">
        manne<span className="text-[1.3em] font-semibold">Q</span>uin&rsquo;s
      </p>
      <p className="max-w-sm font-body text-sm leading-relaxed text-brand-body">
        The interactive 3D catalogue needs WebGL, which isn&rsquo;t available on
        this device. You can still explore the full range in our shop.
      </p>
      <a
        href="/shop"
        className="rounded-full bg-brand-gold-500 px-5 py-2.5 font-sub text-xs font-semibold uppercase tracking-[0.1em] text-brand-espresso transition-colors hover:bg-brand-gold-600"
      >
        Browse the Shop
      </a>
    </div>
  );
}

function useWebGLSupported() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

/** "Cover" / "N / 16" / "Thank You" / "Back Cover" for the current spread. */
function pageLabel(page: number) {
  if (page <= 0) return "Cover";
  if (page >= LEAF_COUNT) return "Back Cover";
  if (page === LEAF_COUNT - 1) return "Thank You";
  return `${page} / ${PHOTO_COUNT}`;
}

/** requestIdleCallback with a setTimeout fallback for unsupported browsers. */
function whenIdle(cb: () => void) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const id = window.requestIdleCallback(cb, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 200);
  return () => clearTimeout(id);
}

export default function Flipbook() {
  const [page, setPage] = useState(0);
  const webglSupported = useWebGLSupported();

  // Keep the heavy Three.js bundle off the critical path: only mount the 3D
  // scene once its container nears the viewport AND the browser is idle, so
  // the above-the-fold hero (the LCP element) paints first instead of waiting
  // behind ~1 MB of WebGL download + texture rasterisation.
  const stageRef = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const node = stageRef.current;
    if (!node || sceneReady) return;

    let cancelIdle: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          cancelIdle = whenIdle(() => setSceneReady(true));
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelIdle?.();
    };
  }, [sceneReady]);

  const goNext = useCallback(
    () => setPage((p) => Math.min(LEAF_COUNT, p + 1)),
    [],
  );
  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        ref={stageRef}
        className="relative aspect-[4/3] w-full max-w-[1160px] touch-none sm:aspect-[16/9] lg:aspect-[2/1]"
      >
        {webglSupported === false ? (
          <FlipbookFallback />
        ) : sceneReady ? (
          <BookScene page={page} setPage={setPage} />
        ) : (
          <FlipbookSkeleton />
        )}
      </div>

      <FlipbookControls
        label={pageLabel(page)}
        isFirst={page === 0}
        isLast={page === LEAF_COUNT}
        onPrev={goPrev}
        onNext={goNext}
      />

      
    </div>
  );
}
