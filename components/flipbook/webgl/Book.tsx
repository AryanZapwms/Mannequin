"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";
import Page from "./Page";
import { PAGE_WIDTH } from "./book-constants";
import type { PageTextures } from "./page-textures";

type BookProps = {
  textures: PageTextures[];
  page: number;
  setPage: (next: number) => void;
};

export default function Book({ textures, page, setPage }: BookProps) {
  const pageCount = textures.length;

  // Turn one leaf at a time even when the target jumps several pages, so a
  // big skip animates as a believable flurry of flips instead of snapping.
  // The timer is scheduled from an effect (never inside the state updater),
  // so React's dev double-invoke can't spawn duplicate racing loops — that
  // race was the source of the flicker on rapid next/back clicks.
  const [delayedPage, setDelayedPage] = useState(page);
  useEffect(() => {
    if (delayedPage === page) return;
    const distance = Math.abs(page - delayedPage);
    const id = setTimeout(
      () => setDelayedPage((current) => current + Math.sign(page - current)),
      distance > 2 ? 60 : 160,
    );
    return () => clearTimeout(id);
  }, [delayedPage, page]);

  // The leaves all grow rightward from the spine, so a one-sided book
  // (just the cover, or fully flipped to the back) sits off-centre while a
  // balanced spread is centred. Glide the whole book sideways to keep the
  // visible content centred in every state.
  const recenter = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!recenter.current) return;
    const hasLeft = delayedPage > 0;
    const hasRight = delayedPage < pageCount;
    const rightExtent = hasRight ? PAGE_WIDTH : 0;
    const leftExtent = hasLeft ? -PAGE_WIDTH : 0;
    const targetX = -(rightExtent + leftExtent) / 2;
    easing.damp(recenter.current.position, "x", targetX, 0.22, delta);
  });

  return (
    <group ref={recenter}>
      <group rotation-y={-Math.PI / 2}>
        {textures.map((tex, index) => (
          <Page
            key={index}
            number={index}
            page={delayedPage}
            opened={delayedPage > index}
            bookClosed={delayedPage === 0 || delayedPage === pageCount}
            hard={index === 0 || index === pageCount - 1}
            front={tex.front}
            back={tex.back}
            onClick={() => setPage(delayedPage > index ? index : index + 1)}
          />
        ))}
      </group>
    </group>
  );
}
