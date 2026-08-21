import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { mediaUrl } from "../api/client";
import { courseLogo, courseIcon } from "../lib/courseLogo";

// Palette
const NAVY = "#0A0A1F";
const ACCENT_BLUE = "#00A0F8";
const ACCENT_PURPLE = "#9800E8";
const LIGHT_GRAY = "#ECECF1";
const PURE_WHITE = "#FFFFFF";

const TIER_STYLES = {
  premium: "bg-[#9800E8]/10 text-[#6000A8] ring-[#9800E8]/40 font-semibold",
  budget: "bg-[#00A0F8]/10 text-[#0068E0] ring-[#00A0F8]/40 font-semibold",
  classic: "bg-[#0068E0]/5 text-[#0018A0] ring-[#9800E8]/30 font-semibold",
};

const NAVY_COLOR = 0x0018a0;
const PURPLE_COLOR = 0x9800e8;

/**
 * Rasterizes an image onto a canvas (handles SVGs properly)
 */
function imageToCanvas(src, { size = 256, padding = 0.15 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, size, size);

      const maxDim = size * (1 - padding * 2);
      const iw = img.naturalWidth || img.width || maxDim;
      const ih = img.naturalHeight || img.height || maxDim;
      const scale = Math.min(maxDim / iw, maxDim / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Renders an icon to canvas
 */
async function iconToCanvas(iconClass, { size = 256, color = NAVY } = {}) {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const markup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
          <i class="${iconClass}" style="font-size:${Math.round(size * 0.55)}px;line-height:1;color:${color};"></i>
        </div>
      </foreignObject>
    </svg>`;
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = svgUrl;
  });
}

/**
 * 3D Medallion/Gem for course cards
 */
function CardShape3D({ hovered, logoSrc, iconClass, iconColor = NAVY, onLogoError }) {
  const mountRef = useRef(null);
  const hoveredRef = useRef(hovered);
  const [inView, setInView] = useState(false);
  const [iconTextureReady, setIconTextureReady] = useState(false);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !inView) return;

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 4, 5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(PURPLE_COLOR, 0.5);
    rim.position.set(-4, -2, 2);
    scene.add(rim);

    let mesh, geometry, wireGeometry, wireMaterial, material, texture;
    let cancelled = false;
    let isMedallion = false;
    const phaseOffset = Math.random() * Math.PI * 2;

    const buildGem = () => {
      geometry = new THREE.IcosahedronGeometry(1.3, 0);
      material = new THREE.MeshStandardMaterial({
        color: PURPLE_COLOR,
        metalness: 0.6,
        roughness: 0.25,
        transparent: true,
        opacity: 0.85,
        flatShading: true,
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      wireGeometry = new THREE.EdgesGeometry(geometry);
      wireMaterial = new THREE.LineBasicMaterial({
        color: NAVY_COLOR,
        transparent: true,
        opacity: 0.35,
      });
      const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
      mesh.add(wireframe);
    };

    const buildMedallion = (tex) => {
      texture = tex;
      texture.colorSpace = THREE.SRGBColorSpace;

      geometry = new THREE.PlaneGeometry(1.9, 1.9);

      material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.5,
        transparent: true,
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    };

    if (logoSrc) {
      imageToCanvas(logoSrc)
        .then((canvas) => {
          if (cancelled) return;
          const canvasTexture = new THREE.CanvasTexture(canvas);
          buildMedallion(canvasTexture);
          isMedallion = true;
        })
        .catch((err) => {
          console.error("Logo texture failed:", logoSrc, err);
          if (!cancelled) {
            buildGem();
            onLogoError?.();
          }
        });
    } else if (iconClass) {
      iconToCanvas(iconClass, { color: iconColor })
        .then((canvas) => {
          if (cancelled) return;
          const canvasTexture = new THREE.CanvasTexture(canvas);
          buildMedallion(canvasTexture);
          isMedallion = true;
          setIconTextureReady(true);
        })
        .catch(() => {
          if (!cancelled) buildGem();
        });
    } else {
      buildGem();
    }

    let frameId;
    const clock = new THREE.Clock();
    let currentScale = 1;
    let lastTime = 0;

    const animate = () => {
      const now = clock.getElapsedTime();
      const dt = now - lastTime;
      lastTime = now;

      if (mesh) {
        if (isMedallion) {
          const speed = hoveredRef.current ? 1.4 : 0.55;
          const swingY = hoveredRef.current ? 0.95 : 0.55;
          const swingX = 0.22;
          mesh.rotation.y = Math.sin(now * speed + phaseOffset) * swingY;
          mesh.rotation.x = Math.sin(now * speed * 0.6 + phaseOffset * 1.3) * swingX;
        } else {
          const speed = hoveredRef.current ? 0.6 : 0.18;
          mesh.rotation.y += dt * speed;
          mesh.rotation.x += dt * speed * 0.4;
        }

        const targetScale = hoveredRef.current ? 1.06 : 1;
        currentScale += (targetScale - currentScale) * Math.min(1, dt * 6);
        mesh.scale.setScalar(currentScale);
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      geometry?.dispose();
      wireGeometry?.dispose();
      texture?.dispose();
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else {
        material?.dispose();
      }
      wireMaterial?.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [inView, logoSrc, iconClass, iconColor]);

  useEffect(() => {
    setIconTextureReady(false);
  }, [iconClass, logoSrc]);

  const showPlaceholderIcon = !logoSrc && iconClass && !iconTextureReady;

  return (
    <div ref={mountRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      {showPlaceholderIcon && (
        <div className="absolute inset-0 grid place-items-center">
          <i className={`${iconClass} text-6xl`} style={{ color: iconColor }} />
        </div>
      )}
    </div>
  );
}

export default function CourseCard({ course }) {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  const logo = courseLogo(course);
  const showUploaded = course.image && !imgError;
  const showLogo = !showUploaded && logo && !logoError;
  const iconClass = !showUploaded && !showLogo ? courseIcon(course) : null;

  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const onMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el || reduce) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.style.setProperty(
        "--tilt",
        `perspective(1000px) rotateY(${(px - 0.5) * 6}deg) rotateX(${(0.5 - py) * 6}deg) translateY(-4px)`
      );
    },
    [reduce]
  );

  const reset = useCallback(() => {
    if (ref.current) ref.current.style.removeProperty("--tilt");
    setHovered(false);
  }, []);

  return (
    <Link
      ref={ref}
      to={`/courses/${course.slug}`}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={reset}
      data-cursor="hover"
      style={{ transform: "var(--tilt)" }}
      className="group relative flex h-full min-h-[420px] w-full flex-col overflow-hidden rounded-2xl border-2 bg-white transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:shadow-2xl"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = ACCENT_PURPLE;
        e.currentTarget.style.boxShadow = "0 20px 50px rgba(152, 0, 232, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(10,10,31,0.12)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(10,10,31,0.06)";
      }}
      style={{
        borderColor: "rgba(10,10,31,0.12)",
        boxShadow: "0 2px 8px rgba(10,10,31,0.06)",
      }}
    >
      {/* Top accent line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, transparent, ${ACCENT_BLUE}, ${ACCENT_PURPLE}, transparent)` }}
      />

      {showUploaded ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <img
            src={mediaUrl(course.image)}
            alt={course.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
          />
          <div
            className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "linear-gradient(to top, #0018A073, #0018A00D, transparent)" }}
          />
        </div>
      ) : (
        <div className="relative grid aspect-[16/9] place-items-center overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <div className="bg-dotgrid absolute inset-0 opacity-[0.05]" />
          <CardShape3D
            hovered={hovered}
            logoSrc={showLogo ? logo.src : null}
            iconClass={iconClass}
            iconColor={NAVY}
            onLogoError={() => setLogoError(true)}
          />
          {showLogo && <span className="sr-only">{logo.label}</span>}
        </div>
      )}

      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
              TIER_STYLES[course.tier] || TIER_STYLES.classic
            }`}
          >
            {course.tier}
          </span>
          {course.duration && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(10,10,31,0.5)" }}>
              <i className="ti ti-clock text-sm" /> {course.duration}
            </span>
          )}
        </div>

        <h3 className="mt-4 font-semibold leading-tight transition-colors duration-300 group-hover:text-[#6000A8]" style={{ color: NAVY, fontSize: "1.125rem" }}>
          {course.title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed line-clamp-3" style={{ color: "rgba(10,10,31,0.6)" }}>
          {course.summary}
        </p>

        <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: "rgba(10,10,31,0.08)" }}>
          <span className="text-xs font-medium tracking-wide" style={{ color: "rgba(10,10,31,0.5)" }}>
            {course.level}
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold transition-colors duration-300 group-hover:text-[#9800E8]" style={{ color: NAVY }}>
            Explore
            <i className="ti ti-arrow-right text-lg transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}