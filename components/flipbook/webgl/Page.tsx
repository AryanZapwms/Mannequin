"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import {
  EASING_FACTOR,
  EASING_FACTOR_FOLD,
  INSIDE_CURVE_STRENGTH,
  OUTSIDE_CURVE_STRENGTH,
  PAGE_DEPTH,
  PAGE_HEIGHT,
  PAGE_SEGMENTS,
  PAGE_WIDTH,
  SEGMENT_WIDTH,
  TURNING_CURVE_STRENGTH,
} from "./book-constants";

const { degToRad } = THREE.MathUtils;

// One shared geometry for every page. The origin is shifted to the left
// (spine) edge so a leaf rotates about its binding, and each vertex is
// skin-weighted to the two nearest bones for smooth bending.
const pageGeometry = new THREE.BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2,
);
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

{
  const position = pageGeometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndexes: number[] = [];
  const skinWeights: number[] = [];
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }
  pageGeometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(skinIndexes, 4),
  );
  pageGeometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(skinWeights, 4),
  );
}

const whiteColor = new THREE.Color("white");
const emissiveColor = new THREE.Color("#FFD700");

// Edge materials shared across all pages. Alternating the open edges (fore-
// edge, top, bottom) between two paper shades makes the block read as a stack
// of leaves rather than a smooth box; the spine side stays a single solid tone
// so the bound edge looks like a continuous spine; the covers get a deeper
// board tone so they read as hardback boards.
const edgePaperA = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#f4ecd9"),
  roughness: 0.96,
  metalness: 0,
});
const edgePaperB = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#cdbd98"),
  roughness: 0.96,
  metalness: 0,
});
const spineMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#F1E7CF"),
  roughness: 0.85,
  metalness: 0,
});
const boardMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#d8c49a"),
  roughness: 0.78,
  metalness: 0,
});

type PageProps = {
  number: number;
  page: number;
  opened: boolean;
  bookClosed: boolean;
  hard: boolean;
  front: THREE.Texture;
  back: THREE.Texture;
  onClick: () => void;
};

export default function Page({
  number,
  page,
  opened,
  bookClosed,
  hard,
  front,
  back,
  onClick,
}: PageProps) {
  const group = useRef<THREE.Group>(null);
  const skinnedMeshRef = useRef<THREE.SkinnedMesh>(null);
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  const manualSkinnedMesh = useMemo(() => {
    const bones: THREE.Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new THREE.Bone();
      bones.push(bone);
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new THREE.Skeleton(bones);

    // Face order is [+x foreEdge, -x spine, +y top, -y bottom, +z front, -z back].
    const openEdge = hard
      ? boardMaterial
      : number % 2 === 0
        ? edgePaperA
        : edgePaperB;
    const spine = hard ? boardMaterial : spineMaterial;

    const pageMaterials = [
      openEdge,
      spine,
      openEdge,
      openEdge,
      new THREE.MeshStandardMaterial({
        color: whiteColor,
        map: front,
        roughness: 0.7,
        metalness: 0,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new THREE.MeshStandardMaterial({
        color: whiteColor,
        map: back,
        roughness: 0.7,
        metalness: 0,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];

    const mesh = new THREE.SkinnedMesh(pageGeometry, pageMaterials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [front, back, hard, number]);

  // The two face materials are created imperatively (per page, each with its
  // own map), so R3F won't auto-dispose them — release them on unmount. The
  // geometry and edge material are shared singletons and must NOT be disposed.
  useEffect(() => {
    return () => {
      const materials = manualSkinnedMesh.material as THREE.Material[];
      materials[4]?.dispose();
      materials[5]?.dispose();
      manualSkinnedMesh.skeleton.dispose();
    };
  }, [manualSkinnedMesh]);

  useFrame((_, delta) => {
    const mesh = skinnedMeshRef.current;
    if (!mesh) return;

    const materials = mesh.material as THREE.MeshStandardMaterial[];
    const emissiveTarget = highlighted ? 0.18 : 0;
    easing.damp(materials[4], "emissiveIntensity", emissiveTarget, 0.2, delta);
    easing.damp(materials[5], "emissiveIntensity", emissiveTarget, 0.2, delta);

    if (lastOpened.current !== opened) {
      turnedAt.current = Date.now();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(400, Date.now() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = mesh.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];
      if (!target) continue;

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

      let rotationAngle =
        INSIDE_CURVE_STRENGTH * insideCurveIntensity * targetRotation -
        OUTSIDE_CURVE_STRENGTH * outsideCurveIntensity * targetRotation +
        TURNING_CURVE_STRENGTH * turningIntensity * targetRotation;
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }

      easing.dampAngle(target.rotation, "y", rotationAngle, EASING_FACTOR, delta);

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        EASING_FACTOR_FOLD,
        delta,
      );
    }
  });

  return (
    <group
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
}
