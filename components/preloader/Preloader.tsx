"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, type AnimationSequence } from "motion";
import { markPreloaderDone, PRELOADER_SESSION_KEY } from "./preloader-events";

/**
 * First-visit split-text preloader.
 *
 * Plays once per browser session: the "Mannequin" wordmark fades in,
 * splits in half, a montage of product imagery flashes through the gap,
 * then the montage dissolves into a live "window" onto the real page
 * underneath, which expands to fullscreen while the site's entrance
 * animations play inside it. Announces progress via the events in
 * `preloader-events.ts` — it knows nothing about the page underneath.
 *
 * The overlay is built from four cream panels around a center hole
 * (rather than one solid sheet) so the actual site can show through
 * the expanding window — no screenshot or iframe involved.
 *
 * Returning visitors (sessionStorage flag) and reduced-motion users
 * skip straight to `preloaderSkipped`.
 */

// Flash order — last entry is the frame that dissolves into the live site.
const MONTAGE_IMAGES = [
  "/montage-images/1.jpg",
  "/montage-images/2.jpg",
  "/montage-images/3.jpg",
  "/montage-images/4.jpg",
  "/montage-images/5.jpg",
  "/montage-images/6.jpg",
  "/montage-images/7.jpg",
  "/montage-images/8.jpg",
  "/montage-images/9.jpg",
  "/montage-images/10.jpg",
  "/montage-images/11.jpg",
  "/montage-images/12.jpg",
  "/montage-images/12.jpg",
  "/montage-images/13.jpg",
  "/montage-images/14.jpg",
  "/montage-images/15.jpg",
  "/montage-images/16.jpg",
  "/montage-images/17.jpg",
  "/montage-images/18.jpg",
  "/montage-images/19.jpg",
  "/montage-images/20.jpg",
  "/montage-images/21.jpg",
  "/montage-images/22.jpg",
  "/montage-images/23.jpg",
];

const wordClassName =
  "absolute m-0 whitespace-nowrap font-logo text-[clamp(44px,12vw,180px)] font-medium leading-none tracking-[0.02em] will-change-transform";

/**
 * Mirrors the brand logo: lowercase "mannequin's" with an oversized Q.
 *
 * The big Q stays in normal inline flow so the browser keeps its
 * baseline locked to the word's, but `leading-[0]` collapses its box
 * to zero height so it can't inflate the line box (which would push
 * the 50% clip-path split away from the word's visual middle). The
 * small translate drops it so it rides the x-height like the logo,
 * cap above the lowercase letters and tail below the baseline.
 */
function Wordmark() {
  return (
    <>
      manne
      <span className="inline-block w-[0.78em] translate-y-[0.18em] text-center text-[1.5em] font-semibold leading-[0]">
        Q
      </span>
      uin&rsquo;s
    </>
  );
}

const panelClassName = "absolute bg-brand-cream will-change-[width,height]";

const SPLIT_EASE = [0.83, 0, 0.17, 1] as const;
const SOFT_EASE = [0.16, 1, 0.3, 1] as const;

type Phase = "idle" | "run" | "gone";

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const montageRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLSpanElement>(null);
  const topRef = useRef<HTMLSpanElement>(null);
  const bottomRef = useRef<HTMLSpanElement>(null);
  const panelTopRef = useRef<HTMLDivElement>(null);
  const panelBottomRef = useRef<HTMLDivElement>(null);
  const panelLeftRef = useRef<HTMLDivElement>(null);
  const panelRightRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");

  // Decide on mount: returning visitor / reduced motion → skip instantly.
  useEffect(() => {
    let hasRun = false;
    try {
      hasRun = sessionStorage.getItem(PRELOADER_SESSION_KEY) === "true";
    } catch {
      // sessionStorage unavailable — play it safe and skip.
      hasRun = true;
    }
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (hasRun || reducedMotion) {
      markPreloaderDone(true);
      setPhase("gone");
    } else {
      setPhase("run");
    }
  }, []);

  // Run the timeline once the montage images are in the DOM.
  useEffect(() => {
    if (phase !== "run" || startedRef.current) return;
    startedRef.current = true;

    const container = containerRef.current;
    const montage = montageRef.current;
    const full = fullRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const panels = {
      top: panelTopRef.current,
      bottom: panelBottomRef.current,
      left: panelLeftRef.current,
      right: panelRightRef.current,
    };
    if (
      !container || !montage || !full || !top || !bottom ||
      !panels.top || !panels.bottom || !panels.left || !panels.right
    ) {
      markPreloaderDone(true);
      setPhase("gone");
      return;
    }

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    // Resize the rectangular hole between the four panels (kept centered).
    const setHole = (w: number, h: number) => {
      const gapY = `calc(50% - ${h / 2}px)`;
      const gapX = `calc(50% - ${w / 2}px)`;
      panels.top!.style.height = gapY;
      panels.bottom!.style.height = gapY;
      for (const side of [panels.left!, panels.right!]) {
        side.style.top = gapY;
        side.style.height = `${h}px`;
        side.style.width = gapX;
      }
    };

    const run = async () => {
      const images = Array.from(
        montage.querySelectorAll<HTMLElement>("[data-montage-img]"),
      );

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const midW = Math.min(vw * 0.46, 560);
      const midH = Math.min(vh * 0.26, 300);
      const flashStart = 2.15;
      const flashStep = 0.13;

      // ── Act 1: wordmark in, split apart, montage flashes between ──
      const intro: AnimationSequence = [
        [full, { opacity: [0, 1], scale: [0.92, 1] }, { duration: 1.1, at: 0.35, ease: SOFT_EASE }],
        [[top, bottom], { scale: [0.92, 1] }, { duration: 1.1, at: 0.35, ease: SOFT_EASE }],

        [full, { opacity: 0 }, { duration: 0.001, at: 1.75 }],
        [[top, bottom], { opacity: 1 }, { duration: 0.001, at: 1.75 }],
        [top, { y: "-12vh" }, { duration: 1.15, at: 1.75, ease: SPLIT_EASE }],
        [bottom, { y: "12vh" }, { duration: 1.15, at: 1.75, ease: SPLIT_EASE }],

        [montage, { opacity: 1, width: [0, midW], height: [0, midH] }, { duration: 1.15, at: 1.75, ease: SPLIT_EASE }],
        ...images.map(
          (img, i): AnimationSequence[number] => [
            img,
            { opacity: 1 },
            { duration: 0.001, at: i === 0 ? 1.75 : flashStart + i * flashStep },
          ],
        ),
      ];

      await animate(intro);
      await new Promise((r) => setTimeout(r, 300));

      // ── Act 2: the window becomes the live site and swallows the screen ──
      // Announce now so the page's entrance animations play INSIDE the
      // expanding window — the user watches the real site come alive.
      try {
        sessionStorage.setItem(PRELOADER_SESSION_KEY, "true");
      } catch { }
      markPreloaderDone(false);

      const expand: AnimationSequence = [
        [montage, { borderRadius: 0 }, { duration: 0.25, at: 0 }],
        [montage, { width: vw, height: vh }, { duration: 1.3, at: 0, ease: SPLIT_EASE }],
        // Last frame cross-fades away, revealing the page through the hole.
        [montage, { opacity: 0 }, { duration: 0.6, at: 0.1, ease: "easeOut" }],
        [top, { y: "-46vh", opacity: 0 }, { duration: 1.3, at: 0, ease: SPLIT_EASE }],
        [bottom, { y: "46vh", opacity: 0 }, { duration: 1.3, at: 0, ease: SPLIT_EASE }],
      ];

      await Promise.all([
        animate(expand),
        // Open the panel hole in lockstep with the montage expansion.
        animate(0, 1, {
          duration: 1.3,
          ease: SPLIT_EASE,
          onUpdate: (p) => setHole(midW + (vw - midW) * p, midH + (vh - midH) * p),
        }),
      ]);
    };

    run()
      .catch(() => {
        // Never trap the user behind the overlay if the animation fails.
        markPreloaderDone(true);
      })
      .finally(() => {
        try {
          sessionStorage.setItem(PRELOADER_SESSION_KEY, "true");
        } catch { }
        html.style.overflow = prevOverflow;
        markPreloaderDone(false);
        setPhase("gone");
      });
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      ref={containerRef}
      id="mc-preloader"
      aria-hidden="true"
      className="fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Four cream panels — the centered hole between them reveals the live page.
          Hole starts at 0×0, so top + bottom fully cover the screen. */}
      <div ref={panelTopRef} className={`${panelClassName} left-0 right-0 top-0`} style={{ height: "50%" }} />
      <div ref={panelBottomRef} className={`${panelClassName} bottom-0 left-0 right-0`} style={{ height: "50%" }} />
      <div ref={panelLeftRef} className={`${panelClassName} left-0`} style={{ top: "50%", height: 0, width: "50%" }} />
      <div ref={panelRightRef} className={`${panelClassName} right-0`} style={{ top: "50%", height: 0, width: "50%" }} />

      {/* Montage layer — images mount only when the animation will run */}
      <div className="absolute inset-0 z-10">
        <div
          ref={montageRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden opacity-0 will-change-[width,height]"
          style={{ width: 0, height: 0, borderRadius: 24 }}
        >
          {phase === "run" &&
            MONTAGE_IMAGES.map((src, i) => (
              <Image
                key={src}
                data-montage-img
                src={src}
                alt=""
                fill
                priority={i < 2}
                sizes="100vw"
                className="object-cover opacity-0"
              />
            ))}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/15 to-black/45" />
        </div>
      </div>

      {/* Split wordmark layer — difference blend inverts over the imagery */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-white mix-blend-difference">
        <div className="relative flex w-full items-center justify-center">
          <span ref={fullRef} className={wordClassName} style={{ opacity: 0 }}>
            <Wordmark />
          </span>
          <span
            ref={topRef}
            className={wordClassName}
            style={{ opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
          >
            <Wordmark />
          </span>
          <span
            ref={bottomRef}
            className={wordClassName}
            style={{ opacity: 0, clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }}
          >
            <Wordmark />
          </span>
        </div>
      </div>

      {/* Pre-hydration guard: returning visitors never see a flash of the overlay */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${PRELOADER_SESSION_KEY}")==="true"){var e=document.getElementById("mc-preloader");if(e)e.style.display="none"}}catch(t){}`,
        }}
      />
    </div>
  );
}
