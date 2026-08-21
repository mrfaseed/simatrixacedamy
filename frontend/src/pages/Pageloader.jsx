import { useEffect, useState } from "react";

/**
 * PageLoader
 * ----------
 * Full-screen overlay shown while `active` is true (e.g. tie it to your
 * top-level data fetch, or just a fixed timeout on first mount). Pixels
 * fade in along a rough infinity-symbol path to suggest the mark
 * "assembling", then the whole loader fades out. Pure CSS/SVG — no 3D
 * dependency, so it can paint instantly before the R3F bundle is ready.
 */
const PIXELS = Array.from({ length: 40 }).map((_, i) => {
  const t = (i / 40) * Math.PI * 2;
  const scale = 38;
  const x = 50 + (scale * Math.cos(t)) / (1 + Math.sin(t) ** 2);
  const y = 50 + (scale * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) ** 2) * 0.6;
  return { x, y, delay: i * 25 };
});

export default function PageLoader({ active = true, progress = null }) {
  const [visible, setVisible] = useState(active);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active && visible) {
      setFading(true);
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [active, visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] grid place-items-center bg-white transition-opacity duration-600 ease-out ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative h-40 w-64">
        {PIXELS.map((p, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-[2px]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: i % 2 === 0 ? "#1358E0" : "#7C3AED",
              boxShadow: "0 0 8px currentColor",
              opacity: 0,
              animation: `simatrix-pixel-in 900ms ease-out ${p.delay}ms forwards, simatrix-pixel-glow 1800ms ease-in-out ${p.delay + 900}ms infinite`,
            }}
          />
        ))}
      </div>
      {progress !== null && (
        <div className="absolute bottom-16 left-1/2 h-0.5 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: "linear-gradient(90deg, #1358E0, #7C3AED)",
            }}
          />
        </div>
      )}
      <style>{`
        @keyframes simatrix-pixel-in {
          from { opacity: 0; transform: scale(0.2); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes simatrix-pixel-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.35); }
        }
      `}</style>
    </div>
  );
}