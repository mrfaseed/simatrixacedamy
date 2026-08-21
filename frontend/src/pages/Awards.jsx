import { useEffect, useState } from "react";
import { api, mediaUrl } from "../api/client";
import { Section, Spinner, PageHero, Reveal, TiltCard, Counter } from "../components/ui";
import { useSeo } from "../lib/useSeo";

const STATS = [
  ["ti-award", 25, "+", "Awards & honours"],
  ["ti-users", 10000, "+", "Students trained"],
  ["ti-building-community", 11, "", "Branches"],
  ["ti-star-filled", 4.9, "", "Avg. rating"],
];

export default function Awards() {
  const [awards, setAwards] = useState(null);

  useEffect(() => {
    api.getAwards().then((res) => setAwards(res.data)).catch(() => setAwards([]));
  }, []);

  useSeo({
    title: "Awards & Recognition · JK Education",
    description: "Honours and recognition that reflect JK Education's commitment to quality training and student success.",
  });

  return (
    <>
      <PageHero
        eyebrow="Recognition"
        title="Awards & Recognition"
        subtitle="Honours that reflect our commitment to quality training and student success."
      />

      {/* Stats strip */}
      <Section className="-mt-10 relative z-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 shadow-xl shadow-brand-900/10 ring-1 ring-slate-200 sm:grid-cols-4">
          {STATS.map(([icon, n, suffix, label], i) => (
            <Reveal key={label} delay={i * 90} className="bg-white p-5 text-center">
              <i className={`ti ${icon} text-2xl text-accent-500`} />
              <div className="mt-1 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
                <Counter to={n} suffix={suffix} />
              </div>
              <div className="text-xs font-medium text-slate-500">{label}</div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-16">
        {!awards ? (
          <div className="grid place-items-center py-20"><Spinner className="text-3xl" /></div>
        ) : awards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
            <i className="ti ti-award mb-2 block text-4xl text-brand-200" />
            <p className="text-slate-500">Awards will be listed here soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 100}>
                <TiltCard className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/10">
                  {/* corner glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent-400/15 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0" />
                  {a.image ? (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img src={mediaUrl(a.image)} alt={a.title}
                        className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  ) : (
                    <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-300 to-accent-600 text-3xl text-white shadow-lg shadow-accent-500/30 ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                      <i className="ti ti-award" />
                    </span>
                  )}
                  {a.year && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-500/15">
                      {a.year}
                    </span>
                  )}
                  <h3 className="mt-2 font-display text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-700">{a.title}</h3>
                  {a.issuer && <p className="mt-1 text-sm font-medium text-accent-600">{a.issuer}</p>}
                  {a.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.description}</p>}
                </TiltCard>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
