import { useEffect, useRef } from "react";

/**
 * AuroraBackground
 * -----------------
 * Drop this as the first child of any `relative overflow-hidden` section.
 * It paints:
 *  - two large soft-blurred gradient orbs that drift on independent paths
 *  - a faint animated mesh-gradient wash
 *  - a static noise texture (SVG feTurbulence, no image request) for depth
 *
 * Pure CSS + one tiny rAF loop — no WebGL, so it's cheap enough to sit
 * behind every section without hurting the 60fps budget the 3D hero uses.
 * Respects prefers-reduced-motion by freezing the drift entirely.
 */
export default function AuroraBackground({ variant = "dark" }) {
  const orbA = useRef(null);
  const orbB = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf;
    const start = performance.now();

    function tick(now) {
      const t = (now - start) / 1000;
      if (orbA.current) {
        const x = Math.sin(t * 0.12) * 6;
        const y = Math.cos(t * 0.09) * 8;
        orbA.current.style.transform = `translate3d(${x}%, ${y}%, 0)`;
      }
      if (orbB.current) {
        const x = Math.cos(t * 0.1) * 8;
        const y = Math.sin(t * 0.14) * 6;
        orbB.current.style.transform = `translate3d(${x}%, ${y}%, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const isDark = variant === "dark";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        ref={orbA}
        className="absolute -left-1/4 -top-1/3 h-[42rem] w-[42rem] rounded-full blur-3xl transition-transform duration-1000 will-change-transform"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(30,143,224,0.35), transparent 65%)"
            : "radial-gradient(circle, rgba(30,143,224,0.14), transparent 65%)",
        }}
      />
      <div
        ref={orbB}
        className="absolute -bottom-1/3 -right-1/4 h-[42rem] w-[42rem] rounded-full blur-3xl transition-transform duration-1000 will-change-transform"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(192,38,212,0.28), transparent 65%)"
            : "radial-gradient(circle, rgba(123,47,203,0.10), transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(120deg, rgba(36,28,107,0.35), transparent 40%, rgba(79,195,247,0.06))"
            : "linear-gradient(120deg, rgba(36,28,107,0.03), transparent 40%, rgba(79,195,247,0.03))",
          mixBlendMode: isDark ? "screen" : "normal",
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}