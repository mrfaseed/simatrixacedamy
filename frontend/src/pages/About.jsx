import { Section, SectionHeading, PageHero, Reveal, TiltCard, Counter } from "../components/ui";
import { useSeo } from "../lib/useSeo";

// Simatrix Academy brand palette (matched to logo)
// Bright blue  -> #1358E0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED
// Deep navy    -> #0B0B24

const PILLARS = [
  ["ti-target", "Mission", "To make industry-ready tech education uniquely accessible, practical, and outcome-driven for every learner."],
  ["ti-eye", "Vision", "To be Tamil Nadu's most trusted software training institute, uniquely recognized for skilled, confident graduates who are workplace-ready."],
  ["ti-heart-handshake", "Values", "Integrity, mentorship, hands-on learning and a genuine commitment to student success."],
];

const STATS = [
  [11, "+", "Branches across Tamil Nadu"],
  [40, "+", "Industry-aligned courses"],
  [100, "%", "Placement assistance"],
  [10000, "+", "Learners trained"],
];

export default function About() {
  useSeo({
    title: "About Us · Simatrix Academy",
    description: "Simatrix Academy is a software training institute in Madurai bridging academic learning and real-world industry demands through practical, mentor-led programs across Tamil Nadu.",
    canonical: "/about",
  });

  return (
    <>
      <PageHero
        eyebrow="Who We Are"
        title="About Simatrix Academy"
        subtitle="A software training institute headquartered in Madurai, dedicated to bridging the gap between academic learning and real-world industry demands through practical, mentor-led programs. Learn without limits."
      />

      <Section className="py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(([n, suffix, label], i) => (
            <Reveal key={label} delay={i * 90}>
              <TiltCard max={6} className="group rounded-2xl border border-[#1358E0]/10 bg-white p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#7C3AED]/15">
                <div className="font-display bg-gradient-to-r from-[#1358E0] via-[#4B3CC7] to-[#7C3AED] bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
                  <Counter to={n} suffix={suffix} />
                </div>
                <div className="mt-1 text-sm text-slate-500">{label}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-6">
        <SectionHeading eyebrow="Who we are" title="Built around your success" />
        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 100}>
              <TiltCard max={6} className="group h-full rounded-2xl border border-[#1358E0]/10 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#7C3AED]/15">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#1358E0] to-[#7C3AED] text-2xl text-white shadow-sm shadow-[#7C3AED]/30 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <i className={`ti ${icon}`} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 group-hover:text-[#4B3CC7]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-14">
        <Reveal dir="scale" className="relative overflow-hidden rounded-3xl border border-[#1358E0]/10 bg-gradient-to-br from-[#EAF1FF] via-white to-[#F3ECFF] p-8 text-slate-700 shadow-sm sm:p-12">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/40 to-transparent" />
          <div className="relative">
            <h2 className="font-display bg-gradient-to-r from-[#1358E0] via-[#4B3CC7] to-[#7C3AED] bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">Our approach</h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
              Every program is designed with hands-on projects, updated course
              material, and dedicated mentor support. From your first concept to
              interview preparation and placement drives with hiring partners, we
              walk with you through the entire journey — so you graduate not just
              certified, but genuinely job-ready.
            </p>
          </div>
        </Reveal>
      </Section>
    </>
  );
}