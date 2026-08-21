import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { Section, Spinner, Button, Reveal } from "../components/ui";
import { courseLogo, courseIcon } from "../lib/courseLogo";
import { useSeo } from "../lib/useSeo";
import EnquiryForm from "../components/EnquiryForm";
import CourseQuiz from "../components/CourseQuiz";

// Simatrix Academy brand palette (matched to logo, light theme only)
// Bright blue  -> #139fe0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCourse(null);
    api.getCourse(slug).then((res) => setCourse(res.data)).catch((e) => setError(e.message));
  }, [slug]);

  useSeo(
    course
      ? {
          title: `${course.title} · Simatrix Academy`,
          description: course.summary,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.title,
            description: course.summary,
            provider: { "@type": "Organization", name: "Simatrix Academy" },
          },
        }
      : { title: "Course · Simatrix Academy" }
  );

  if (error)
    return (
      <Section className="py-24 text-center">
        <p className="text-rose-600">{error}</p>
        <Button as={Link} to="/courses" variant="outline" className="mt-4">
          Back to courses
        </Button>
      </Section>
    );

  if (!course)
    return (
      <div className="grid place-items-center py-32">
        <Spinner className="text-3xl text-[#7C3AED]" />
      </div>
    );

  const logo = courseLogo(course);

  return (
    <>
      {/* ── Hero — premium, light, editorial ────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EAF1FF] via-white to-[#F3ECFF] py-20 text-slate-900">
        {/* ambient depth */}
        <div className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#1358E0]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-[#7C3AED]/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#1358E0_1px,transparent_1px)] [background-size:26px_26px] opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/35 to-transparent" />

        <Section className="relative flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            {/* breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <Link to="/courses" className="transition-colors hover:text-[#1358E0]">Courses</Link>
              {course.category && (
                <>
                  <i className="ti ti-chevron-right text-xs text-slate-400" />
                  <Link
                    to={`/courses?category=${course.category.slug}`}
                    className="transition-colors hover:text-[#1358E0]"
                  >
                    {course.category.name}
                  </Link>
                </>
              )}
            </nav>

            {/* eyebrow */}
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[#7C3AED]/50" />
              <span className="bg-gradient-to-r from-[#1358E0] to-[#7C3AED] bg-clip-text text-xs font-semibold uppercase tracking-[0.25em] text-transparent">
                {course.tier} Track
              </span>
            </div>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">{course.summary}</p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <Badge icon="ti-clock" text={course.duration} />
              <Badge icon="ti-stairs" text={course.level} />
              <Badge icon="ti-award" text={`${course.tier} track`} />
            </div>
          </div>

          {/* logo plate */}
          <div className="shrink-0">
            <div className="grid h-32 w-32 place-items-center rounded-3xl border border-white bg-white p-6 shadow-2xl shadow-[#7C3AED]/15 ring-1 ring-[#7C3AED]/15 sm:h-36 sm:w-36">
              {logo ? (
                <img
                  src={logo.src}
                  alt={`${logo.label} logo`}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <i className={`${courseIcon(course)} text-5xl text-[#1358E0] ${logo ? "hidden" : ""}`} />
            </div>
          </div>
        </Section>
      </section>

      {/* ── Body ─────────────────────────────────────────────── */}
      <Section className="grid gap-12 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {course.image && (
            <div className="group mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/60">
              <img
                src={mediaUrl(course.image)}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>
          )}

          {/* About */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <span className="h-px w-8 bg-gradient-to-r from-[#1358E0] to-[#7C3AED]" />
            <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
              About this course
            </h2>
          </div>
          <p className="mt-5 leading-relaxed text-slate-600">{course.description}</p>

          {course.syllabus?.length > 0 && (
            <>
              <div className="mt-12 flex items-center gap-3 border-b border-slate-200 pb-4">
                <span className="h-px w-8 bg-gradient-to-r from-[#1358E0] to-[#7C3AED]" />
                <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                  What you'll learn
                </h2>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {course.syllabus.map((mod, i) => (
                  <Reveal
                    key={i}
                    delay={(i % 2) * 80}
                    className="group flex items-start gap-3.5 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#7C3AED]/30 hover:shadow-lg hover:shadow-[#7C3AED]/10"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1358E0] to-[#7C3AED] text-xs font-semibold text-white shadow-sm shadow-[#7C3AED]/30 transition-transform group-hover:scale-110">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700">{mod}</span>
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <CourseQuiz key={course.slug} courseTitle={course.title} questions={course.quiz} />
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-[#7C3AED]/10">
            <div className="h-1 w-full bg-gradient-to-r from-[#1358E0] via-[#4B3CC7] to-[#7C3AED]" />
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900">
                Enquire about this course
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                Get the full syllabus, fees and batch timings.
              </p>
              <div className="mt-5">
                <EnquiryForm courses={[course]} compact />
              </div>
            </div>
          </div>
        </aside>
      </Section>
    </>
  );
}

function Badge({ icon, text }) {
  if (!text) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7C3AED]/15 bg-white px-3.5 py-1.5 shadow-sm ring-1 ring-slate-100">
      <i className={`ti ${icon} text-[#7C3AED]`} /> {text}
    </span>
  );
}
