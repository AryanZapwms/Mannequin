export const BROCHURE_PHOTO_COUNT = 16;

export const BROCHURE_PHOTOS = Array.from(
  { length: BROCHURE_PHOTO_COUNT },
  (_, i) => `/brochure/${i + 1}.jpg`,
);

// Photos are 2000x1409px — landscape, ~A4 (√2:1) — used as the uniform
// page-slot ratio so every photo fills its page without letterboxing.
const PHOTO_RATIO = 2000 / 1409;

export const PAGE_WIDTH = 400;
export const PAGE_HEIGHT = Math.round(PAGE_WIDTH / PHOTO_RATIO);

export const PAGE_MIN_WIDTH = 240;
export const PAGE_MAX_WIDTH = 520;
export const PAGE_MIN_HEIGHT = Math.round(PAGE_MIN_WIDTH / PHOTO_RATIO);
export const PAGE_MAX_HEIGHT = Math.round(PAGE_MAX_WIDTH / PHOTO_RATIO);

export type BrochurePage =
  | { type: "cover" }
  | { type: "blank" }
  | { type: "photo"; src: string; pageNumber: number }
  | { type: "end" };

/**
 * Page order for the flip book. With `showCover`, the first and last
 * entries render alone (as hard covers); everything between pairs up
 * into spreads. Pairing a blank filler before each photo means every
 * photo lands on the right-hand page of its spread.
 */
export const BROCHURE_PAGES: BrochurePage[] = [
  { type: "cover" },
  ...BROCHURE_PHOTOS.flatMap((src, i): BrochurePage[] => [
    { type: "blank" },
    { type: "photo", src, pageNumber: i + 1 },
  ]),
  { type: "end" },
];


