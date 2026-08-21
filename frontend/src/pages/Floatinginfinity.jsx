import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * FloatingInfinity
 * -----------------
 * A 3D infinity-symbol mesh (torus knot-free, built from two lobed tubes)
 * rendered in the Simatrix palette. The right lobe fades into a field of
 * glowing point-sprites that drift outward, echoing "infinite learning
 * dissolving into data". Mouse position gently steers rotation; scroll
 * progress (0–1, passed in as a prop) drives a slow base rotation so the
 * object still feels alive when the cursor is idle.
 *
 * Gradient stops (skyBlue → deepBlue → royalBlue → violet → magenta) are
 * sampled directly from the Simatrix Academy mark, applied as per-vertex
 * color along the tube's x-position so the 3D piece reads the same way
 * the flat logo does: blue on the left, deepening through navy at the
 * crossing, dissolving to violet/magenta pixels on the right.
 */
// Exact stops lifted from the Simatrix mark: sky blue on the left lobe,
// deepening through navy at the crossing, resolving to violet on the
// right before it fragments into pixels.
const PALETTE = {
  skyBlue: "#1EA7E8",
  deepBlue: "#1568C4",
  royalBlue: "#241C6B",
  violet: "#7B2FCB",
  magenta: "#9333EA",
};

const GRADIENT_STOPS = [
  { x: -1.6, color: new THREE.Color(PALETTE.skyBlue) },
  { x: -0.4, color: new THREE.Color(PALETTE.deepBlue) },
  { x: 0, color: new THREE.Color(PALETTE.royalBlue) },
  { x: 0.6, color: new THREE.Color(PALETTE.violet) },
  { x: 1.6, color: new THREE.Color(PALETTE.magenta) },
];

function colorForX(x) {
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const a = GRADIENT_STOPS[i];
    const b = GRADIENT_STOPS[i + 1];
    if (x >= a.x && x <= b.x) {
      const t = (x - a.x) / (b.x - a.x || 1);
      return a.color.clone().lerp(b.color, t);
    }
  }
  return x < GRADIENT_STOPS[0].x
    ? GRADIENT_STOPS[0].color
    : GRADIENT_STOPS[GRADIENT_STOPS.length - 1].color;
}

// A small square sprite (drawn once to a canvas) so the dissolve reads as
// pixel fragments, matching the logo's cut-square debris — not round dots.
function useSquareSprite() {
  return useMemo(() => {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    const pad = size * 0.18;
    ctx.fillRect(pad, pad, size - pad * 2, size - pad * 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function InfinityMesh({ pointer, squareSprite }) {
  const group = useRef();
  const solid = useRef();

  // Build an infinity (lemniscate) curve, extrude a tube along it, then
  // paint a per-vertex color gradient using each vertex's x position so
  // the tube reads sky-blue → navy → violet exactly like the mark.
  const geometry = useMemo(() => {
    const points = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const scale = 1.6;
      const x = (scale * Math.cos(t)) / (1 + Math.sin(t) ** 2);
      const y = (scale * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) ** 2);
      points.push(new THREE.Vector3(x, y, 0));
    }
    const path = new THREE.CatmullRomCurve3(points, true);
    const tube = new THREE.TubeGeometry(path, 300, 0.16, 24, true);

    const posAttr = tube.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count; i++) {
      const c = colorForX(posAttr.getX(i));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    tube.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return tube;
  }, []);

  // Square-pixel cloud standing in for the "dissolving" right lobe —
  // colored violet-to-magenta to match where the mark actually fragments.
  const particleGeo = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const scale = 1.6;
      let x = (scale * Math.cos(t)) / (1 + Math.sin(t) ** 2);
      let y = (scale * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) ** 2);
      // Only keep points on the right lobe (x > 0), then scatter them outward
      if (x < 0) {
        x = -x;
      }
      const spread = Math.random() * 1.8;
      const angle = Math.random() * Math.PI * 2;
      const px = x + Math.cos(angle) * spread * 0.4 + 0.4;
      positions[i * 3] = px;
      positions[i * 3 + 1] = y + Math.sin(angle) * spread * 0.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      const c = colorForX(Math.min(1.6, px));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    // Idle auto-rotation
    group.current.rotation.y += delta * 0.15;
    // Mouse parallax — lerp toward pointer for a soft, weighted feel
    const targetX = pointer.current.y * 0.25;
    const targetY = pointer.current.x * 0.4;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (targetY * 0.3 - group.current.rotation.z) * 0.04;
  });

  return (
    <group ref={group}>
      <mesh ref={solid} geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          vertexColors
          metalness={0.55}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissiveIntensity={0.25}
        />
      </mesh>
      <points geometry={particleGeo}>
        <pointsMaterial
          size={0.07}
          map={squareSprite}
          vertexColors
          transparent
          opacity={0.9}
          alphaTest={0.2}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function Rig({ pointer }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.current.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (-pointer.current.y * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ pointer }) {
  const squareSprite = useSquareSprite();
  return (
    <>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
        <InfinityMesh pointer={pointer} squareSprite={squareSprite} />
      </Float>
      <Environment preset="city" />
    </>
  );
}

export default function FloatingInfinity({ className = "" }) {
  const pointer = useRef({ x: 0, y: 0 });

  function handlePointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  }

  return (
    <div
      className={className}
      onPointerMove={handlePointerMove}
      style={{ width: "100%", height: "100%" }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[null]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 4, 5]}
          intensity={1.4}
          color={PALETTE.skyBlue}
          castShadow
        />
        <pointLight position={[-4, -2, -3]} intensity={0.8} color={PALETTE.violet} />
        <Suspense fallback={null}>
          <Scene pointer={pointer} />
        </Suspense>
        <Rig pointer={pointer} />
      </Canvas>
    </div>
  );
}