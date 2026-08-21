import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { icon } from "../lib/icons";
import { Section, Spinner, Reveal } from "../components/ui";
import { useSeo } from "../lib/useSeo";
import CourseCard from "../components/CourseCard";

// Simatrix Academy brand palette (matched to logo, light theme only)
// Bright blue  -> #1358E0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const active = params.get("category") || "";
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    api.getSite().then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setCourses(null);
    api.getCourses(active).then((res) => setCourses(res.data));
  }, [active]);

  const setCategory = (slug) => {
    if (slug) setParams({ category: slug });
    else setParams({});
  };

  const activeName =
    active && categories.find((c) => c.slug === active)?.name;

  useSeo({
    title: `${activeName ? activeName + " Courses" : "Courses"} · Simatrix Academy`,
    description:
      "Browse industry-aligned software training courses — programming, full stack, data science, cloud, cybersecurity and more, with placement assistance.",
  });

  return (
    <>
      {/* ── Hero — classic, light, editorial: hairlines over blocks,
           wide letter-spacing, generous quiet space ─────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EAF1FF] via-white to-[#F3ECFF] py-16 text-slate-900">
        {/* ambient depth */}
        <div className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-[#1358E0]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#7C3AED]/[0.08] blur-3xl" />

        <Section className="relative">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-[#7C3AED]/40" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#4B3CC7]">
              Job-Ready Programs
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Our Courses
          </h1>

          <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-600">
            Explore {courses ? courses.length : "—"} expertly crafted programs
            across programming, full stack, data science, cloud and
            cybersecurity — each built to take you from fundamentals to hired.
          </p>

          <span className="mt-6 block h-px w-full max-w-lg bg-gradient-to-r from-[#7C3AED]/20 to-transparent" />
        </Section>
      </section>

      {/* ── Filters + Grid ───────────────────────────────────── */}
      <Section className="py-14">
        <div aria-label="Filter courses by category" className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip label="All" active={!active} onClick={() => setCategory("")} />
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              ico={cat.icon}
              active={active === cat.slug}
              onClick={() => setCategory(cat.slug)}
            />
          ))}
        </div>

        {/* section header */}
        <div className="mt-12 flex items-end justify-between border-b border-slate-200 pb-4">
          <h2 className="font-display text-2xl font-medium tracking-tight text-slate-900">
            {activeName || "All Programs"}
          </h2>
          {courses && (
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400" aria-live="polite">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </span>
          )}
        </div>

        <div className="mt-8">
          {!courses ? (
            <div className="grid place-items-center py-24">
              <Spinner className="text-3xl text-[#7C3AED]" />
            </div>
          ) : courses.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-xl text-slate-700">No courses found</p>
              <p className="mt-2 text-sm text-slate-400">Try a different category.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((c, i) => (
                <Reveal key={c.id} delay={(i % 4) * 100}>
                  <CourseCard course={c} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

function FilterChip({ label, ico, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        active
          ? "bg-gradient-to-r from-[#1358E0] to-[#4B3CC7] text-white ring-1 ring-[#7C3AED]/20"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#1358E0] hover:ring-[#7C3AED]/30"
      }`}
    >
      {ico && (
        <i
          className={`${icon(ico)} text-xs transition-colors ${
            active ? "text-white" : "text-slate-400 group-hover:text-[#7C3AED]"
          }`}
        />
      )}
      {label}
    </button>
  );
}
