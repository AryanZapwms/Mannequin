import { BROCHURE_PHOTOS, BROCHURE_PHOTO_COUNT } from "../flipbook-data";

// ── Page geometry (world units) ──────────────────────────────────────
// Photos are 2000x1409 (landscape, ~√2:1). The page's turning axis (its
// horizontal width, spine -> outer edge) maps to the image width; the
// vertical height maps to the image height, so the texture never distorts.
export const PHOTO_RATIO = 2000 / 1409;

export const PAGE_WIDTH = 1.28;
export const PAGE_HEIGHT = PAGE_WIDTH / PHOTO_RATIO; // ≈ 0.902
export const PAGE_DEPTH = 0.006;
export const PAGE_SEGMENTS = 30;
export const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

// Open-spread footprint, used for auto-fit scaling and centering.
export const SPREAD_WIDTH = PAGE_WIDTH * 2;

// ── Camera (shared by the Canvas and the auto-fit maths) ─────────────
export const CAMERA_FOV = 40;
// A gentle 3/4 angle so the spine and page-block read as a book at a glance
// (front-on it looks like a flat card). Users can still orbit a full 360°.
export const CAMERA_POSITION: [number, number, number] = [0.95, 0.5, 2.8];
export const CAMERA_DISTANCE = 3.0;

// ── Bend tuning (how a leaf curls as it turns) ───────────────────────
export const EASING_FACTOR = 0.5;
export const EASING_FACTOR_FOLD = 0.3;
export const INSIDE_CURVE_STRENGTH = 0.18;
export const OUTSIDE_CURVE_STRENGTH = 0.05;
export const TURNING_CURVE_STRENGTH = 0.09;

// ── Leaf model ───────────────────────────────────────────────────────
// Each physical leaf has two printed faces. With the cover first, an open
// spread shows the *back* of the previous leaf on the left and the *front*
// of the next leaf on the right. Giving every photo leaf `front = photo`,
// `back = blank` keeps every photo on the right-hand page.
export type LeafFace =
  | { kind: "cover" }
  | { kind: "back-cover" }
  | { kind: "end" }
  | { kind: "blank" }
  | { kind: "photo"; pageNumber: number; src: string };

export type Leaf = { front: LeafFace; back: LeafFace };

export const PHOTO_COUNT = BROCHURE_PHOTO_COUNT;

export const LEAVES: Leaf[] = [
  { front: { kind: "cover" }, back: { kind: "blank" } },
  ...BROCHURE_PHOTOS.map(
    (src, i): Leaf => ({
      front: { kind: "photo", pageNumber: i + 1, src },
      back: { kind: "blank" },
    }),
  ),
  { front: { kind: "end" }, back: { kind: "back-cover" } },
];

export const LEAF_COUNT = LEAVES.length; // 18
