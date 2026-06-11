// import Link from "next/link";
// import { Facebook, Youtube, X, MapPin, Phone, Mail, Clock, Banknote, CreditCard } from "lucide-react";
// import Image from "next/image";

// export default function Footer() {
//   return (
//     <footer className="bg-white border-t border-gray-200">
//       <div className="container mx-auto px-4 py-12 md:py-16">
//         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
//           {/* Brand Section */}
//           <div className="space-y-6">
//             <Link href="/" className="inline-block">
//               <Image
//                 src="/logo.jpg"
//                 alt="Mannequin Care"
//                 width={140}
//                 height={40}
//                 className="h-10 w-auto transition-all duration-300"
//                 style={{ width: "auto" }}
//                 priority
//               />
//             </Link>

//             <p className="text-sm leading-relaxed text-gray-600">
//               True radiance begins with self-care when you nurture your skin with love and
//               attention. It becomes a reflection of the beauty within.
//             </p>
//             <div className="flex gap-3">
//               <a
//                 href="https://facebook.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black-700"
//                 aria-label="Facebook"
//               >
//                 <Facebook className="h-5 w-5" />
//               </a>
//               <a
//                 href="https://youtube.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black-700"
//                 aria-label="YouTube"
//               >
//                 <Youtube className="h-5 w-5" />
//               </a>
//               <a
//                 href="https://twitter.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black-700"
//                 aria-label="Twitter/X"
//               >
//                 <X className="h-5 w-5" />
//               </a>
//             </div>
//           </div>

//           {/* About Us Section */}
//           <div>
//             <h3 className="mb-4 md:mb-6 text-base md:text-lg font-semibold text-gray-900">About Us</h3>
//             <div className="space-y-3 md:space-y-4 text-sm text-gray-600">
//               <div className="flex items-start gap-3">
//                 <MapPin className="mt-0.5 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-black" />
//                 <span className="text-xs md:text-sm">
//                   509, Peninsula Plaza premises, Veera Desai Industrial Estate, Opposite YRF, Andheri West,
//                   Mumbai – 400053 Maharashtra, India.
//                 </span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Phone className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-black" />
//                 <span className="text-xs md:text-sm">+(123) - 456 - 7890</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Mail className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-black" />
//                 <a
//                   href="mailto:info@mannequincare.in"
//                   className="text-xs md:text-sm transition-colors hover:text-black"
//                 >
//                   info@mannequincare.in
//                 </a>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Clock className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-black" />
//                 <span className="text-xs md:text-sm">All Day, 9:00AM - 22:00PM</span>
//               </div>
//             </div>
//           </div>

//           {/* Categories Section */}
//           <div>
//             <h3 className="mb-4 md:mb-6 text-base md:text-lg font-semibold text-gray-900">Categories</h3>
//             <ul className="space-y-2 md:space-y-3 text-sm text-gray-600">
//               <li>
//                 <Link href="/shop?category=skincare" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   Face Care
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/shop?category=complexion" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   Body Care
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/shop?category=eye" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   Hair Care
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Shop & Policies Section */}
//           <div>
//             <h3 className="mb-4 md:mb-6 text-base md:text-lg font-semibold text-gray-900">Shop</h3>
//             <ul className="space-y-2 md:space-y-3 text-sm text-gray-600">
//               <li>
//                 <Link href="/about" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   About Us
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/contact-us" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   Contact Us
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/shop" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   Shop
//                 </Link>
//               </li>
//             </ul>

//             <h3 className="mb-3 md:mb-4 mt-6 md:mt-8 text-base md:text-lg font-semibold text-gray-900">Our Policies</h3>
//             <ul className="space-y-2 md:space-y-3 text-sm text-gray-600">
//               <li>
//                 <Link href="/returns" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   Returns Policy
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/terms" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   Terms & Conditions
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/privacy" className="text-xs md:text-sm transition-colors hover:text-teal-600">
//                   Privacy Policy
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Bar */}
//       <div className="border-t border-gray-200 bg-gray-50">
//         <div className="container mx-auto px-4 py-4 md:py-6">
//           <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
//             <p className="text-xs md:text-sm text-gray-600">
//               Copyright © 2025 Mannequincare.in. All Rights Reserved.
//             </p>
//             <div className="flex items-center gap-3">
//               <div className="flex h-8 w-auto min-w-[48px] items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-2">
//                 <Banknote className="h-4 w-4 text-green-600" />
//                 <span className="text-xs font-semibold text-gray-700">COD</span>
//               </div>
//               <div className="flex h-8 w-auto min-w-[80px] items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-2">
//                 <CreditCard className="h-4 w-4 text-blue-600" />
//                 <span className="text-xs font-semibold text-gray-700">Razorpay</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }









"use client";

import Link from "next/link";
import Image from "next/image";
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
   - Light warm ivory background so text is always readable
   - Dots INSIDE letters: solid gold #E0C401, high opacity
   - Dots OUTSIDE letters: very faint warm taupe, barely visible
   - Large font so letterforms are clearly readable
   - Smooth lerp animation
───────────────────────────────────────────────────────────────────── */

const GOLD    = { r: 180, g: 148, b:   0 }; // dark yellow #B49400
const GOLD2   = { r: 160, g: 128, b:   0 }; // slightly deeper
const GOLD3   = { r: 196, g: 162, b:   8 }; // warm highlight
const BG_DOT  = { r: 205, g: 192, b: 162 }; // warm taupe for bg dots

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
        background: "linear-gradient(to bottom, #fdf6ee 0%, rgba(253,246,238,0) 30%, rgba(253,246,238,0) 70%, #fdf6ee 100%)",
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
    ],
  },
  {
    title: "Categories",
    links: [
      { id: 4, label: "Face Care", href: "/shop?category=skincare"   },
      { id: 5, label: "Body Care", href: "/shop?category=complexion" },
      { id: 6, label: "Hair Care", href: "/shop?category=eye"        },
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .mcf {
          font-family: 'DM Sans', sans-serif;
          background: #fdf6ee;
          border-top: 1px solid #e8d8b8;
        }

        /* Gold accent rule under headings */
        .mcf-rule {
          width: 28px; height: 2px;
          background: #E0C401;
          border: none; margin: 0;
          border-radius: 2px;
        }

        /* Section headings */
        .mcf-heading {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: 18px; font-weight: 600;
          color: #1e1206;
          letter-spacing: .03em;
          margin: 0;
        }

        /* Social icon circles */
        .mcf-social {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1.5px solid #c8aa00;
          display: flex; align-items: center; justify-content: center;
          color: #8a7200; text-decoration: none;
          transition: background .18s, color .18s;
          flex-shrink: 0;
        }
        .mcf-social:hover { background: #E0C401; color: #fff; border-color: #E0C401; }

        /* Nav links */
        .mcf-navlink {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 13px; font-weight: 300;
          color: #5a4a28; text-decoration: none;
          letter-spacing: .01em;
          transition: color .18s;
        }
        .mcf-navlink:hover { color: #a08800; }
        .mcf-arr { opacity: 0; transform: translateX(-3px); transition: opacity .18s, transform .18s; }
        .mcf-navlink:hover .mcf-arr { opacity: 1; transform: translateX(0); }

        /* Payment badges */
        .mcf-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 14px;
          border: 1px solid #d8c880;
          border-radius: 999px;
          background: #fffdf0;
          font-size: 11.5px; font-weight: 500;
          color: #3a3000;
          font-family: 'DM Sans', sans-serif;
        }

        /* Banner wrapper */
        .mcf-banner {
          width: 100%;
          background: #fdf6ee;
          border-top: 1px solid #e8d8b8;
          overflow: hidden;
        }

        /* Banner inner sizing */
        .mcf-banner-inner {
          height: 180px;
        }
        @media (min-width: 640px)  { .mcf-banner-inner { height: 220px; } }
        @media (min-width: 1024px) { .mcf-banner-inner { height: 260px; } }

        /* Bottom bar */
        .mcf-bottom {
          border-top: 1px solid #e8d8b8;
          background: #f8f0da;
          padding: 14px 32px;
          display: flex; flex-wrap: wrap; gap: 10px;
          align-items: center; justify-content: space-between;
        }
        @media (max-width: 640px) {
          .mcf-bottom { padding: 12px 16px; flex-direction: column; align-items: flex-start; }
        }

        /* Tagline above banner */
        .mcf-tagline-bar {
          text-align: center;
          padding: 28px 0 8px;
          letter-spacing: .28em;
          text-transform: uppercase;
          font-size: 10.5px;
          font-weight: 400;
          color: #8a7200;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <footer className="mcf">

        {/* ── Upper columns ─────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: isTablet ? "32px" : "48px",
          padding: isMobile ? "36px 20px 40px" : isTablet ? "44px 32px 44px" : "52px 64px 56px",
        }}>

          {/* Brand column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Link href="/">
              <Image
                src="/logo.jpg"
                alt="Mannequin Care"
                width={140} height={40}
                style={{ height: 40, width: "auto" }}
                priority
              />
            </Link>
            <hr className="mcf-rule" />
            <p style={{ fontSize: 12.5, lineHeight: 1.85, color: "#6a5030", fontWeight: 300, maxWidth: 240 }}>
              True radiance begins with self-care — when you nurture your skin
              with love and attention, it becomes a reflection of the beauty within.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {socials.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="mcf-social" aria-label={label}>
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Find Us */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p className="mcf-heading">Find Us</p>
            <hr className="mcf-rule" />
            {contactItems.map(({ Icon, text, href }, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <Icon size={12} style={{ color: "#a08800", marginTop: 3, flexShrink: 0 }} />
                {href
                  ? <a href={href} style={{ fontSize: 12, color: "#6a5030", fontWeight: 300, textDecoration: "none" }}>{text}</a>
                  : <span style={{ fontSize: 12, color: "#6a5030", fontWeight: 300 }}>{text}</span>
                }
              </div>
            ))}
          </div>

          {/* Nav columns */}
          {footerLinks.map((col) => (
            <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p className="mcf-heading">{col.title}</p>
              <hr className="mcf-rule" />
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
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
          <p className="mcf-tagline-bar">Skincare · Crafted for You</p>
          <div className="mcf-banner-inner">
            <PetalBanner
              text={isMobile ? "mannequincare" : "Mannequincare.in"}
              fontSize={isMobile ? 48 : isTablet ? 68 : 88}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="mcf-bottom">
          <span style={{ fontSize: 11.5, color: "#8a7040", fontWeight: 300, fontFamily: "'DM Sans',sans-serif" }}>
            © 2025 Mannequincare.in · All rights reserved
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="mcf-badge">
              <Banknote size={12} style={{ color: "#2a7a40" }} /> COD
            </span>
            <span className="mcf-badge">
              <CreditCard size={12} style={{ color: "#2a4a9a" }} /> Razorpay
            </span>
          </div>
        </div>

      </footer>
    </>
  );
}