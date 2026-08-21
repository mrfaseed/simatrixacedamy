import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHero, Section, SectionHeading, Reveal, Spinner } from "../components/ui";
import { useSeo } from "../lib/useSeo";
import ReviewForm from "../components/ReviewForm";

// Simatrix Academy brand palette (matched to logo, light theme only)
// Bright blue  -> #1358E0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED

function Stars({ n = 5 }) {
  return (
    <div className="flex gap-0.5 text-[#7C3AED]">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className={`ti ti-star-filled text-sm ${i < n ? "" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState(null);

  const load = () => api.getReviews().then((r) => setReviews(r.data)).catch(() => setReviews([]));
  useEffect(() => { load(); }, []);

  useSeo({
    title: "Student Reviews · Simatrix Academy",
    description: "Read reviews from students who trained at Simatrix Academy and launched their tech careers — and share your own.",
  });

  const avg =
    reviews && reviews.length
      ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <>
      <PageHero
        eyebrow="Student Reviews"
        title="Loved by our learners"
        subtitle="Real words from students who trained with us and launched their tech careers."
      >
        {avg && (
          <div className="reveal mt-6 inline-flex items-center gap-3 rounded-2xl border border-[#7C3AED]/15 bg-white px-5 py-3 shadow-sm" style={{ "--d": "160ms" }}>
            <span className="font-display bg-gradient-to-r from-[#1358E0] to-[#7C3AED] bg-clip-text text-3xl font-extrabold text-transparent">{avg}</span>
            <div>
              <Stars n={Math.round(avg)} />
              <div className="text-xs text-slate-500">{reviews.length} review{reviews.length === 1 ? "" : "s"}</div>
            </div>
          </div>
        )}
      </PageHero>

      <Section className="grid gap-12 py-16 lg:grid-cols-3">
        {/* Reviews list */}
        <div className="lg:col-span-2">
          <SectionHeading
            eyebrow="What students say"
            title="Community reviews"
            subtitle="Approved reviews from our student community."
            center={false}
          />

          {!reviews ? (
            <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <i className="ti ti-message-2-star mb-2 block text-3xl text-[#1358E0]/40" />
              <p className="font-display text-lg font-semibold text-slate-700">No reviews yet</p>
              <p className="mt-1 text-sm text-slate-400">Be the first to share your experience.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {reviews.map((r, i) => (
                <Reveal
                  key={r.id}
                  delay={(i % 2) * 90}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED]/30 hover:shadow-xl hover:shadow-[#7C3AED]/10"
                >
                  <i className="ti ti-quote absolute right-5 top-4 text-4xl text-[#EAF1FF] transition group-hover:text-[#F3ECFF]" />
                  <Stars n={r.rating || 5} />
                  <p className="relative mt-3 text-sm leading-relaxed text-slate-600">"{r.content}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#1358E0] to-[#7C3AED] font-bold text-white shadow-sm shadow-[#7C3AED]/30">
                      {r.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                      {r.role && <div className="text-xs text-slate-500">{r.role}</div>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {/* Write a review */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#7C3AED]/10">
            <div className="h-1 w-full bg-gradient-to-r from-[#1358E0] via-[#4B3CC7] to-[#7C3AED]" />
            <div className="p-6">
              <h3 className="font-display text-xl font-bold tracking-tight text-slate-900">
                Write a review
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                Studied with us? Tell future students about your experience.
              </p>
              <div className="mt-5">
                <ReviewForm onSubmitted={load} />
              </div>
            </div>
          </div>
        </aside>
      </Section>
    </>
  );
}