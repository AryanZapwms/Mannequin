"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, OrbitControls, Stats } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ZoomIn, ZoomOut } from "lucide-react";
import Book from "./Book";
import {
  buildPageTextures,
  disposePageTextures,
  type PageTextures,
} from "./page-textures";
import {
  CAMERA_DISTANCE,
  CAMERA_FOV,
  CAMERA_POSITION,
  LEAF_COUNT,
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from "./book-constants";

type BookSceneProps = {
  page: number;
  setPage: (next: number) => void;
};

/**
 * Scales its children so whatever is currently on screen — a single cover
 * page when closed, a two-page spread when open — fills the canvas, for any
 * aspect ratio. This keeps the book large on wide desktops and narrow phones
 * alike, and animates the scale so it eases as the book opens and closes.
 */
function FitToViewport({
  page,
  children,
}: {
  page: number;
  children: ReactNode;
}) {
  const { size } = useThree();
  const ref = useRef<THREE.Group>(null);
  const aspect = size.width / Math.max(1, size.height);

  const visibleHeight =
    2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_DISTANCE;
  const visibleWidth = visibleHeight * aspect;

  // How many pages are visible right now (1 closed/at-back, 2 mid-spread).
  const pagesShown = (page < LEAF_COUNT ? 1 : 0) + (page > 0 ? 1 : 0) || 1;
  const contentWidth = pagesShown * PAGE_WIDTH;

  const target = Math.min(
    (visibleWidth * 0.94) / contentWidth,
    (visibleHeight * 0.94) / PAGE_HEIGHT,
  );

  useFrame((_, delta) => {
    if (ref.current) easing.damp3(ref.current.scale, target, 0.28, delta);
  });

  return (
    <group ref={ref} scale={target}>
      {children}
    </group>
  );
}

const MIN_DISTANCE = 1.8;
const MAX_DISTANCE = 5.5;

export default function BookScene({ page, setPage }: BookSceneProps) {
  const [textures, setTextures] = useState<PageTextures[] | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Dolly the camera toward / away from the book for the +/- buttons. Scroll
  // and pinch are handled by OrbitControls' own zoom.
  const dolly = (factor: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object;
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const distance = THREE.MathUtils.clamp(
      offset.length() * factor,
      MIN_DISTANCE,
      MAX_DISTANCE,
    );
    offset.setLength(distance);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  };

  // Wait for the brand webfonts before rasterising the branded pages so the
  // cover/end typography matches the rest of the site.
  useEffect(() => {
    let active = true;
    let built: PageTextures[] | null = null;
    const build = () => {
      if (!active) return;
      built = buildPageTextures();
      setTextures(built);
    };
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(build).catch(build);
    } else {
      build();
    }
    return () => {
      active = false;
      // Free GPU texture memory when leaving the page.
      if (built) disposePageTextures(built);
    };
  }, []);

  const showStats =
    typeof window !== "undefined" && window.location.search.includes("perf");

  const zoomButton =
    "pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-sand bg-white/90 text-brand-espresso shadow-soft backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold-300 hover:text-brand-copper hover:shadow-card";

  return (
    <>
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
        preserveDrawingBuffer: true,
      }}
      camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: 0.1, far: 50 }}
    >
      <ambientLight intensity={0.62} color="#fff4dd" />
      <hemisphereLight intensity={0.45} color="#fff6e6" groundColor="#d9c39a" />
      <directionalLight
        position={[2.5, 4.5, 3.5]}
        intensity={1.5}
        color="#fff2d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-4, 4, 4, -4, 0.5, 20]}
        />
      </directionalLight>
      <pointLight position={[-3, 1.5, 3]} intensity={0.5} color="#ffe9c2" />

      <FitToViewport page={page}>
        <Suspense fallback={null}>
          {textures && (
            <Book textures={textures} page={page} setPage={setPage} />
          )}
        </Suspense>

        <ContactShadows
          position={[0, -PAGE_HEIGHT / 2 - 0.04, 0]}
          opacity={0.42}
          scale={5}
          blur={2.6}
          far={1.6}
          resolution={1024}
          color="#3D2B1F"
        />
      </FitToViewport>

      <OrbitControls
        ref={controlsRef}
        regress
        enablePan={false}
        enableZoom
        zoomSpeed={0.8}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.88}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />

      {/* Drop the pixel ratio automatically if a device can't keep up. */}
      <AdaptiveDpr pixelated />
      {showStats && <Stats />}
    </Canvas>

      <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => dolly(0.8)}
          className={zoomButton}
        >
          <ZoomIn className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => dolly(1.25)}
          className={zoomButton}
        >
          <ZoomOut className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </>
  );
}
