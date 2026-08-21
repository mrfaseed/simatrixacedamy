import { useEffect, useRef, useState } from "react";

/**
 * CustomCursor
 * ------------
 * Mount once near the root of the app (e.g. in App.jsx, alongside <Outlet />).
 * Renders a glowing blue-to-violet ring that trails the real cursor with a
 * light spring lag, and grows + intensifies over anything with
 * `data-cursor="hover"` (buttons, links, cards). Automatically no-ops on
 * touch/coarse-pointer devices so it never gets in the way on mobile.
 */
export default function CustomCursor() {
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (coarse) return;
    setEnabled(true);

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { x: pos.x, y: pos.y };

    function onMove(e) {
      target.x = e.clientX;
      target.y = e.clientY;
    }

    function onOver(e) {
      setHovering(!!e.target.closest('[data-cursor="hover"]'));
    }

    let raf;
    function tick() {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ringRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full transition-[width,height,opacity] duration-300 ease-out"
      style={{
        width: hovering ? 56 : 26,
        height: hovering ? 56 : 26,
        border: "1.5px solid transparent",
        backgroundImage:
          "linear-gradient(#0000,#0000), linear-gradient(135deg, #4FC3F7, #C026D3)",
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box",
        boxShadow: hovering
          ? "0 0 30px 6px rgba(123,47,203,0.35), 0 0 20px 2px rgba(79,195,247,0.35)"
          : "0 0 14px 2px rgba(79,195,247,0.25)",
        mixBlendMode: "screen",
      }}
    />
  );
}