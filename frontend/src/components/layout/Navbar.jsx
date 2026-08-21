import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { api } from "../../api/client";
import { icon } from "../../lib/icons";
import { Button } from "../ui";

/**
 * Palette pulled directly from simatrix_logo_only.png:
 *   --logo-blue    #1E8FE0  (left cap)
 *   --logo-indigo  #241C6B  (the crossover, darkest point)
 *   --logo-violet  #000000  (right cap)
 *   --logo-magenta #C026D3  (the dissolving pixels)
 * These replace the old generic brand-400/600/700 scale in this file so the
 * navbar reads as an extension of the mark, not a separate design system.
 */

const ABOUT_LINKS = [
  { label: "Academy Overview", to: "/about", icon: "ti-building-community" },
  { label: "Mission & Vision", to: "/about/mission", icon: "ti-target" },
  { label: "Our Pillars", to: "/about/pillars", icon: "ti-columns" },
  { label: "Awards", to: "/awards", icon: "ti-award" },
  { label: "Gallery", to: "/gallery", icon: "ti-photo" },
];

const SUPPORT_LINKS = [
  { label: "Placement Training", to: "/placement", icon: "ti-briefcase" },
  { label: "Career Guidance", to: "/career-guidance", icon: "ti-compass" },
  { label: "Book Appointment", to: "/appointment", icon: "ti-calendar-event" },
  { label: "Help Center", to: "/help-center", icon: "ti-help-circle" },
  { label: "Blog", to: "/blog", icon: "ti-news" },
  { label: "Student Reviews", to: "/reviews", icon: "ti-star" },
  { label: "Interview Resources", to: "/interview-resources", icon: "ti-file-text" },
];

// The logo dissolves into these squares as it exits right. Reuse that exact
// idea as a hover/active "trail" under nav items instead of a plain bar.
function PixelTrail({ active }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-[3px] transition-all duration-300 ${
        active ? "opacity-100" : "opacity-0 group-hover:opacity-70"
      }`}
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="block h-[3px] w-[3px] rounded-[1px]"
          style={{
            background:
              i === 0
                ? "#1E8FE0"
                : i === 1
                ? "#4A2E9E"
                : i === 2
                ? "#7B2FCB"
                : "#C026D3",
            transform: active ? "translateY(0)" : `translateY(${i % 2 === 0 ? -1 : 1}px)`,
          }}
        />
      ))}
    </span>
  );
}

export default function Navbar() {
  const { pathname, search } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    api.getSite().then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname, search]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      setOpenMenu(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = (name) => setOpenMenu((m) => (m === name ? null : name));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 shadow-[0_8px_30px_-12px_rgba(36,28,107,0.18)] backdrop-blur"
          : "bg-white/80 backdrop-blur"
      }`}
    >
      {/* hairline that carries the exact logo gradient, not a generic brand tint */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #1E8FE0 20%, #241C6B 50%, #7B2FCB 80%, transparent)",
        }}
      />

      <div
        ref={navRef}
        className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
      >
        <Link to="/" className="group flex items-center gap-2.5">
          {/* logo carries its own gradient — no boxed background fighting it */}
          <img
            src="/simatrix_logo_only.svg"
            alt="Simatrix Academy Logo"
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-lg font-extrabold tracking-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #000000 0%, #241C6B 55%, #000000 100%)",
              }}
            >
              Simatrix Academy
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <TopLink to="/" label="Home" />

          <Dropdown label="About" open={openMenu === "about"} onToggle={() => toggle("about")}>
            <div className="w-64 p-2">
              {ABOUT_LINKS.map((l) => (
                <MenuItem key={l.to} {...l} onClick={() => setOpenMenu(null)} />
              ))}
            </div>
          </Dropdown>

          <Dropdown label="Courses" wide open={openMenu === "courses"} onToggle={() => toggle("courses")}>
            <div className="grid w-[34rem] grid-cols-2 gap-1 p-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/courses?category=${c.slug}`}
                  onClick={() => setOpenMenu(null)}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-[#1E8FE0]/5 hover:text-[#4A2E9E]"
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg text-white ring-1 ring-black/5 transition-transform group-hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #1E8FE0, #7B2FCB)" }}
                  >
                    <i className={icon(c.icon)} />
                  </span>
                  <span>
                    {c.name}
                    <span className="block text-xs text-slate-500">{(c.courses || []).length} courses</span>
                  </span>
                </Link>
              ))}
              <Link
                to="/courses"
                onClick={() => setOpenMenu(null)}
                className="col-span-2 mt-1 flex items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                style={{ background: "linear-gradient(90deg, #1E8FE0, #241C6B, #7B2FCB)" }}
              >
                View all courses <i className="ti ti-arrow-right" />
              </Link>
            </div>
          </Dropdown>

          <Dropdown label="Support" open={openMenu === "support"} onToggle={() => toggle("support")}>
            <div className="w-64 p-2">
              {SUPPORT_LINKS.map((l) => (
                <MenuItem key={l.to} {...l} onClick={() => setOpenMenu(null)} />
              ))}
            </div>
          </Dropdown>
          {/*  <TopLink to="/branches" label="Branches" />*/}

          <TopLink to="/contact" label="Contact" />
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
         
          <Button
            as={Link}
            to="/contact"
            size="sm"
            className="!border-0 !text-white"
            style={{ background: "linear-gradient(90deg, #1E8FE0, #241C6B, #7B2FCB)" }}
          >
            Enquire Now
          </Button>
        </div>

        <button
          className="grid h-11 w-11 place-items-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <i className={`ti text-xl ${mobileOpen ? "ti-x" : "ti-menu-2"}`} />
        </button>
      </div>

      {mobileOpen && (
        <MobileMenu categories={categories} onClose={() => setMobileOpen(false)} />
      )}
    </header>
  );
}

function TopLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? "text-[#4A2E9E]" : "text-slate-600 hover:text-[#4A2E9E]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <PixelTrail active={isActive} />
        </>
      )}
    </NavLink>
  );
}

function Dropdown({ label, open, onToggle, children }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`group relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          open ? "text-[#4A2E9E]" : "text-slate-600 hover:text-[#4A2E9E]"
        }`}
      >
        {label}
        <i className={`ti ti-chevron-down text-xs transition ${open ? "rotate-180" : ""}`} />
        <PixelTrail active={open} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[#241C6B]/10 ring-1 ring-slate-900/5 animate-[fadeIn_.15s_ease-out]">
          <div className="h-1" style={{ background: "linear-gradient(90deg, #1E8FE0, #241C6B, #7B2FCB, #C026D3)" }} />
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ to, label, icon: ic, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-[#1E8FE0]/5 hover:text-[#4A2E9E]"
    >
      <span
        className="grid h-7 w-7 place-items-center rounded-md text-[#4A2E9E] ring-1 ring-[#1E8FE0]/15 transition-colors group-hover:text-white"
        style={{ background: "linear-gradient(135deg, rgba(30,143,224,0.12), rgba(123,47,203,0.12))" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #1E8FE0, #7B2FCB)")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "linear-gradient(135deg, rgba(30,143,224,0.12), rgba(123,47,203,0.12))")
        }
      >
        <i className={`ti ${ic} text-base`} />
      </span>
      {label}
    </Link>
  );
}

function MobileMenu({ categories, onClose }) {
  const [section, setSection] = useState(null);
  const toggle = (s) => setSection((x) => (x === s ? null : s));

  return (
    <div id="mobile-navigation" className="relative max-h-[calc(100dvh-4rem)] overscroll-contain overflow-y-auto bg-white lg:hidden">
      <div
        className="h-px"
        style={{ background: "linear-gradient(90deg, transparent, #1E8FE0, #7B2FCB, transparent)" }}
      />
      <nav className="flex flex-col px-4 py-3">
        <MLink to="/" label="Home" onClose={onClose} />

        <MGroup label="About" open={section === "about"} onToggle={() => toggle("about")}>
          {ABOUT_LINKS.map((l) => <MLink key={l.to} {...l} sub onClose={onClose} />)}
        </MGroup>

        <MGroup label="Courses" open={section === "courses"} onToggle={() => toggle("courses")}>
          {categories.map((c) => (
            <MLink key={c.id} to={`/courses?category=${c.slug}`} label={c.name} sub onClose={onClose} />
          ))}
          <MLink to="/courses" label="View all courses" sub onClose={onClose} />
        </MGroup>

        <MGroup label="Support" open={section === "support"} onToggle={() => toggle("support")}>
          {SUPPORT_LINKS.map((l) => <MLink key={l.to} {...l} sub onClose={onClose} />)}
        </MGroup>

        <MLink to="/branches" label="Branches" onClose={onClose} />
        <MLink to="/contact" label="Contact" onClose={onClose} />
        <Button
          as={Link}
          to="/contact"
          className="mt-3 !border-0 !text-white"
          style={{ background: "linear-gradient(90deg, #1E8FE0, #241C6B, #7B2FCB)" }}
          onClick={onClose}
        >
          Enquire Now
        </Button>
      </nav>
    </div>
  );
}

function MGroup({ label, open, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        {label}
        <i className={`ti ti-chevron-down text-xs transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-3 border-l-2 pl-2" style={{ borderColor: "rgba(30,143,224,0.25)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function MLink({ to, label, sub, onClose }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClose}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2.5 ${sub ? "text-sm" : "text-sm font-medium"} ${
          isActive ? "text-[#4A2E9E]" : "text-slate-700 hover:bg-slate-50"
        }`
      }
      style={({ isActive }) =>
        isActive
          ? { background: "linear-gradient(90deg, rgba(30,143,224,0.08), transparent)" }
          : undefined
      }
    >
      {label}
    </NavLink>
  );
}
