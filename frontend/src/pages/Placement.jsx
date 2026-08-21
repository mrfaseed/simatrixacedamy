import { Link } from "react-router-dom";
import { Section, SectionHeading, PageHero, Button, Reveal, TiltCard, Counter } from "../components/ui";
import { useSeo } from "../lib/useSeo";

// Simatrix Academy brand palette (matched to logo, light theme only)
// Bright blue  -> #1358E0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED

const STEPS = [
  ["ti-file-cv", "Resume Building", "Craft an ATS-friendly resume that highlights your projects and skills."],
  ["ti-messages", "Mock Interviews", "Practise technical and HR rounds with detailed feedback from mentors."],
  ["ti-presentation", "Aptitude & Soft Skills", "Sharpen aptitude, communication and group-discussion skills."],
  ["ti-building-skyscraper", "Placement Drives", "Interview directly with our hiring partners through campus drives."],
];

const STATS = [
  [100, "%", "Placement assistance"],
  [500, "+", "Hiring partners"],
  [10000, "+", "Careers launched"],
];

export default function Placement() {
  useSeo({
    title: "Placement Training · Simatrix Academy",
    description: "End-to-end placement training — resume building, mock interviews, aptitude prep and direct hiring drives with 100% placement assistance.",
  });

  return (
    <>
      <PageHero
        eyebrow="Get Hired"
        title="Placement Training"
        subtitle="We don't stop at teaching — we prepare you to get hired and support you until you do."
      />

      <Section className="py-16">
        <SectionHeading eyebrow="How it works" title="Your path to placement" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 100}>
              <TiltCard max={7} className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#7C3AED]/10">
                <span className="absolute right-5 top-4 font-display text-4xl font-extrabold text-slate-100 transition-colors duration-500 group-hover:text-[#EAF1FF]">
                  {i + 1}
                </span>
                <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#1358E0] to-[#7C3AED] text-2xl text-white shadow-sm shadow-[#7C3AED]/30 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <i className={`ti ${icon}`} />
                </span>
                <h3 className="relative mt-4 font-display font-bold text-slate-900 group-hover:text-[#4B3CC7]">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* CTA with counters — light */}
        <Reveal className="relative mt-14 overflow-hidden rounded-3xl border border-[#7C3AED]/10 bg-gradient-to-br from-[#EAF1FF] via-white to-[#F3ECFF] p-8 text-slate-900 shadow-sm sm:p-12">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">100% placement assistance</h2>
              <p className="mt-3 max-w-md text-slate-600">
                From your first project to your offer letter, our placement team works
                with you one-on-one and connects you with hiring partners.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {STATS.map(([n, suffix, label]) => (
                  <div key={label}>
                    <div className="font-display bg-gradient-to-r from-[#1358E0] to-[#7C3AED] bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
                      <Counter to={n} suffix={suffix} />
                    </div>
                    <div className="text-xs text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:text-right">
              <Button as={Link} to="/contact" variant="gradient" size="lg">
                Talk to a counselor <i className="ti ti-arrow-right" />
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}