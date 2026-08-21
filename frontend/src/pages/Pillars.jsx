import { Section, PageHero, Reveal, TiltCard } from "../components/ui";
import { useSeo } from "../lib/useSeo";

// Simatrix Academy brand palette (matched to logo, light theme only)
// Bright blue  -> #1358E0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED

const PILLARS = [
  ["ti-book-2", "Quality Curriculum", "Every course is structured by working professionals and kept up to date with the tools employers actually use."],
  ["ti-tools", "Hands-On Practice", "Learn by building. Each program is anchored by real projects, labs and assignments that mirror the job."],
  ["ti-users", "Expert Mentors", "Trainers who have shipped real software guide you, answer questions and review your work."],
  ["ti-briefcase", "Placement Support", "Resume building, mock interviews and placement drives with hiring partners across the region."],
  ["ti-refresh", "Continuous Updates", "Course material evolves with the industry so your skills never go stale."],
  ["ti-heart-handshake", "Student First", "Flexible batches, genuine doubt support, and a team that measures success by your outcomes."],
];

export default function Pillars() {
  useSeo({
    title: "Our Pillars · Simatrix Academy",
    description: "The six foundations behind every Simatrix Academy program: quality curriculum, hands-on practice, expert mentors, placement support, continuous updates and a student-first approach.",
    canonical: "/about/pillars",
  });

  return (
    <>
      <PageHero title="Our Pillars"
        subtitle="The six foundations that shape every program and every learner's experience at Simatrix Academy." />

      <Section className="py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 90}>
              <TiltCard max={6} className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#7C3AED]/10">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#1358E0] to-[#7C3AED] text-2xl text-white shadow-sm shadow-[#7C3AED]/30 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <i className={`ti ${icon}`} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 group-hover:text-[#4B3CC7]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}