"use client";

import Link from "next/link";
import {
  Facebook, Youtube, X,
  MapPin, Phone, Mail, Clock,
  Banknote, CreditCard,
  ChevronRight,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

function useMediaQuery(query: string) {
  const [val, setVal] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setVal(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return val;
}

/* ─────────────────────────────────────────────────────────────────────
   GOLD PETAL BANNER
   - Dark espresso background to match the redesigned footer
   - Dots INSIDE letters: solid gold, high opacity
   - Dots OUTSIDE letters: faint warm glow, barely visible
   - Large font so letterforms are clearly readable
   - Smooth lerp animation
───────────────────────────────────────────────────────────────────── */

const GOLD    = { r: 245, g: 196, b:   0 }; // brand-gold-500
const GOLD2   = { r: 255, g: 215, b:   0 }; // brand-gold-400
const GOLD3   = { r: 184, g: 134, b:  11 }; // brand-gold-700
const BG_DOT  = { r: 139, g: 105, b:  20 }; // brand-mocha — faint warm glow on dark

const TEXT_COLORS = [GOLD, GOLD2, GOLD3];

interface PetalBannerProps {
  text: string;
  fontSize: number;
  isMobile: boolean;
}

const PetalBanner: React.FC<PetalBannerProps> = ({ text, fontSize, isMobile }) => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef    = useRef<{
    cols: number; rows: number;
    opacities: Float32Array;
    targets:   Float32Array;
    colorIdx:  Uint8Array;
    inText:    Uint8Array;
    dpr: number;
  } | null>(null);
  const rafRef = useRef<number>(0);
  const [inView, setInView] = useState(false);

  // Tiny dots = sharp crisp letterforms
  const R    = isMobile ? 1.2 : 1.5;
  const GAP  = isMobile ? 1.8 : 2;
  const STEP = R * 2 + GAP;

  const buildState = useCallback((canvas: HTMLCanvasElement, w: number, h: number) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;

    const cols = Math.ceil(w / STEP);
    const rows = Math.ceil(h / STEP);

    // ── Build text mask on offscreen canvas ──────────────────────────
    const mask  = document.createElement("canvas");
    mask.width  = canvas.width;
    mask.height = canvas.height;
    const mctx  = mask.getContext("2d", { willReadFrequently: true })!;

    mctx.fillStyle = "white";
    mctx.textAlign    = "center";
    mctx.textBaseline = "middle";

    // Main text — serif for elegance
    mctx.font = `700 ${Math.round(fontSize * dpr)}px "Cormorant Garamond","Playfair Display","Didot",Georgia,serif`;
    mctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // ── Classify each dot ────────────────────────────────────────────
    const opacities = new Float32Array(cols * rows);
    const targets   = new Float32Array(cols * rows);
    const colorIdx  = new Uint8Array(cols * rows);
    const inText    = new Uint8Array(cols * rows);

    const pw = Math.max(2, Math.round(R * 2 * dpr));

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cx = Math.round((i * STEP + R) * dpr);
        const cy = Math.round((j * STEP + R) * dpr);
        const x0 = Math.max(0, cx - pw);
        const y0 = Math.max(0, cy - pw);
        const sw = Math.min(pw * 2, canvas.width  - x0);
        const sh = Math.min(pw * 2, canvas.height - y0);
        let hit = false;
        if (sw > 0 && sh > 0) {
          const d = mctx.getImageData(x0, y0, sw, sh).data;
          for (let k = 0; k < d.length; k += 4) if (d[k] > 20) { hit = true; break; }
        }
        const idx = i * rows + j;
        inText[idx]  = hit ? 1 : 0;
        colorIdx[idx] = Math.floor(Math.random() * TEXT_COLORS.length);
        if (hit) {
          const v = 0.88 + Math.random() * 0.12;  // 0.88–1.0 — fully visible
          opacities[idx] = v;
          targets[idx]   = v;
        } else {
          const v = 0.04 + Math.random() * 0.07;  // barely visible bg dots
          opacities[idx] = v;
          targets[idx]   = v;
        }
      }
    }

    stateRef.current = { cols, rows, opacities, targets, colorIdx, inText, dpr };
  }, [text, fontSize, R, STEP]);

  const draw = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    if (!s) return;
    const { cols, rows, opacities, targets, colorIdx, inText, dpr } = s;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = i * rows + j;
        opacities[idx] += (targets[idx] - opacities[idx]) * 0.08;

        const op  = opacities[idx];
        const col = inText[idx] ? TEXT_COLORS[colorIdx[idx]] : BG_DOT;
        const { r, g, b } = col;

        ctx.beginPath();
        ctx.arc(
          (i * STEP + R) * dpr,
          (j * STEP + R) * dpr,
          R * dpr, 0, Math.PI * 2,
        );
        ctx.fillStyle = `rgba(${r},${g},${b},${op.toFixed(3)})`;
        ctx.fill();
      }
    }
  }, [R, STEP]);

  const flicker = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const { targets, colorIdx, inText } = s;
    for (let k = 0; k < targets.length; k++) {
      if (inText[k]) {
        if (Math.random() < 0.004) {
          targets[k]   = 0.82 + Math.random() * 0.18;
          colorIdx[k]  = Math.floor(Math.random() * TEXT_COLORS.length);
        }
      } else {
        if (Math.random() < 0.002) {
          targets[k] = 0.03 + Math.random() * 0.09;
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => buildState(canvas, container.clientWidth, container.clientHeight);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [buildState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!inView) { cancelAnimationFrame(rafRef.current); return; }
    const tick = () => { flicker(); draw(canvas, ctx); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, draw, flicker]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(canvas);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      {/* Top + bottom soft fade into surrounding footer */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom, #3D2B1F 0%, rgba(61,43,31,0) 30%, rgba(61,43,31,0) 70%, #3D2B1F 100%)",
      }} />
    </div>
  );
};

/* ─── Data ─────────────────────────────────────────────────────────── */
const footerLinks = [
  {
    title: "Company",
    links: [
      { id: 1, label: "About Us",   href: "/about"      },
      { id: 2, label: "Contact Us", href: "/contact-us" },
      { id: 3, label: "Shop",       href: "/shop"       },
      { id: 4, label: "Blogs",      href: "/blog"       },
    ],
  },
  {
    title: "Categories",
    links: [
      { id: 4, label: "Face Care", href: "/shop?category=face-care"   },
      { id: 5, label: "Body Care", href: "/shop?category=body-care" },
      { id: 6, label: "Hair Care", href: "/shop?category=hair-care"        },
    ],
  },
  {
    title: "Policies",
    links: [
      { id: 7, label: "Returns Policy",     href: "/returns" },
      { id: 8, label: "Terms & Conditions", href: "/terms"   },
      { id: 9, label: "Privacy Policy",     href: "/privacy" },
    ],
  },
];

const contactItems = [
  { Icon: MapPin, text: "509, Peninsula Plaza, Veera Desai Industrial Estate, Opposite YRF, Andheri West, Mumbai – 400053", href: null },
  { Icon: Phone,  text: "+(123) - 456 - 7890", href: null },
  { Icon: Mail,   text: "info@mannequincare.in", href: "mailto:info@mannequincare.in" },
  { Icon: Clock,  text: "All Day · 9:00 AM – 10:00 PM", href: null },
];

const socials = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "YouTube",  href: "https://youtube.com",  Icon: Youtube  },
  { label: "X",        href: "https://twitter.com",  Icon: X        },
];

/* ─── Component ─────────────────────────────────────────────────────── */
export default function Footer() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  return (
    <>
      <style>{`
        .mcf {
          font-family: var(--font-nunito), sans-serif;
          background: #3D2B1F;
          border-top: 3px solid #F5C400;
        }

        /* Gold accent rule under headings */
        .mcf-rule {
          width: 28px; height: 2px;
          background: #F5C400;
          border: none; margin: 0;
          border-radius: 2px;
          opacity: 0.7;
        }

        /* Section headings */
        .mcf-heading {
          font-family: var(--font-jost), sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: #FFD700;
          margin: 0;
        }

        /* Social icon circles */
        .mcf-social {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: #fff; text-decoration: none;
          transition: background .2s, color .2s;
          flex-shrink: 0;
        }
        .mcf-social:hover { background: #F5C400; color: #3D2B1F; }

        /* Nav links */
        .mcf-navlink {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--font-nunito), sans-serif;
          font-size: 14px; font-weight: 400;
          color: rgba(255,255,255,0.6); text-decoration: none;
          transition: color .2s, transform .2s;
        }
        .mcf-navlink:hover { color: #fff; transform: translateX(4px); }
        .mcf-arr { opacity: 0; transition: opacity .2s; }
        .mcf-navlink:hover .mcf-arr { opacity: 1; }

        /* Payment badges */
        .mcf-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 14px;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
          font-size: 11.5px; font-weight: 500;
          color: rgba(255,255,255,0.8);
          font-family: var(--font-jost), sans-serif;
        }

        /* Banner wrapper */
        .mcf-banner {
          width: 100%;
          background: #3D2B1F;
          border-top: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
        }

        /* Banner inner sizing */
        .mcf-banner-inner {
          height: 160px;
        }
        @media (min-width: 640px)  { .mcf-banner-inner { height: 200px; } }
        @media (min-width: 1024px) { .mcf-banner-inner { height: 240px; } }

        /* Bottom bar */
        .mcf-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
          padding: 16px 32px;
          display: flex; flex-wrap: wrap; gap: 10px;
          align-items: center; justify-content: space-between;
        }
        @media (max-width: 640px) {
          .mcf-bottom { padding: 14px 16px; flex-direction: column; align-items: flex-start; }
        }

        /* Tagline above banner */
        .mcf-tagline {
          text-align: center;
          padding: 48px 24px 32px;
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(20px, 2.5vw, 32px);
          color: #fff;
        }
        .mcf-tagline span {
          color: #F5C400;
          font-style: normal;
        }
      `}</style>

      <footer className="mcf">

        {/* ── Top tagline row ───────────────────────────────────────── */}
        <p className="mcf-tagline">
          Skincare <span>·</span> Crafted for Indian Women
        </p>

        {/* ── Upper columns ─────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: isTablet ? "32px" : "48px",
          padding: isMobile ? "0 20px 40px" : isTablet ? "0 32px 44px" : "0 64px 56px",
        }}>

          {/* Brand column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Link href="/" className="inline-flex flex-col leading-none">
              <span style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", fontWeight: 600, fontSize: 26, color: "#fff" }}>
                Mannequin
              </span>
              <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: 11, letterSpacing: "0.32em", color: "#FFD700" }}>
                CARE
              </span>
            </Link>
            <hr className="mcf-rule" />
            <p style={{ fontSize: 14, lineHeight: 1.85, color: "rgba(255,255,255,0.6)", fontWeight: 300, maxWidth: 260 }}>
              True radiance begins with self-care — when you nurture your skin
              with love and attention, it becomes a reflection of the beauty within.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {socials.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="mcf-social" aria-label={label}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Find Us */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p className="mcf-heading">Find Us</p>
            <hr className="mcf-rule" />
            {contactItems.map(({ Icon, text, href }, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icon size={14} style={{ color: "#F5C400", marginTop: 2, flexShrink: 0 }} />
                {href
                  ? <a href={href} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 300, textDecoration: "none" }}>{text}</a>
                  : <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>{text}</span>
                }
              </div>
            ))}
          </div>

          {/* Nav columns */}
          {footerLinks.map((col) => (
            <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p className="mcf-heading">{col.title}</p>
              <hr className="mcf-rule" />
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 11 }}>
                {col.links.map(({ id, label, href }) => (
                  <li key={id}>
                    <Link href={href} className="mcf-navlink">
                      {label}
                      <ChevronRight size={11} className="mcf-arr" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Dot banner ────────────────────────────────────────────── */}
        <div className="mcf-banner">
          <div className="mcf-banner-inner">
            <PetalBanner
              text={isMobile ? "manneQuincare.in" : "manneQuincare.in"}
              fontSize={isMobile ? 48 : isTablet ? 68 : 88}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="mcf-bottom">
          <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
            © 2025 Mannequincare.in · All rights reserved
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="mcf-badge">
              <Banknote size={12} style={{ color: "#B5C9A8" }} /> COD
            </span>
            <span className="mcf-badge">
              <CreditCard size={12} style={{ color: "#FFD700" }} /> Razorpay
            </span>
          </div>
        </div>

      </footer>
    </>
  );
}
