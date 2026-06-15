import * as THREE from "three";
import { LEAVES, type LeafFace, PHOTO_RATIO } from "./book-constants";

// Canvas resolution for every page texture. Kept at the photo aspect ratio
// so branded pages and photos share one geometry without letterboxing. 1024
// is plenty for a page viewed at this distance and roughly halves texture
// memory versus 1200 (per the WebGL skill's texture-sizing guidance).
const TEX_W = 1024;
const TEX_H = Math.round(TEX_W / PHOTO_RATIO);

const COLORS = {
  linen: "#F5ECD7",
  cream: "#FDF6EC",
  sand: "#E8D5B0",
  gold300: "#FFE45A",
  gold400: "#FFD700",
  gold500: "#F5C400",
  mocha: "#8B6914",
  espresso: "#3D2B1F",
  copper: "#C47A2B",
  body: "#5C4033",
} as const;

// Font stacks fall back gracefully if the brand webfonts aren't yet ready
// on the canvas — the texture is redrawn once `document.fonts.ready` fires.
const F_LOGO = `"Quicksand", "Century Gothic", sans-serif`;
const F_DISPLAY = `"Cormorant Garamond", Georgia, serif`;
const F_SUB = `"Jost", "Helvetica Neue", sans-serif`;
const F_BODY = `"Nunito Sans", "Helvetica Neue", sans-serif`;

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  return canvas;
}

function paperBackground(ctx: CanvasRenderingContext2D, glow = true) {
  ctx.fillStyle = COLORS.linen;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  if (glow) {
    const g = ctx.createRadialGradient(
      TEX_W / 2,
      TEX_H * 0.42,
      TEX_H * 0.1,
      TEX_W / 2,
      TEX_H * 0.42,
      TEX_H * 0.95,
    );
    g.addColorStop(0, "rgba(255,228,90,0.18)");
    g.addColorStop(1, "rgba(255,228,90,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
  }
}

function goldFrame(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = COLORS.gold300;
  ctx.lineWidth = 6;
  ctx.strokeRect(34, 34, TEX_W - 68, TEX_H - 68);
  ctx.strokeStyle = "rgba(255,215,0,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(54, 54, TEX_W - 108, TEX_H - 108);
}

function letterSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  spacing: number,
) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let x = cx - total / 2;
  ctx.textAlign = "left";
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x, y);
    x += widths[i];
  }
  ctx.textAlign = "center";
}

/** "manneQuin's" with an oversized Q, centred at (cx, y). */
function drawWordmark(ctx: CanvasRenderingContext2D, cx: number, y: number) {
  const base = Math.round(TEX_H * 0.16);
  const big = Math.round(base * 1.32);
  type Seg = { t: string; size: number; weight: string };
  const segs: Seg[] = [
    { t: "manne", size: base, weight: "500" },
    { t: "Q", size: big, weight: "600" },
    { t: "uin’s", size: base, weight: "500" },
  ];
  const widths = segs.map((s) => {
    ctx.font = `${s.weight} ${s.size}px ${F_LOGO}`;
    return ctx.measureText(s.t).width;
  });
  const total = widths.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COLORS.espresso;
  segs.forEach((s, i) => {
    ctx.font = `${s.weight} ${s.size}px ${F_LOGO}`;
    ctx.fillText(s.t, x, y);
    x += widths[i];
  });
  ctx.textAlign = "center";
}

function drawCover(ctx: CanvasRenderingContext2D) {
  paperBackground(ctx);
  goldFrame(ctx);

  ctx.fillStyle = COLORS.copper;
  ctx.font = `500 ${Math.round(TEX_H * 0.036)}px ${F_SUB}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  letterSpaced(ctx, "✦  OUR CATALOGUE  ✦", TEX_W / 2, TEX_H * 0.3, 6);

  drawWordmark(ctx, TEX_W / 2, TEX_H * 0.56);

  ctx.fillStyle = COLORS.mocha;
  ctx.font = `500 ${Math.round(TEX_H * 0.03)}px ${F_SUB}`;
  letterSpaced(ctx, "VITAMIN E SKINCARE & HAIRCARE", TEX_W / 2, TEX_H * 0.7, 4);
}

function drawEnd(ctx: CanvasRenderingContext2D) {
  paperBackground(ctx);
  goldFrame(ctx);

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.espresso;
  ctx.font = `italic 300 ${Math.round(TEX_H * 0.14)}px ${F_DISPLAY}`;
  ctx.fillText("Thank You", TEX_W / 2, TEX_H * 0.4);

  ctx.fillStyle = COLORS.body;
  ctx.font = `400 ${Math.round(TEX_H * 0.04)}px ${F_BODY}`;
  ctx.fillText("for browsing the Mannequin Care catalogue.", TEX_W / 2, TEX_H * 0.54);

  ctx.strokeStyle = COLORS.gold400;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(TEX_W / 2 - 40, TEX_H * 0.62);
  ctx.lineTo(TEX_W / 2 + 40, TEX_H * 0.62);
  ctx.stroke();

  ctx.fillStyle = COLORS.copper;
  ctx.font = `500 ${Math.round(TEX_H * 0.038)}px ${F_SUB}`;
  letterSpaced(ctx, "MANNEQUINCARE.IN", TEX_W / 2, TEX_H * 0.72, 4);
  ctx.fillStyle = COLORS.mocha;
  ctx.font = `400 ${Math.round(TEX_H * 0.032)}px ${F_SUB}`;
  ctx.fillText("info@mannequincare.in", TEX_W / 2, TEX_H * 0.79);
}

function drawBackCover(ctx: CanvasRenderingContext2D) {
  paperBackground(ctx);
  goldFrame(ctx);
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.gold400;
  ctx.font = `300 ${Math.round(TEX_H * 0.12)}px ${F_DISPLAY}`;
  ctx.fillText("✦", TEX_W / 2, TEX_H * 0.46);
  ctx.fillStyle = COLORS.mocha;
  ctx.font = `500 ${Math.round(TEX_H * 0.03)}px ${F_SUB}`;
  letterSpaced(ctx, "MANNEQUINCARE.IN", TEX_W / 2, TEX_H * 0.62, 4);
}

function drawBlank(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.linen;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,228,90,0.7)";
  ctx.font = `300 ${Math.round(TEX_H * 0.07)}px ${F_DISPLAY}`;
  ctx.fillText("✦", TEX_W / 2, TEX_H * 0.54);
}

function drawPhotoPlaceholder(ctx: CanvasRenderingContext2D, pageNumber: number) {
  paperBackground(ctx, false);
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.gold400;
  ctx.font = `300 ${Math.round(TEX_H * 0.09)}px ${F_DISPLAY}`;
  ctx.fillText("✦", TEX_W / 2, TEX_H * 0.42);
  ctx.fillStyle = COLORS.copper;
  ctx.font = `500 ${Math.round(TEX_H * 0.04)}px ${F_SUB}`;
  letterSpaced(ctx, `PAGE ${pageNumber}`, TEX_W / 2, TEX_H * 0.56, 4);
  ctx.fillStyle = COLORS.mocha;
  ctx.font = `400 ${Math.round(TEX_H * 0.03)}px ${F_SUB}`;
  ctx.fillText("image coming soon", TEX_W / 2, TEX_H * 0.64);
}

/** Cover-fit (center-crop) draw of a loaded image onto the page canvas. */
function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const scale = Math.max(TEX_W / img.width, TEX_H / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (TEX_W - w) / 2, (TEX_H - h) / 2, w, h);
}

function finalize(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Mipmaps + 4x anisotropy keep pages crisp at a glancing angle without the
  // cost of 8x (2-4x is the skill's recommended sweet spot).
  texture.anisotropy = 4;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function textureForFace(face: LeafFace): THREE.Texture {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d")!;

  switch (face.kind) {
    case "cover":
      drawCover(ctx);
      break;
    case "end":
      drawEnd(ctx);
      break;
    case "back-cover":
      drawBackCover(ctx);
      break;
    case "blank":
      drawBlank(ctx);
      break;
    case "photo": {
      drawPhotoPlaceholder(ctx, face.pageNumber);
      const texture = finalize(canvas);
      // Swap the placeholder for the real photo once it loads. Missing
      // files simply keep the branded placeholder.
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, TEX_W, TEX_H);
        drawImageCover(ctx, img);
        texture.needsUpdate = true;
      };
      img.src = face.src;
      return texture;
    }
  }
  return finalize(canvas);
}

export type PageTextures = { front: THREE.Texture; back: THREE.Texture };

/**
 * Builds front/back textures for every leaf. Client-only (uses canvas).
 * Every blank face is visually identical, so they share a single texture —
 * that drops the unique texture count from 36 to ~20 and avoids redundant
 * GPU uploads.
 */
export function buildPageTextures(): PageTextures[] {
  let blank: THREE.Texture | null = null;
  const forFace = (face: LeafFace) => {
    if (face.kind === "blank") {
      if (!blank) blank = textureForFace(face);
      return blank;
    }
    return textureForFace(face);
  };

  return LEAVES.map((leaf) => ({
    front: forFace(leaf.front),
    back: forFace(leaf.back),
  }));
}

/** Disposes every unique texture in a built page set (call on unmount). */
export function disposePageTextures(pages: PageTextures[]) {
  const seen = new Set<THREE.Texture>();
  for (const { front, back } of pages) {
    for (const texture of [front, back]) {
      if (!seen.has(texture)) {
        seen.add(texture);
        texture.dispose();
      }
    }
  }
}
