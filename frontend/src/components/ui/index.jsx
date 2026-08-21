import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Simatrix Academy brand palette (matched to logo, light theme only)
// Bright blue  -> #1358E0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED
// Pale blue bg -> #EAF1FF
// Pale violet bg -> #F3ECFF

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg animate-[fadeIn_.2s_ease-out] ${
              t.type === "success"
                ? "bg-emerald-600"
                : t.type === "error"
                ? "bg-rose-600"
                : "bg-[#1358E0]"
            }`}
          >
            <i
              className={`ti ${
                t.type === "success"
                  ? "ti-circle-check"
                  : t.type === "error"
                  ? "ti-alert-circle"
                  : "ti-info-circle"
              }`}
            />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  magnetic,
  className = "",
  children,
  ...props
}) {
  const btnRef = useRef(null);
  // Large (hero) CTAs get the magnetic pull by default; callers can force it
  // on/off with the `magnetic` prop.
  const isMagnetic = magnetic ?? size === "lg";

  const onMove = (e) => {
    const el = btnRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${mx * 0.22}px, ${my * 0.32}px)`;
  };
  const onLeave = () => {
    if (btnRef.current) btnRef.current.style.transform = "";
  };

  const variants = {
    primary: "bg-gradient-to-r from-[#1358E0] to-[#4B3CC7] text-white ring-1 ring-inset ring-white/15 shadow-sm shadow-[#1358E0]/25 hover:shadow-md hover:shadow-[#4B3CC7]/30 hover:brightness-105 focus-visible:ring-[#1358E0]/40",
    accent: "bg-[#7C3AED] text-white shadow-sm shadow-[#7C3AED]/30 hover:bg-[#6D28D9] hover:shadow-md hover:shadow-[#7C3AED]/40 focus-visible:ring-[#7C3AED]/40",
    gradient: "bg-gradient-to-br from-[#1358E0] via-[#4B3CC7] to-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25 hover:shadow-lg hover:shadow-[#7C3AED]/35 focus-visible:ring-[#7C3AED]/40",
    outline: "border border-[#1358E0]/25 text-[#1358E0] hover:bg-[#1358E0]/5 hover:border-[#1358E0]/40 focus-visible:ring-[#1358E0]/20",
    ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300",
  };
  const sizes = {
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };
  const shine = ["primary", "accent", "gradient", "danger"].includes(variant) ? "shine" : "";
  return (
    <Tag
      ref={btnRef}
      onMouseMove={isMagnetic ? onMove : undefined}
      onMouseLeave={isMagnetic ? onLeave : undefined}
      className={`group/btn inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${shine} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Field({ label, error, children, required }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
      )}
      {children}
      {error && <span className="mt-1 block text-xs text-rose-500">{error}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1358E0]/50 focus:ring-2 focus:ring-[#1358E0]/10";

export function Spinner({ className = "" }) {
  return (
    <i className={`ti ti-loader-2 animate-spin text-[#1358E0] ${className}`} role="status" aria-label="Loading" />
  );
}

export function Card({ as: Tag = "div", className = "", hover = false, children, ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-slate-200 bg-white ${
        hover ? "transition duration-200 hover:-translate-y-1 hover:border-[#1358E0]/25 hover:shadow-lg hover:shadow-[#7C3AED]/10" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Badge({ tone = "brand", className = "", children }) {
  const tones = {
    brand: "bg-[#EAF1FF] text-[#1358E0] ring-[#1358E0]/15",
    accent: "bg-[#7C3AED]/10 text-[#7C3AED] ring-[#7C3AED]/20",
    success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
    slate: "bg-slate-100 text-slate-600 ring-slate-500/15",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

// Fires once when the element scrolls into view. Shared by Reveal + others.
export function useInView({ threshold = 0.12, rootMargin = "0px 0px -8% 0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}

/**
 * Scroll-triggered entrance. `dir` controls the direction it enters from:
 * "up" (default) | "down" | "left" | "right" | "scale".
 */
export function Reveal({ as: Tag = "div", delay = 0, dir = "up", className = "", children, ...props }) {
  const [ref, visible] = useInView();
  return (
    <Tag
      ref={ref}
      data-dir={dir}
      className={`scroll-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--d": `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Section({ id, className = "", children }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------- TiltCard
// 3D tilt toward the pointer + spotlight. Wrap any card content.
export function TiltCard({ as: Tag = "div", className = "", max = 8, children, ...props }) {
  const ref = useRef(null);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * max * 2}deg) rotateX(${(0.5 - py) * max * 2}deg)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`tilt spotlight ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ----------------------------------------------------------------- Counter
// Counts up to `to` when scrolled into view. `suffix`/`prefix` optional.
export function Counter({ to = 0, duration = 1600, prefix = "", suffix = "", className = "" }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setVal(to);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(to * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  );
}

// ----------------------------------------------------------------- Marquee
export function Marquee({ children, className = "", gap = "3rem" }) {
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track" style={{ gap }}>
        <div className="flex shrink-0 items-center" style={{ gap }}>{children}</div>
        <div className="flex shrink-0 items-center" style={{ gap }} aria-hidden>{children}</div>
      </div>
    </div>
  );
}

export function PageHero({ title, subtitle, eyebrow, children }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EAF1FF] via-white to-[#F3ECFF] py-20 text-slate-900">
      <div className="bg-dotgrid absolute inset-0 opacity-20" />
      <div className="blob absolute -left-28 -top-36 h-96 w-96 rounded-full bg-[#1358E0]/10 blur-3xl" />
      <div className="blob absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#7C3AED]/10 blur-3xl" style={{ animationDelay: "-6s" }} />
      {/* violet gradient hairline at the base */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent" />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="reveal flex items-center gap-3">
          <span className="h-px w-10 bg-[#7C3AED]/50" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4B3CC7]">
            {eyebrow || "Simatrix Academy"}
          </span>
        </div>
        <h1 className="headline-reveal mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl" style={{ "--d": "120ms" }}>{title}</h1>
        {subtitle && <p className="reveal mt-4 max-w-2xl text-lg leading-relaxed text-slate-600" style={{ "--d": "320ms" }}>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => event.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/50 p-4 sm:items-center" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-[fadeIn_.15s_ease-out]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={`Close ${title}`} className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <i className="ti ti-x text-xl" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  return (
    <div ref={ref} className={`mb-10 ${center ? "text-center max-w-2xl mx-auto" : ""}`}>
      {eyebrow && (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#EAF1FF] to-[#7C3AED]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1358E0] ring-1 ring-[#7C3AED]/20 scroll-reveal ${inView ? "is-visible" : ""}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#4B3CC7] to-[#7C3AED] soft-pulse" />
          {eyebrow}
        </span>
      )}
      <h2 className={`mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl scroll-reveal ${inView ? "is-visible" : ""}`} style={{ "--d": "80ms" }}>
        <span className="bg-gradient-to-r from-[#1358E0] via-[#4B3CC7] to-[#7C3AED] bg-clip-text text-transparent">{title}</span>
      </h2>
      {subtitle && (
        <p className={`mt-3 text-slate-500 scroll-reveal ${inView ? "is-visible" : ""}`} style={{ "--d": "160ms" }}>{subtitle}</p>
      )}
      {center && (
        <span className={`mx-auto mt-5 block h-1 w-20 rounded-full bg-gradient-to-r from-[#1358E0] via-[#7C3AED] to-[#1358E0] rule-draw ${inView ? "is-visible" : ""}`} style={{ "--d": "220ms" }} />
      )}
    </div>
  );
}

export function Hairline({ className = "" }) {
  return <div className={`hairline ${className}`} />;
}
