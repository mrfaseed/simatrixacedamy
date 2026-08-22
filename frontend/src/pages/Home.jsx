import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { api, mediaUrl } from "../api/client";
import { icon } from "../lib/icons";
import { Section, Spinner, Reveal, Hairline } from "../components/ui";
import CourseCard from "../components/CourseCard";
import EnquiryForm from "../components/EnquiryForm";
import { useSeo } from "../lib/useSeo";
import heroOffer from "../assets/hero-banner.png";
import heroCareer from "../assets/hero-career-guidance.png";
import heroInternship from "../assets/hero-internship.png";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────
// CLASSIC LUXURY COLOR PALETTE — extracted from Simatrix logo
// ─────────────────────────────────────────────────────────────────
const NAVY = "#12372F";          // Deep forest — primary text
const INK_DARK = "#0B2923";      // Rich evergreen for depth
const SLATE_GRAY = "#526A64";    // Muted sage secondary text
const LIGHT_GRAY = "#F1F5EF";    // Soft botanical section background
const PURE_WHITE = "#FFFCF6";    // Warm ivory content surfaces
const SURFACE_TINT = "#F8F1E5";  // Premium sand-tinted surface
const SOFT_BLUE = "#E2F1E9";     // Pale mint accent wash
const ACCENT_BLUE = "#2A9D8F";   // Fresh emerald accent
const ACCENT_INDIGO = "#176B5B"; // Deep teal accent
const ACCENT_PURPLE = "#E76F51"; // Warm terracotta accent
const ACCENT_SOFTER = "rgba(231, 111, 81, 0.10)"; // Soft terracotta tint

const EASE = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

// ─────────────────────────────────────────────────────────────────
// PROGRAM MODAL DATA (UNCHANGED LOGIC)
// ─────────────────────────────────────────────────────────────────
const PROGRAMS = {
  "career-guidance": {
    title: "Book Your Free Career Guidance Session",
    subtitle: "Tell us a bit about yourself and our counselors will reach out to schedule your session.",
  },
  internship: {
    title: "Apply for the Free Full Stack Internship",
    subtitle: "Fill in your details below — our team will confirm your eligibility and next steps.",
  },
};

// ─────────────────────────────────────────────────────────────────
// HERO SLIDES (UNCHANGED LOGIC)
// ─────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    key: "offer",
    src: heroOffer,
    alt: "Simatrix Academy — Flat 20% Off AI & Full Stack Development courses",
    w: 1672,
    h: 941,
    hotspots: [
      { key: "enroll-now", left: 3.8, top: 75.3, width: 15.7, height: 6.4, type: "scroll", label: "Enroll Now" },
      { key: "explore-courses", left: 20.6, top: 75.3, width: 16, height: 6.4, type: "link", to: "/courses", label: "Explore Courses" },
    ],
  },
  {
    key: "career-guidance",
    src: heroCareer,
    alt: "Simatrix Academy — Free Career Guidance Session, discover the right path for your future",
    w: 1672,
    h: 941,
    hotspots: [
      { key: "talk-to-expert", left: 20.87, top: 77.15, width: 16.15, height: 5.31, type: "external", href: "https://wa.me/91XXXXXXXXXX", label: "Talk to a Career Expert" },
    ],
    visibleCta: { key: "register-now", program: "career-guidance", label: "Register Now", left: 2.63, top: 77.15, width: 17.34, height: 5.31 },
  },
  {
    key: "internship",
    src: heroInternship,
    alt: "Simatrix Academy — Free Full Stack Development Internship, launch your IT career",
    w: 1536,
    h: 1024,
    hotspots: [
      { key: "apply-now", left: 3.45, top: 75.6, width: 15.04, height: 5.57, type: "modal", program: "internship", label: "Apply Now" },
      { key: "know-eligibility", left: 19.6, top: 75.6, width: 14.32, height: 5.57, type: "link", to: "/courses", label: "Know Eligibility" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// FALLBACK DATA (UNCHANGED)
// ─────────────────────────────────────────────────────────────────
const FALLBACK_STATS = [

];

const FALLBACK_TESTIMONIALS = [
  {
    initials: "PK",
    name: "Priya Kumari",
    role: "Full Stack Developer, TCS",
    quote: "Simatrix gave me a clear path from zero to job-ready. The mentors genuinely care about outcomes.",
  },
  {
    initials: "SR",
    name: "Sanjay Rao",
    role: "Data Analyst, Infosys",
    quote: "The hands-on projects made interviews genuine. I could discuss real work, not just theory.",
  },
  {
    initials: "MV",
    name: "Meera Varma",
    role: "Cloud Engineer, Zoho",
    quote: "Placement support delivered. Mock interviews and resume reviews made me confident.",
  },
];

// ─────────────────────────────────────────────────────────────────
// HELPER HOOKS (UNCHANGED LOGIC)
// ─────────────────────────────────────────────────────────────────
function useContainerRect(ref, naturalW, naturalH) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !naturalW || !naturalH) return;

    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;

      const scale = Math.max(cw / naturalW, ch / naturalH);
      const w = naturalW * scale;
      const h = naturalH * scale;
      const left = (cw - w) / 2;
      const top = (ch - h) / 2;
      setRect({ w, h, left, top });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, naturalW, naturalH]);

  return rect;
}

// ─────────────────────────────────────────────────────────────────
// HERO SLIDE COMPONENT (UI REFINED, LOGIC INTACT)
// ─────────────────────────────────────────────────────────────────
function HeroSlide({ slide, active, onScrollToEnquiry, onOpenForm, onNaturalSize }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState({ w: slide.w, h: slide.h });
  const rect = useContainerRect(containerRef, naturalSize.w, naturalSize.h);

  const handleLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (w && h && (w !== naturalSize.w || h !== naturalSize.h)) {
      setNaturalSize({ w, h });
      onNaturalSize?.(slide.key, w, h);
    }
  };

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) handleLoad();
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full shrink-0 overflow-hidden" style={{ background: PURE_WHITE }}>
      <img
        ref={imgRef}
        src={slide.src}
        alt={slide.alt}
        className={`hero-img absolute inset-0 h-full w-full object-cover ${active ? "is-active" : ""}`}
        loading={active ? "eager" : "lazy"}
        onLoad={handleLoad}
      />

      {/* Subtle vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 85% 18%, rgba(42,157,143,0.14), transparent 28%), linear-gradient(to bottom, rgba(18,55,47,0.03), transparent 30%, transparent 68%, rgba(18,55,47,0.14))",
        }}
        aria-hidden
      />

      {rect &&
        slide.hotspots.map((h) => {
          const style = {
            left: rect.left + (rect.w * h.left) / 100,
            top: rect.top + (rect.h * h.top) / 100,
            width: (rect.w * h.width) / 100,
            height: (rect.h * h.height) / 100,
          };
          if (h.type === "link")
            return <Link key={h.key} to={h.to} data-cursor="hover" aria-label={h.label} className="absolute rounded-sm" style={style} />;
          if (h.type === "external")
            return <a key={h.key} href={h.href} target="_blank" rel="noreferrer" data-cursor="hover" aria-label={h.label} className="absolute rounded-sm" style={style} />;
          if (h.type === "modal")
            return (
              <button
                key={h.key}
                type="button"
                onClick={() => onOpenForm(h.program)}
                data-cursor="hover"
                aria-label={h.label}
                className="absolute rounded-sm"
                style={style}
              />
            );
          return <button key={h.key} type="button" onClick={onScrollToEnquiry} data-cursor="hover" aria-label={h.label} className="absolute rounded-sm" style={style} />;
        })}

      {rect && slide.visibleCta && (
        <button
          type="button"
          onClick={() => onOpenForm(slide.visibleCta.program)}
          data-cursor="hover"
          aria-label={slide.visibleCta.label}
          className="hero-cta absolute grid place-items-center overflow-hidden rounded-xl border border-white/20 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-1"
          style={{
            left: rect.left + (rect.w * slide.visibleCta.left) / 100,
            top: rect.top + (rect.h * slide.visibleCta.top) / 100,
            width: (rect.w * slide.visibleCta.width) / 100,
            height: (rect.h * slide.visibleCta.height) / 100,
            background: `linear-gradient(135deg, ${NAVY} 0%, ${ACCENT_INDIGO} 55%, ${ACCENT_PURPLE} 100%)`,
            boxShadow: `0 16px 38px rgba(10, 10, 31, 0.28), inset 0 1px 0 rgba(255,255,255,0.18)`,
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${NAVY}, ${ACCENT_PURPLE})`;
            e.currentTarget.style.boxShadow = `0 16px 40px rgba(231, 111, 81, 0.28)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${NAVY} 0%, ${ACCENT_INDIGO} 55%, ${ACCENT_PURPLE} 100%)`;
            e.currentTarget.style.boxShadow = `0 16px 38px rgba(10, 10, 31, 0.28), inset 0 1px 0 rgba(255,255,255,0.18)`;
          }}
        >
          <span className="relative z-10">{slide.visibleCta.label}</span>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// NEW DARK HERO SECTION (Replaces Carousel)
// ─────────────────────────────────────────────────────────────────
function DarkHeroSection({ onScrollToEnquiry, onOpenForm }) {
  return (
    <div className="relative w-full overflow-hidden bg-[#040B16] pt-[140px] lg:pt-[180px]" style={{ minHeight: "100vh" }}>
      
      {/* Container */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-16 h-full flex flex-col lg:flex-row items-center justify-between">
        
        {/* Left Side: Typography */}
        <div className="w-full lg:w-[55%] z-20 pb-16 lg:pb-32">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-[76px] lg:leading-[1.15]">
            LEARN TODAY.<br />
            <span className="bg-gradient-to-r from-[#4DE1C1] to-[#3B82F6] bg-clip-text text-transparent">LEAD</span> TOMORROW.
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-slate-300 max-w-xl">
            Industry-oriented training in IT & Emerging Technologies<br className="hidden lg:block"/>
            with practical learning and placement assistance.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <button
              onClick={() => onOpenForm("career-guidance")}
              className="rounded-xl bg-[#0D6EFD] px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Explore Programs
            </button>
            <button
              onClick={onScrollToEnquiry}
              className="group flex items-center gap-2 rounded-xl border border-slate-500/50 px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:border-slate-400 hover:bg-white/5"
            >
              Talk to Advisor <i className="ti ti-arrow-right text-[17px] opacity-80 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Side: Infinite Image Carousel */}
        <div className="relative w-full lg:w-[45%] h-[500px] lg:h-[750px] flex items-center justify-center z-10 overflow-hidden">
          
          <style>{`
            @keyframes verticalInfiniteScroll {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            .animate-vertical-scroll {
              animation: verticalInfiniteScroll 30s linear infinite;
            }
            .animate-vertical-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Top/Bottom Fading Mask to blend into background */}
          <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #040B16 0%, transparent 15%, transparent 85%, #040B16 100%)' }} />

          {/* Scrolling Track (Rendered twice for perfect loop) */}
          <div className="flex flex-col gap-6 animate-vertical-scroll items-center w-full">
            {/* If HERO_SLIDES is small, we duplicate it a few times to ensure it fills the vertical space */}
            {[...HERO_SLIDES, ...HERO_SLIDES, ...HERO_SLIDES, ...HERO_SLIDES].map((slide, i) => (
              <div 
                key={`${slide.key || i}-${i}`} 
                className="relative w-[90%] lg:w-[520px] rounded-[24px] overflow-hidden shadow-2xl border border-white/10 group cursor-pointer bg-[#040B16]"
                onClick={() => onOpenForm(slide.visibleCta?.program || "career-guidance")}
              >
                <img 
                  src={slide.src} 
                  alt={slide.alt || "Academy Slide"} 
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Modern Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040B16]/95 via-[#040B16]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div>
                    <h4 className="text-white font-bold text-lg drop-shadow-md">
                      {slide.visibleCta ? slide.visibleCta.label : "Explore"}
                    </h4>
                    <p className="text-cyan-400 text-sm font-medium mt-1">Click to learn more</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HERO CAROUSEL (LOGIC INTACT, UI REFINED)
// ─────────────────────────────────────────────────────────────────
function HeroCarousel({ onScrollToEnquiry, onOpenForm }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const wrapRef = useRef(null);
  const [naturalSizes, setNaturalSizes] = useState({});
  const count = HERO_SLIDES.length;
  const [boxHeight, setBoxHeight] = useState(null);

  const handleNaturalSize = (key, w, h) => {
    setNaturalSizes((prev) => ({ ...prev, [key]: { w, h } }));
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const compute = () => {
      const cw = el.clientWidth;
      if (!cw) return;
      const slide = HERO_SLIDES[index];
      const size = naturalSizes[slide.key] || { w: slide.w, h: slide.h };
      const aspect = size.w / size.h;
      const rawHeight = cw / aspect;
      const navbarHeight = 64;
      const availableHeight = window.innerHeight - navbarHeight;
      setBoxHeight(Math.min(rawHeight, availableHeight));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [index, naturalSizes]);

  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [paused, count]);

  const go = (i) => setIndex((i + count) % count);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden bg-white transition-[height] duration-500 shadow-[0_18px_60px_rgba(10,10,31,0.10)]"
      style={{ height: boxHeight ? `${boxHeight}px` : "100svh" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {HERO_SLIDES.map((slide, i) => (
          <HeroSlide
            key={slide.key}
            slide={slide}
            active={i === index}
            onScrollToEnquiry={onScrollToEnquiry}
            onOpenForm={onOpenForm}
            onNaturalSize={handleNaturalSize}
          />
        ))}
      </div>

      {/* Refined control buttons */}
      <button
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="carousel-nav absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-2xl border transition-all duration-300 hover:-translate-y-[calc(50%+3px)] sm:left-8"
        style={{
          color: NAVY,
          borderColor: "rgba(255,255,255,0.75)",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 12px 30px rgba(10,10,31,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = NAVY;
          e.currentTarget.style.color = PURE_WHITE;
          e.currentTarget.style.borderColor = NAVY;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.72)";
          e.currentTarget.style.color = NAVY;
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.75)";
        }}
      >
        <i className="ti ti-chevron-left text-lg" />
      </button>

      <button
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="carousel-nav absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-2xl border transition-all duration-300 hover:-translate-y-[calc(50%+3px)] sm:right-8"
        style={{
          color: NAVY,
          borderColor: "rgba(255,255,255,0.75)",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 12px 30px rgba(10,10,31,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = NAVY;
          e.currentTarget.style.color = PURE_WHITE;
          e.currentTarget.style.borderColor = NAVY;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.72)";
          e.currentTarget.style.color = NAVY;
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.75)";
        }}
      >
        <i className="ti ti-chevron-right text-lg" />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="indicator-dot h-2 rounded-full transition-all duration-500"
            style={
              i === index
                ? {
                    width: "1.75rem",
                    background: `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_PURPLE})`,
                    boxShadow: `0 2px 8px rgba(231, 111, 81, 0.4)`,
                  }
                : { width: "0.5rem", background: "rgba(10,10,31,0.25)" }
            }
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// REFINED CARD PANEL
// ─────────────────────────────────────────────────────────────────
function ClassicPanel({ className = "", children, style = {} }) {
  return (
    <div
      className={`premium-panel group relative overflow-hidden rounded-2xl border transition-all duration-500 ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94))",
        borderColor: "rgba(10,10,31,0.09)",
        boxShadow: "0 10px 34px rgba(10,10,31,0.07)",
        ...style,
      }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${ACCENT_BLUE}, ${ACCENT_PURPLE}, transparent)` }}
        aria-hidden
      />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STATS SECTION (REFINED UI)
// ─────────────────────────────────────────────────────────────────
function StatsBand({ stats }) {
  if (!stats?.length) return null;
  return (
    <Section className="relative !max-w-none overflow-hidden !px-0 py-20" style={{ background: `linear-gradient(135deg, ${SURFACE_TINT}, ${SOFT_BLUE})` }}>
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full blur-3xl" style={{ background: "rgba(231,111,81,0.10)" }} />
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 rounded-3xl border border-white/70 bg-white/75 p-8 shadow-[0_24px_70px_rgba(10,10,31,0.08)] backdrop-blur-xl sm:grid-cols-4 sm:p-10">
          {stats.map((s, i) => (
            <Reveal key={s.label + i} delay={i * 100} className="gsap-rise text-center">
              <div className={i > 0 ? "sm:border-l sm:pl-8" : ""} style={i > 0 ? { borderColor: "rgba(10,10,31,0.15)" } : undefined}>
                <p
                  className="text-4xl font-bold leading-tight"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_PURPLE})`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {s.value}
                </p>
                <p className="mt-3 text-sm font-semibold tracking-wide" style={{ color: SLATE_GRAY }}>
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────
// PROGRAM APPLY MODAL (LOGIC INTACT, UI REFINED)
// ─────────────────────────────────────────────────────────────────
function ProgramApplyModal({ program, onClose }) {
  const meta = PROGRAMS[program] || {};
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    address: "",
    degree: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector("input")?.focus({ preventScroll: true });
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.college || !form.degree) {
      setErrorMsg("Please fill in name, email, phone, college and degree.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await api.createEnquiry({ program, ...form });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-hidden bg-black/50 p-4 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="program-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 bg-white animate-[modalRise_0.45s_cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ borderColor: NAVY, boxShadow: "0 40px 80px rgba(10,10,31,0.3)" }}
      >
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_PURPLE})` }} />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-lg transition-colors"
          style={{ color: SLATE_GRAY }}
          onMouseEnter={(e) => (e.currentTarget.style.background = LIGHT_GRAY)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <i className="ti ti-x" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-8">
          {status === "success" ? (
            <div className="animate-[fadeIn_0.4s_ease-out] py-8 text-center">
              <div
                className="mx-auto grid h-16 w-16 place-items-center rounded-full text-2xl text-white"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_PURPLE})`,
                  boxShadow: `0 12px 32px rgba(152, 0, 232, 0.3)`,
                }}
              >
                <i className="ti ti-check" />
              </div>
              <h3 className="mt-5 text-2xl font-bold" style={{ color: NAVY }}>
                You're all set!
              </h3>
              <p className="mt-3 leading-relaxed" style={{ color: SLATE_GRAY }}>
                Thanks, {form.name.split(" ")[0]}. Our team will reach out to you shortly.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: NAVY,
                  boxShadow: `0 8px 20px rgba(10,10,31,0.2)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${NAVY}, ${ACCENT_PURPLE})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = NAVY;
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h3 id="program-modal-title" className="text-xl font-bold" style={{ color: NAVY }}>
                {meta.title || "Apply Now"}
              </h3>
              {meta.subtitle && (
                <p className="mt-2 leading-relaxed" style={{ color: SLATE_GRAY }}>
                  {meta.subtitle}
                </p>
              )}

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <ModalField label="Full Name">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Your full name"
                    className="modal-input"
                  />
                </ModalField>
                <ModalField label="Email">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    className="modal-input"
                  />
                </ModalField>
                <ModalField label="Phone Number">
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="10-digit mobile number"
                    className="modal-input"
                  />
                </ModalField>
                <ModalField label="College">
                  <input
                    type="text"
                    required
                    value={form.college}
                    onChange={update("college")}
                    placeholder="Your college / university name"
                    className="modal-input"
                  />
                </ModalField>
                <ModalField label="Degree">
                  <input
                    type="text"
                    required
                    value={form.degree}
                    onChange={update("degree")}
                    placeholder="e.g. B.E. Computer Science"
                    className="modal-input"
                  />
                </ModalField>
                <ModalField label="Address (optional)">
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={update("address")}
                    placeholder="Your current address"
                    className="modal-input resize-none"
                  />
                </ModalField>

                {errorMsg && (
                  <p className="text-sm font-medium text-red-600">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  style={{
                    background: NAVY,
                    boxShadow: `0 8px 20px rgba(10,10,31,0.2)`,
                  }}
                  onMouseEnter={(e) => {
                    if (status !== "submitting") e.currentTarget.style.background = `linear-gradient(135deg, ${NAVY}, ${ACCENT_PURPLE})`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = NAVY;
                  }}
                >
                  {status === "submitting" ? "Submitting…" : "Submit"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalRise { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1.5px solid rgba(10,10,31,0.15);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: ${NAVY};
          background: ${PURE_WHITE};
          outline: none;
          transition: all 0.3s ease;
        }
        .modal-input:hover { border-color: rgba(10,10,31,0.25); }
        .modal-input:focus {
          border-color: ${ACCENT_PURPLE};
          background: ${ACCENT_SOFTER};
          box-shadow: 0 0 0 3px ${ACCENT_SOFTER};
        }
      `}</style>
    </div>
  );
}

function ModalField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide" style={{ color: SLATE_GRAY }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function normalizeTestimonials(items) {
  if (!Array.isArray(items) || !items.length) return [];

  return items.map((item, index) => {
    const name = item.name || item.author || "Anonymous";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const initials =
      item.initials ||
      parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase() ||
      "ST";

    return {
      id: item.id ?? `${name}-${index}`,
      name,
      role: item.role || item.designation || "Student",
      quote: item.quote || item.content || item.message || "",
      initials,
      image: item.image || null,
    };
  });
}

function TestimonialsCarousel({ testimonials }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const normalizedTestimonials = normalizeTestimonials(testimonials);
  const count = normalizedTestimonials.length;
  const DURATION = 5500;

  useEffect(() => {
    if (paused || count <= 1) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), DURATION);
    return () => clearInterval(id);
  }, [paused, count]);

  if (!count) return null;

  const go = (i) => setIndex((i + count) % count);

  return (
    <div
      className="relative mx-auto mt-16 max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {normalizedTestimonials.map((t, i) => (
            <div key={t.id || t.name + i} className="w-full shrink-0">
              <ClassicPanel className="p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 28px 80px rgba(0,0,0,0.22)" }}>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: ACCENT_SOFTER }}>
                  <i className="ti ti-quote text-2xl" style={{ color: ACCENT_PURPLE }} />
                </div>
                <p className="mt-4 text-lg leading-relaxed italic" style={{ color: NAVY, fontWeight: 500 }}>
                  "{t.quote}"
                </p>

                <div className="mt-8 flex items-center gap-4 border-t pt-6" style={{ borderColor: "rgba(10,10,31,0.1)" }}>
                  {t.image ? (
                    <img
                      src={mediaUrl(t.image)}
                      alt={t.name}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_PURPLE})`,
                        boxShadow: `0 4px 12px rgba(152, 0, 232, 0.3)`,
                      }}
                    >
                      {t.initials}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: NAVY }}>
                      {t.name}
                    </p>
                    <p className="text-sm" style={{ color: SLATE_GRAY }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </ClassicPanel>
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => go(index - 1)}
            aria-label="Previous testimonial"
            className="absolute -left-6 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-2 transition-all hover:-translate-y-[calc(50%+2px)] sm:-left-7"
            style={{
              color: NAVY,
              borderColor: "rgba(10,10,31,0.2)",
              background: PURE_WHITE,
              boxShadow: "0 4px 12px rgba(10,10,31,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = NAVY;
              e.currentTarget.style.color = PURE_WHITE;
              e.currentTarget.style.borderColor = NAVY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = PURE_WHITE;
              e.currentTarget.style.color = NAVY;
              e.currentTarget.style.borderColor = "rgba(10,10,31,0.2)";
            }}
          >
            <i className="ti ti-chevron-left" />
          </button>

          <button
            onClick={() => go(index + 1)}
            aria-label="Next testimonial"
            className="absolute -right-6 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-2 transition-all hover:-translate-y-[calc(50%+2px)] sm:-right-7"
            style={{
              color: NAVY,
              borderColor: "rgba(10,10,31,0.2)",
              background: PURE_WHITE,
              boxShadow: "0 4px 12px rgba(10,10,31,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = NAVY;
              e.currentTarget.style.color = PURE_WHITE;
              e.currentTarget.style.borderColor = NAVY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = PURE_WHITE;
              e.currentTarget.style.color = NAVY;
              e.currentTarget.style.borderColor = "rgba(10,10,31,0.2)";
            }}
          >
            <i className="ti ti-chevron-right" />
          </button>

          <div className="mt-10 flex justify-center gap-2">
            {normalizedTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className="h-2 rounded-full transition-all duration-500"
                style={
                  i === index
                    ? {
                        width: "2rem",
                        background: `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_PURPLE})`,
                        boxShadow: `0 2px 8px rgba(152, 0, 232, 0.4)`,
                      }
                    : { width: "0.5rem", background: "rgba(10,10,31,0.2)" }
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const scopeRef = useRef(null);
  const enquiryRef = useRef(null);
  const [activeProgram, setActiveProgram] = useState(null);

  const openProgramForm = (program) => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    setActiveProgram(program);
  };

  const closeProgramForm = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.overscrollBehavior = "";
    setActiveProgram(null);
  };

  useEffect(() => {
    api.getSite().then((res) => setData(res.data)).catch((e) => setError(e.message));
  }, []);

  useSeo({
    title: "Simatrix Academy · Learn Without Limits",
    description: "Simatrix Academy offers industry-ready software training — full stack, cloud, data science and more — with hands-on projects and 100% placement assistance.",
    canonical: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Simatrix Academy",
      description: "Software training academy offering industry-ready, mentor-led technology courses with placement assistance.",
      url: typeof window !== "undefined" ? window.location.origin : "",
      email: "info@simatrixacademy.com",
      telephone: "+91-XXXXXXXXXX",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Update with real address",
        addressLocality: "Update with real city",
        postalCode: "000000",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
  });

  useEffect(() => {
    if (!data || !scopeRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".gsap-rise").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: (i % 4) * 0.08,
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });

      gsap.utils.toArray(".gsap-line").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
          }
        );
      });
    }, scopeRef);
    return () => ctx.revert();
  }, [data]);

  if (error)
    return (
      <Section className="!max-w-none !px-0 py-24 text-center" style={{ background: PURE_WHITE }}>
        <p style={{ color: SLATE_GRAY }}>{error}</p>
      </Section>
    );

  if (!data)
    return (
      <div className="grid place-items-center py-32" style={{ background: PURE_WHITE }}>
        <Spinner className="text-3xl" style={{ color: ACCENT_PURPLE }} />
      </div>
    );

  const allCourses = data.categories.flatMap((c) => c.courses || []);
  const featuredCourses = allCourses.slice(0, 8);
  const stats = data.stats && data.stats.length ? data.stats : FALLBACK_STATS;
  const testimonials = normalizeTestimonials(
    data?.testimonials && data.testimonials.length ? data.testimonials : FALLBACK_TESTIMONIALS
  );

  const scrollToEnquiry = () => {
    enquiryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={scopeRef} className="w-full max-w-full overflow-x-hidden font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Merriweather', serif; }
        ::selection { background: ${ACCENT_PURPLE}; color: ${PURE_WHITE}; }
        :focus-visible { outline: 2px solid ${ACCENT_PURPLE}; outline-offset: 2px; }

        .hero-img {
          transform: scale(1.05);
          transform-origin: center;
          transition: transform 1400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        .hero-img.is-active { transform: scale(1); }

        .premium-panel {
          transform: translateY(0);
          will-change: transform, box-shadow;
        }
        .premium-panel:hover {
          transform: translateY(-8px);
          border-color: rgba(231, 111, 81, 0.24) !important;
          box-shadow: 0 24px 60px rgba(18,55,47,0.12), 0 10px 30px rgba(231,111,81,0.10) !important;
        }
        .premium-section { position: relative; overflow: hidden; }
        .premium-section::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(rgba(10,10,31,0.05) 0.8px, transparent 0.8px);
          background-size: 24px 24px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 72%);
          opacity: 0.34;
        }
        .section-orb { filter: blur(72px); opacity: .55; pointer-events: none; }
        .eyebrow-pill { box-shadow: inset 0 1px 0 rgba(255,255,255,.75), 0 8px 24px rgba(10,10,31,.06); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalRise { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        @media (prefers-reduced-motion: reduce) {
          .hero-img { transform: none; transition: none; }
        }
      `}</style>

      {/* Dark Hero Section (Replaces Carousel) */}
      <DarkHeroSection onScrollToEnquiry={scrollToEnquiry} onOpenForm={openProgramForm} />

      {activeProgram && createPortal(<ProgramApplyModal program={activeProgram} onClose={closeProgramForm} />, document.body)}

      {/* Stats Section */}
      <StatsBand stats={stats} />

      {/* Features Section */}
      <Section className="premium-section !max-w-none !px-0 py-28" style={{ background: `linear-gradient(180deg, ${PURE_WHITE} 0%, ${SURFACE_TINT} 100%)` }}>
        <div className="section-orb absolute -right-24 top-12 h-72 w-72 rounded-full" style={{ background: "rgba(42,157,143,0.16)" }} />
        <div className="section-orb absolute -left-24 bottom-0 h-72 w-72 rounded-full" style={{ background: "rgba(231,111,81,0.12)" }} />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Why Simatrix" title="Everything you need to actually get hired" subtitle="Not just lectures — a learning path built around real, measurable outcomes." />
          <div className="mt-16 grid items-stretch gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {data.features.map((f, i) => (
              <Reveal key={f.id} delay={i * 100} className="h-full gsap-rise">
                <ClassicPanel className="flex h-full flex-col p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl text-white transition-all duration-500 group-hover:-rotate-3 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${NAVY}, ${ACCENT_INDIGO} 60%, ${ACCENT_PURPLE})`, boxShadow: "0 12px 24px rgba(10,10,31,0.18)" }}>
                    <i className={icon(f.icon)} />
                  </span>
                  <h3 className="mt-5 font-semibold leading-tight" style={{ color: NAVY }}>
                    {f.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: SLATE_GRAY }}>
                    {f.description}
                  </p>
                </ClassicPanel>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div style={{ background: LIGHT_GRAY }}>
        <Section className="!max-w-none !px-0 py-0">
          <Hairline className="gsap-line" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT_PURPLE}, transparent)` }} />
        </Section>
      </div>

      {/* Categories Section */}
      <Section className="premium-section !max-w-none !px-0 py-28" style={{ background: PURE_WHITE }}>
        <div className="section-orb absolute right-[-7rem] top-20 h-80 w-80 rounded-full" style={{ background: "rgb(146, 81, 182)" }} />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Course Categories" title="Pick your path, start today" subtitle="From fundamentals to advanced expertise — every path leads to a portfolio." />
          <div className="mt-16 grid items-stretch gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-3
          ">
            {data.categories.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 80} className="h-full gsap-rise">
                <Link to={`/courses?category=${cat.slug}`} data-cursor="hover" className="block h-full">
                  <ClassicPanel className="flex h-full items-center gap-8 p-5
                  ">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl text-white transition-all duration-500 group-hover:rotate-3 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${NAVY}, ${ACCENT_PURPLE})`, boxShadow: "0 12px 24px rgba(10,10,31,0.16)" }}>
                      <i className={icon(cat.icon)} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold" style={{ color: NAVY }}>
                        {cat.name}
                      </h3>
                      <span className="mt-2 inline-block text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: ACCENT_SOFTER, color: ACCENT_PURPLE }}>
                        {(cat.courses || []).length} courses
                      </span>
                    </div>
                    <i className="ti ti-chevron-right transition-transform duration-300 group-hover:translate-x-1" style={{ color: SLATE_GRAY }} />
                  </ClassicPanel>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Featured Courses */}
      <Section className="premium-section !max-w-none !px-0 py-28" style={{ background: `linear-gradient(180deg, ${SURFACE_TINT}, ${LIGHT_GRAY})` }}>
        <div className="section-orb absolute -left-32 top-10 h-96 w-96 rounded-full" style={{ background: "rgba(42,157,143,0.14)" }} />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Popular Courses" title="Start with our most-loved programs" />
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {featuredCourses.map((c, i) => (
              <Reveal key={c.id} delay={(i % 4) * 100} className="w-full gsap-rise">
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link
              to="/courses"
              data-cursor="hover"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${ACCENT_INDIGO} 55%, ${ACCENT_PURPLE})`, boxShadow: `0 14px 32px rgba(10,10,31,0.22)` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `linear-gradient(135deg, ${NAVY}, ${ACCENT_PURPLE})`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = `linear-gradient(135deg, ${NAVY}, ${ACCENT_INDIGO} 55%, ${ACCENT_PURPLE})`)}
            >
              View All Courses
              <i className="ti ti-arrow-right" />
            </Link>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="premium-section !max-w-none !px-0 py-28" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${INK_DARK} 52%, #1C443A 100%)` }}>
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 18% 15%, rgba(42,157,143,0.38), transparent 26%), radial-gradient(circle at 82% 75%, rgba(231,111,81,0.30), transparent 30%)" }} />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Student Success" title="Trusted by 5L+ learners" subtitle="Real outcomes from real students." onDark />
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </Section>

      {/* Enquiry Section */}
      <Section className="premium-section !max-w-none !px-0 py-28" style={{ background: `linear-gradient(180deg, ${PURE_WHITE}, ${SURFACE_TINT})` }}>
        <div className="section-orb absolute -right-28 top-10 h-96 w-96 rounded-full" style={{ background: "rgba(231,111,81,0.14)" }} />
        <div ref={enquiryRef} className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 rounded-[2rem] border border-white/70 bg-white/70 p-7 shadow-[0_28px_90px_rgba(10,10,31,0.10)] backdrop-blur-xl lg:grid-cols-2 lg:p-12">
            <Reveal className="gsap-rise">
              <div className="space-y-6">
                <div>
                  <span className="eyebrow-pill inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em]" style={{ color: ACCENT_PURPLE, borderColor: "rgba(231,111,81,0.18)", background: ACCENT_SOFTER }}>CONTACT US</span>
                  <h2 className="mt-3 text-4xl font-bold" style={{ color: NAVY }}>
                    Ready to begin?
                  </h2>
                  <p className="mt-4 leading-relaxed" style={{ color: SLATE_GRAY }}>
                    Drop us a message, and our team will get back to you within 24 hours. We're here to help you find the right path.
                  </p>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1" style={{ color: SLATE_GRAY }}>
                  <p className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/75 px-4 py-3 shadow-sm">
                    <i className="ti ti-map-pin text-lg" style={{ color: ACCENT_PURPLE }} />
                    Update with real address
                  </p>
                  <p className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/75 px-4 py-3 shadow-sm">
                    <i className="ti ti-phone text-lg" style={{ color: ACCENT_PURPLE }} />
                    Update with real phone
                  </p>
                  <p className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/75 px-4 py-3 shadow-sm">
                    <i className="ti ti-clock text-lg" style={{ color: ACCENT_PURPLE }} />
                    Mon–Sat 9AM–7PM · Sun 10AM–3PM
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100} className="gsap-rise">
              <ClassicPanel className="p-8 sm:p-10" style={{ background: PURE_WHITE, boxShadow: "0 20px 55px rgba(10,10,31,0.10)" }}>
                <div className="h-1.5 w-20 mb-7 rounded-full" style={{ background: `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_PURPLE})` }} />
                <EnquiryForm courses={allCourses} compact />
              </ClassicPanel>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle = "", onDark = false }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div
        className="eyebrow-pill mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-2"
        style={{
          borderColor: onDark ? "rgba(255,255,255,0.12)" : "rgba(231,111,81,0.16)",
          background: onDark ? "rgba(255,255,255,0.07)" : ACCENT_SOFTER,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: onDark ? ACCENT_BLUE : ACCENT_PURPLE,
            boxShadow: `0 0 14px ${onDark ? ACCENT_BLUE : ACCENT_PURPLE}`,
          }}
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: onDark ? "#9FE3D4" : ACCENT_PURPLE }}>
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-6 text-3xl font-bold leading-[1.15] tracking-[-0.03em] sm:text-4xl lg:text-5xl" style={{ color: onDark ? PURE_WHITE : NAVY }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: onDark ? "rgba(255,255,255,0.68)" : SLATE_GRAY }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
