import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Spinner } from "../../components/ui";

/* Light = Material Design 3 surface. Dark = the original violet/fuchsia
   gradient theme, restored as-is for the dark toggle state. */
const lightPageTexture = { backgroundColor: "#F8F6FC" };
const darkPageTexture = {
  backgroundColor: "#120A2E",
  backgroundImage: [
    "radial-gradient(ellipse 1000px 750px at 90% -10%, rgba(192,132,252,0.55), transparent 55%)",
    "radial-gradient(ellipse 900px 700px at 10% 15%, rgba(139,92,246,0.45), transparent 55%)",
    "radial-gradient(ellipse 1100px 800px at 50% 115%, rgba(217,70,239,0.40), transparent 60%)",
    "linear-gradient(160deg, #17103A 0%, #1F1147 45%, #2B0F45 100%)",
  ].join(", "),
  backgroundBlendMode: "screen, screen, screen, normal",
};

/* Elevation/shadow per theme. Kept the const names so call sites read the same. */
function cardShadow(dark) {
  return dark
    ? "shadow-[0_20px_50px_-15px_rgba(124,58,237,0.45)]"
    : "shadow-[0_1px_2px_rgba(0,0,0,0.14),0_1px_3px_1px_rgba(0,0,0,0.10)]";
}
function cardShadowHover(dark) {
  return dark
    ? "hover:shadow-[0_28px_65px_-15px_rgba(217,70,239,0.55)]"
    : "hover:shadow-[0_4px_8px_3px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.16)]";
}
function cardHoverLift(dark) {
  return dark
    ? "transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    : "transition-shadow duration-200 ease-out motion-reduce:transition-none";
}

/* Material 3 card in light mode; the original gradient-border glass shell in dark mode.
   Kept the name GradientShell so every call site below stays untouched. */
function GradientShell({ children, className = "", innerClassName = "", borderClass, style, dark }) {
  if (dark) {
    return (
      <div
        className={`rounded-2xl bg-gradient-to-br ${borderClass || "from-violet-500/60 via-fuchsia-500/50 to-purple-400/40"} p-px ${className}`}
        style={style}
      >
        <div className={`h-full w-full rounded-2xl bg-[#1B1240]/90 backdrop-blur-xl ${innerClassName}`}>{children}</div>
      </div>
    );
  }
  return (
    <div
      className={`rounded-3xl border border-[#E7E0EC] bg-[#FFFBFE] ${className}`}
      style={style}
    >
      <div className={`h-full w-full rounded-3xl ${innerClassName}`}>{children}</div>
    </div>
  );
}

/* Headline treatment — solid Material color in light mode, the original
   violet-to-purple gradient clip-text in dark mode. Kept the name gradientText. */
function gradientText(dark) {
  return dark
    ? "bg-gradient-to-r from-violet-300 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent"
    : "text-[#21005D]";
}

/* Ambient blob behind hero elements — subtle tonal wash in light mode,
   the original saturated violet/fuchsia glow in dark mode. */
function Glow({ className, dark }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className} ${
        dark ? "bg-fuchsia-500/20" : "bg-[#EADDFF]/40"
      }`}
    />
  );
}

/* presentational-only helper — not part of the data logic */
function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/* status → color/label, per theme. Keys/labels used by app logic are unchanged;
   only the color values differ between the two visual modes. */
function STATUS_META(dark) {
  return dark
    ? {
        new: { color: "#C084FC", opacity: 1, label: "new" },
        contacted: { color: "#818CF8", opacity: 0.95, label: "contacted" },
        closed: { color: "#E9D5FF", opacity: 0.3, label: "closed" },
      }
    : {
        new: { color: "#6750A4", chipBg: "#EADDFF", chipText: "#21005D", opacity: 1, label: "new" },
        contacted: { color: "#625B71", chipBg: "#E8DEF8", chipText: "#4A4458", opacity: 1, label: "contacted" },
        closed: { color: "#79747E", chipBg: "#E7E0EC", chipText: "#49454F", opacity: 0.6, label: "closed" },
      };
}

/* ---------------------------------------------- presentational-only math
   Derives a trend % and sparkline series from the existing analytics.byDay
   array. Does not alter computeAnalytics() or what is fetched/computed —
   purely a display-layer read of already-computed data. */
function deriveTrend(byDay) {
  if (!byDay || byDay.length < 2) return { pct: 0, positive: true, series: [] };
  const half = Math.floor(byDay.length / 2);
  const prev = byDay.slice(0, half).reduce((s, d) => s + d.count, 0);
  const recent = byDay.slice(half).reduce((s, d) => s + d.count, 0);
  let pct;
  if (prev === 0) pct = recent === 0 ? 0 : 100;
  else pct = Math.round(((recent - prev) / prev) * 100);
  return { pct, positive: pct >= 0, series: byDay.map((d) => d.count) };
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [activeRange, setActiveRange] = useState("14D"); // UI-only, no-op filter hook
  const [hoveredStatus, setHoveredStatus] = useState(null);

  /* UI-only theme state — persisted, defaults to system preference. Does not
     touch any data fetching, calculation, or routing below. */
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("eh-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const dark = theme === "dark";

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("eh-theme", theme);
  }, [theme]);

  useEffect(() => {
    Promise.all([
      api.adminList("courses"),
      api.adminList("categories"),
      api.adminList("branches"),
      api.adminList("enquiries"),
    ])
      .then(([courses, categories, branches, enquiries]) =>
        setStats({
          courses: courses.data,
          categories: categories.data,
          branches: branches.data,
          enquiries: enquiries.data,
        })
      )
      .catch(() => setStats({ courses: [], categories: [], branches: [], enquiries: [] }));
  }, []);

  const analytics = useMemo(() => (stats ? computeAnalytics(stats.enquiries) : null), [stats]);
  const trend = useMemo(() => (analytics ? deriveTrend(analytics.byDay) : null), [analytics]);
  const weekTotal = useMemo(() => {
    if (!analytics) return 0;
    return analytics.byDay.slice(-7).reduce((s, d) => s + d.count, 0);
  }, [analytics]);

  useEffect(() => {
    if (!stats) return;
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [stats]);

  const pageTexture = dark ? darkPageTexture : lightPageTexture;

  if (!stats)
    return (
      <div className="relative min-h-screen overflow-hidden px-3 py-3 sm:px-4 lg:px-4" style={pageTexture}>
        <ThemeStyles />
        <div className="relative mx-auto max-w-7xl">
          <div className={`h-3 w-56 rounded-full ${dark ? "eh-shimmer-dark" : "eh-shimmer-light"}`} />
          <div className={`mt-6 h-12 w-72 rounded-xl ${dark ? "eh-shimmer-dark" : "eh-shimmer-light"}`} />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className={`h-44 rounded-2xl border ${dark ? "border-white/10 eh-shimmer-dark" : "border-[#E7E0EC] eh-shimmer-light"} lg:col-span-1`} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-44 rounded-2xl border ${dark ? "border-white/10 eh-shimmer-dark" : "border-[#E7E0EC] eh-shimmer-light"}`} />
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className={`h-60 rounded-2xl border ${dark ? "border-white/10 eh-shimmer-dark" : "border-[#E7E0EC] eh-shimmer-light"}`} />
              <div className={`h-72 rounded-2xl border ${dark ? "border-white/10 eh-shimmer-dark" : "border-[#E7E0EC] eh-shimmer-light"}`} />
            </div>
            <div className="flex flex-col gap-4">
              <div className={`h-60 rounded-2xl border ${dark ? "border-white/10 eh-shimmer-dark" : "border-[#E7E0EC] eh-shimmer-light"}`} />
              <div className={`h-60 rounded-2xl border ${dark ? "border-white/10 eh-shimmer-dark" : "border-[#E7E0EC] eh-shimmer-light"}`} />
            </div>
          </div>
          <div className={`mt-10 flex items-center justify-center gap-2 ${dark ? "text-white/30" : "text-[#79747E]"}`}>
            <Spinner className="text-sm" />
            <span className="text-[10px] uppercase tracking-[0.3em]">Loading dashboard</span>
          </div>
        </div>
      </div>
    );

  const newEnquiries = stats.enquiries.filter((e) => e.status === "new").length;
  const secondaryCards = [
    { label: "Courses", value: stats.courses.length, icon: "menu_book", to: "/admin/courses" },
    { label: "Categories", value: stats.categories.length, icon: "category", to: "/admin/categories" },
    { label: "Branches", value: stats.branches.length, icon: "apartment", to: "/admin/branches" },
  ];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const statusMeta = STATUS_META(dark);

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-3 sm:px-4 lg:px-4" style={pageTexture}>
      <ThemeStyles />
      {dark && (
        <>
          <Glow dark className="-right-32 -top-32 h-96 w-96" />
          <Glow dark className="-left-32 top-1/3 h-80 w-80" />
        </>
      )}
      {!dark && (
        <>
          <Glow className="-right-32 -top-32 h-96 w-96" />
          <Glow className="-left-32 top-1/3 h-80 w-80" />
        </>
      )}

      <div className="relative mx-auto w-full max-w-7xl">
        <div className={`flex items-center justify-between text-[10px] uppercase tracking-[0.3em] ${dark ? "text-white/35" : "text-[#79747E]"}`}>
          <span>Elysium Academy · Administration</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`eh-pulse-dot absolute inline-flex h-full w-full rounded-full ${dark ? "bg-fuchsia-400" : "bg-[#6750A4]"}`} />
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dark ? "bg-gradient-to-r from-violet-400 to-fuchsia-400" : ""}`}
                  style={!dark ? { backgroundColor: "#6750A4" } : undefined}
                />
              </span>
              <span className={dark ? "text-fuchsia-300" : "text-[#6750A4]"}>Live</span>
            </span>
            <span>{today}</span>

            {/* UI-only theme toggle */}
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] shadow-sm transition-all duration-200 whitespace-nowrap ${
                dark
                  ? "border-white/15 bg-white/10 text-white/85 shadow-fuchsia-500/10 hover:bg-white/15 hover:text-white"
                  : "border-[#D9D3E8] bg-white/80 text-[#49454F] shadow-[0_8px_24px_rgba(103,80,164,0.12)] hover:bg-[#F8F6FC] hover:text-[#21005D]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  dark ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20" : "bg-[#EADDFF] text-[#6750A4]"
                }`}
              >
                <span className="material-symbols-rounded text-[16px]" aria-hidden="true">
                  {dark ? "light_mode" : "dark_mode"}
                </span>
              </span>
              <span>{dark ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>
        </div>

        <header className={`mt-2 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-end sm:justify-between ${dark ? "border-white/10" : "border-[#E7E0EC]"}`}>
          <div>
            <div className={`flex items-center gap-3 ${dark ? "text-fuchsia-300" : "text-[#6750A4]"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-gradient-to-r from-violet-400 to-fuchsia-400" : ""}`} style={!dark ? { backgroundColor: "#6750A4" } : undefined} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">Overview</span>
            </div>
            <h1 className={`mt-3 text-5xl font-black tracking-tight ${gradientText(dark)}`}>Dashboard</h1>
          </div>
          <p className={`max-w-xs text-right text-xs leading-relaxed sm:text-sm ${dark ? "text-white/45" : "text-[#49454F]"}`}>
            A quiet record of academy content and enquiry activity, updated in real time.
          </p>
        </header>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Link to="/admin/enquiries" className={`eh-rise block ${mounted ? "eh-in" : ""}`} style={{ transitionDelay: "0ms" }}>
            <GradientShell
              dark={dark}
              className={`relative h-full overflow-hidden ${cardHoverLift(dark)} ${cardShadow(dark)} ${cardShadowHover(dark)}`}
              innerClassName="flex flex-col justify-between p-8"
              borderClass="from-violet-400 via-fuchsia-400 to-purple-400"
            >
              <div className="relative flex items-center justify-between">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full text-lg ${
                    dark ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30" : ""
                  }`}
                  style={!dark ? { backgroundColor: "#EADDFF", color: "#21005D" } : undefined}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">inbox</span>
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${dark ? "text-white/35" : "text-[#79747E]"}`}>Featured</span>
              </div>
              <div className="relative mt-8 flex items-end justify-between gap-4">
                <div>
                  <div className={`text-6xl font-black ${gradientText(dark)}`}>{newEnquiries}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`text-[11px] font-medium uppercase tracking-[0.25em] ${dark ? "text-white/55" : "text-[#49454F]"}`}>New enquiries</span>
                    <TrendBadge pct={trend.pct} positive={trend.positive} dark={dark} />
                  </div>
                </div>
                <Sparkline data={trend.series} dark={dark} />
              </div>
            </GradientShell>
          </Link>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            {secondaryCards.map((c, idx) => (
              <Link key={c.label} to={c.to} className={`eh-rise block ${mounted ? "eh-in" : ""}`} style={{ transitionDelay: `${(idx + 1) * 55}ms` }}>
                <GradientShell dark={dark} className={`h-full ${cardHoverLift(dark)} ${cardShadow(dark)} ${cardShadowHover(dark)}`} innerClassName="flex flex-col justify-between px-6 py-7">
                  <div className={`flex items-center justify-between ${dark ? "text-fuchsia-300" : "text-[#6750A4]"}`}>
                    <span className="material-symbols-rounded text-lg" aria-hidden="true">{c.icon}</span>
                    <span className={`text-xs font-bold ${gradientText(dark)}`}>{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-6">
                    <div className={`text-4xl font-black ${dark ? "text-white" : "text-[#1C1B1F]"}`}>{c.value}</div>
                    <div className={`mt-1 text-[10px] font-medium uppercase tracking-[0.25em] ${dark ? "text-white/50" : "text-[#49454F]"}`}>{c.label}</div>
                  </div>
                </GradientShell>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <GradientShell dark={dark} innerClassName="p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PanelHeading eyebrow="Trend" title="Enquiries, last 14 days" dark={dark} />
                <RangeToggle active={activeRange} onChange={setActiveRange} dark={dark} />
              </div>
              <AreaChart data={analytics.byDay} dark={dark} />
            </GradientShell>
            <GradientShell dark={dark} innerClassName="p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <PanelHeading eyebrow="Latest" title="Recent enquiries" dark={dark} />
                <div className="flex items-center gap-4">
                  <span className={`text-right text-[10px] uppercase tracking-[0.2em] ${dark ? "text-white/40" : "text-[#79747E]"}`}>
                    <span className={`text-sm font-bold ${dark ? "text-white/85" : "text-[#1C1B1F]"}`}>{weekTotal}</span> this week
                  </span>
                  <Link to="/admin/enquiries" className={`text-[10px] font-semibold uppercase tracking-[0.25em] transition ${dark ? "text-fuchsia-300 hover:text-white" : "text-[#6750A4] hover:text-[#21005D]"}`}>
                    View all →
                  </Link>
                </div>
              </div>
              <ul className={`mt-3 divide-y ${dark ? "divide-white/10" : "divide-[#E7E0EC]"}`}>
                {stats.enquiries.slice(0, 6).map((e) => {
                  const meta = statusMeta[e.status] || statusMeta.new;
                  return (
                    <li
                      key={e.id}
                      className={`group/row -mx-3 flex items-center gap-4 rounded-xl border-l-2 border-transparent px-3 py-3 transition-colors duration-200 ease-out ${
                        dark ? "hover:border-fuchsia-400 hover:bg-white/[0.04]" : "hover:border-[#6750A4] hover:bg-[#F8F6FC]"
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          dark ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/25" : ""
                        }`}
                        style={!dark ? { backgroundColor: "#EADDFF", color: "#21005D" } : undefined}
                      >
                        {initials(e.name) || "—"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`truncate font-medium ${dark ? "text-white/90" : "text-[#1C1B1F]"}`}>{e.name}</div>
                        <div className={`mt-0.5 truncate text-xs ${dark ? "text-white/45" : "text-[#79747E]"}`}>
                          {e.phone}
                          {e.course_title ? ` · ${e.course_title}` : ""}
                        </div>
                      </div>
                      {dark ? (
                        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color, opacity: meta.opacity }} />
                          {meta.label}
                        </span>
                      ) : (
                        <span
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: meta.chipBg, color: meta.chipText }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color, opacity: meta.opacity }} />
                          {meta.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {stats.enquiries.length === 0 && <p className={`py-10 text-center text-sm ${dark ? "text-white/35" : "text-[#79747E]"}`}>No enquiries yet.</p>}
            </GradientShell>
          </div>

          <div className="flex flex-col gap-4">
            <GradientShell dark={dark} innerClassName="p-6 sm:p-7">
              <PanelHeading eyebrow="Breakdown" title="By status" dark={dark} />
              <Donut segments={analytics.byStatus} total={stats.enquiries.length} today={today} hovered={hoveredStatus} onHover={setHoveredStatus} dark={dark} />
            </GradientShell>
            <GradientShell dark={dark} innerClassName="p-6 sm:p-7">
              <PanelHeading eyebrow="Ranking" title="Top courses" dark={dark} />
              <TopBars items={analytics.topCourses} mounted={mounted} dark={dark} />
            </GradientShell>
          </div>
        </div>
      </div>

      {/* Material FAB in light mode; the original glowing gradient FAB in dark mode.
         Links to the existing enquiries route, no new logic. */}
      <Link
        to="/admin/enquiries"
        className={`fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-2xl px-5 py-4 text-sm font-medium shadow-lg transition-shadow ${
          dark
            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50"
            : "text-white"
        }`}
        style={!dark ? { backgroundColor: "#6750A4" } : undefined}
      >
        <span className="material-symbols-rounded text-[20px]" aria-hidden="true">inbox</span>
        New enquiries
      </Link>
    </div>
  );
}

function PanelHeading({ eyebrow, title, dark }) {
  return (
    <div>
      <span className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${dark ? "text-fuchsia-300" : "text-[#6750A4]"}`}>{eyebrow}</span>
      <h2 className={`mt-1 text-lg font-bold ${dark ? "text-white" : "text-[#1C1B1F]"}`}>{title}</h2>
    </div>
  );
}

/* ------------------------------------------------------ UI-only widgets */

/* No-op range toggle — a hook for future filtering, doesn't touch data. */
function RangeToggle({ active, onChange, dark }) {
  return (
    <div className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${dark ? "border-white/10 bg-white/5" : "border-[#79747E]/40 bg-[#FFFBFE]"}`}>
      {["14D", "30D", "90D"].map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-150 ${
            active === r
              ? dark
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow shadow-fuchsia-500/30"
                : "bg-[#EADDFF] text-[#21005D]"
              : dark
                ? "text-white/45 hover:text-white/75"
                : "text-[#49454F] hover:bg-[#F8F6FC]"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function TrendBadge({ pct, positive, dark }) {
  if (!pct) return null;
  const cls = dark
    ? positive
      ? "text-fuchsia-300"
      : "text-indigo-300"
    : positive
      ? "text-[#146C2E]"
      : "text-[#B3261E]";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] ${cls}`}>
      <span aria-hidden="true">{positive ? "▲" : "▼"}</span>
      {Math.abs(pct)}%
    </span>
  );
}

function Sparkline({ data, width = 96, height = 34, dark }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(1, ...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const gradId = dark ? "eh-spark-grad-dark" : "eh-spark-grad-light";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={dark ? "#A78BFA" : "#EADDFF"} />
          <stop offset="100%" stopColor={dark ? "#E879F9" : "#6750A4"} />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={`url(#${gradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ----------------------------------------------------------- analytics
   Untouched from the original implementation. */
function computeAnalytics(enquiries) {
  // last 14 days
  const days = [];
  const map = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
    days.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}` });
  }
  enquiries.forEach((e) => {
    if (!e.created_at) return;
    const key = new Date(e.created_at).toISOString().slice(0, 10);
    if (key in map) map[key] += 1;
  });
  const byDay = days.map((d) => ({ ...d, count: map[d.key] }));

  const byStatus = ["new", "contacted", "closed"].map((s) => ({
    label: s,
    count: enquiries.filter((e) => (e.status || "new") === s).length,
  }));

  const courseCounts = {};
  enquiries.forEach((e) => {
    if (e.course_title) courseCounts[e.course_title] = (courseCounts[e.course_title] || 0) + 1;
  });
  const topCourses = Object.entries(courseCounts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { byDay, byStatus, topCourses };
}

/* -------------------------------------------------------------- charts */

function AreaChart({ data, dark }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const width = 700;
  const height = 160;
  const padX = 6;
  const padY = 10;
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padX + i * stepX,
    y: padY + (height - padY * 2) * (1 - d.count / max),
    ...d,
  }));

  const linePath = smoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${height - padY} L${points[0].x},${height - padY} Z`
      : "";

  function handleMove(e) {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let idx = stepX > 0 ? Math.round((relX - padX) / stepX) : 0;
    idx = Math.max(0, Math.min(points.length - 1, idx));
    setHoverIdx(idx);
  }

  const active = hoverIdx !== null ? points[hoverIdx] : null;
  const areaGradId = dark ? "eh-area-grad-dark" : "eh-area-grad-light";
  const lineGradId = dark ? "eh-line-grad-dark" : "eh-line-grad-light";

  return (
    <div className="relative mt-6">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-40 w-full cursor-crosshair"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dark ? "#C084FC" : "#EADDFF"} stopOpacity={dark ? "0.5" : "0.9"} />
            <stop offset="100%" stopColor={dark ? "#D946EF" : "#EADDFF"} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={lineGradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={dark ? "#A78BFA" : "#9A82DB"} />
            <stop offset="100%" stopColor={dark ? "#E879F9" : "#6750A4"} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${areaGradId})`} />
        <path d={linePath} fill="none" stroke={`url(#${lineGradId})`} strokeWidth="2" strokeOpacity="0.95" />
        {active && (
          <>
            <line x1={active.x} x2={active.x} y1={padY} y2={height - padY} stroke={dark ? "rgba(233,213,255,0.2)" : "rgba(103,80,164,0.18)"} strokeWidth="1" />
            <circle cx={active.x} cy={active.y} r="3.5" fill={dark ? "#170D2E" : "#FFFBFE"} stroke={dark ? "#E879F9" : "#6750A4"} strokeWidth="2" />
          </>
        )}
      </svg>
      {active && (
        <div
          className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[10px] shadow-xl ${
            dark ? "border-white/10 bg-[#1B1240]" : "border-[#E7E0EC] bg-[#FFFBFE]"
          }`}
          style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%` }}
        >
          <div className={`font-bold ${dark ? "text-white" : "text-[#1C1B1F]"}`}>{active.count} enquiries</div>
          <div className={dark ? "text-white/45" : "text-[#79747E]"}>{active.label}</div>
        </div>
      )}
      <div className={`mt-3 flex justify-between border-t pt-2 text-[10px] uppercase tracking-[0.1em] ${dark ? "border-white/10 text-white/35" : "border-[#E7E0EC] text-[#79747E]"}`}>
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/* quadratic-bezier-through-midpoints smoothing, presentation only */
function smoothPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    d += ` Q${p0.x},${p0.y} ${midX},${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L${last.x},${last.y}`;
  return d;
}

function Donut({ segments, total, today, hovered, onHover, dark }) {
  const meta = STATUS_META(dark);
  const colors = { new: meta.new.color, contacted: meta.contacted.color, closed: meta.closed.color };
  const opacities = { new: meta.new.opacity, contacted: meta.contacted.opacity, closed: meta.closed.opacity };
  const sum = segments.reduce((s, x) => s + x.count, 0) || 1;
  const R = 50,
    C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="mt-5 flex flex-col items-center gap-4">
      <div className="relative">
        <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
          <circle cx="70" cy="70" r={R} fill="none" stroke={dark ? "rgba(255,255,255,0.08)" : "#E7E0EC"} strokeWidth="10" />
          {segments.map((s) => {
            const len = (s.count / sum) * C;
            const isHovered = hovered === s.label;
            const el = (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={colors[s.label]}
                strokeOpacity={opacities[s.label]}
                strokeWidth={isHovered ? "13" : "10"}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
                onMouseEnter={() => onHover(s.label)}
                onMouseLeave={() => onHover(null)}
                className="cursor-pointer transition-[stroke-width] duration-200 ease-out motion-reduce:transition-none"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black ${gradientText(dark)}`}>{total}</span>
          <span className={`text-[9px] uppercase tracking-[0.2em] ${dark ? "text-white/35" : "text-[#79747E]"}`}>Total</span>
        </div>
      </div>
      <ul className="flex w-full flex-wrap justify-center gap-2">
        {segments.map((s) => (
          <li
            key={s.label}
            onMouseEnter={() => onHover(s.label)}
            onMouseLeave={() => onHover(null)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] transition-colors duration-150 ${
              dark
                ? hovered === s.label
                  ? "border-fuchsia-400/60 bg-white/10 text-white"
                  : "border-white/10 text-white/70"
                : hovered === s.label
                  ? "border-[#6750A4]/60 bg-[#EADDFF] text-[#21005D]"
                  : "border-[#E7E0EC] text-[#49454F]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors[s.label], opacity: opacities[s.label] }} />
            <span className="uppercase tracking-[0.1em]">{s.label}</span>
            <span className={`font-bold ${dark ? "text-white/90" : "text-[#1C1B1F]"}`}>{s.count}</span>
          </li>
        ))}
      </ul>
      <span className={`text-[9px] uppercase tracking-[0.2em] ${dark ? "text-white/30" : "text-[#79747E]"}`}>As of {today}</span>
    </div>
  );
}

function TopBars({ items, mounted, dark }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const max = Math.max(1, ...items.map((i) => i.count));
  if (items.length === 0)
    return <p className={`mt-8 text-center text-sm ${dark ? "text-white/35" : "text-[#79747E]"}`}>No course enquiries yet.</p>;
  return (
    <div className="mt-5 space-y-3.5">
      {items.map((i, idx) => (
        <div
          key={i.title}
          className="flex items-start gap-3"
          onMouseEnter={() => setHoverIdx(idx)}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <span className={`mt-0.5 text-xs font-bold ${gradientText(dark)}`}>{String(idx + 1).padStart(2, "0")}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className={`truncate pr-2 ${dark ? "text-white/75" : "text-[#49454F]"}`}>{i.title}</span>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums transition-colors duration-150 ${
                  dark
                    ? hoverIdx === idx
                      ? "border-fuchsia-400/50 text-white"
                      : "border-transparent text-white/90"
                    : hoverIdx === idx
                      ? "border-[#6750A4]/50 text-[#21005D]"
                      : "border-transparent text-[#1C1B1F]"
                }`}
              >
                {i.count}
              </span>
            </div>
            <div className={`mt-1.5 h-1.5 w-full rounded-full ${dark ? "bg-white/10" : "bg-[#E7E0EC]"}`}>
              <div
                className={`eh-bar-grow h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                  dark ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-300" : ""
                }`}
                style={{ width: mounted ? `${(i.count / max) * 100}%` : "0%", backgroundColor: !dark ? "#6750A4" : undefined }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- motion
   Local animation styles + mount-fade helper. Respects prefers-reduced-motion.
   Class names kept from the original component so every className reference
   above still resolves. */
function ThemeStyles() {
  return (
    <style>{`
      .material-symbols-rounded {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        vertical-align: middle;
        line-height: 1;
      }

      .eh-rise { opacity: 0; transform: translateY(10px); transition: opacity 500ms ease-out, transform 500ms ease-out; }
      .eh-rise.eh-in { opacity: 1; transform: translateY(0); }

      .eh-pulse-dot { animation: eh-pulse 2s ease-in-out infinite; }
      @keyframes eh-pulse {
        0%, 100% { opacity: 0.9; transform: scale(1.6); }
        50% { opacity: 0; transform: scale(2.4); }
      }

      .eh-shimmer-dark {
        background-image: linear-gradient(90deg, rgba(168,85,247,0.08) 0%, rgba(232,121,249,0.18) 50%, rgba(168,85,247,0.08) 100%);
        background-size: 200% 100%;
        animation: eh-shimmer 1.6s ease-in-out infinite;
      }
      .eh-shimmer-light {
        background-image: linear-gradient(90deg, rgba(103,80,164,0.05) 0%, rgba(103,80,164,0.12) 50%, rgba(103,80,164,0.05) 100%);
        background-size: 200% 100%;
        animation: eh-shimmer 1.6s ease-in-out infinite;
      }
      @keyframes eh-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .eh-rise { transition: none !important; opacity: 1 !important; transform: none !important; }
        .eh-pulse-dot { animation: none !important; }
        .eh-shimmer-dark, .eh-shimmer-light { animation: none !important; }
        .eh-bar-grow { transition: none !important; }
      }
    `}</style>
  );
}