import { Section, SectionHeading, PageHero, Reveal, TiltCard } from "../components/ui";
import { useSeo } from "../lib/useSeo";

const GOALS = [
  ["ti-target", "Our Mission", "To make practical, industry-ready technology education uniquely accessible, hands-on, and outcome-driven for every learner."],
  ["ti-eye", "Our Vision", "To be the most trusted software training institute in the region, uniquely recognized for producing skilled, confident graduates who are workplace-ready from day one."],
];

const COMMITMENTS = [
  "Teach with real-world projects, not just theory",
  "Keep every syllabus current with industry tools",
  "Offer dedicated mentor and doubt-clearing support",
  "Provide honest, hands-on placement assistance",
  "Make learning flexible for students and working professionals",
  "Measure our success by our learners' outcomes",
];

export default function Mission() {
  useSeo({
    title: "Mission & Vision · Elysium Academy",
    description: "Our mission and vision: making practical, industry-ready technology education uniquely accessible and turning curiosity into a confident, employable skill set.",
    canonical: "/about/mission",
  });

  return (
    <>
      <PageHero title="Mission & Vision"
        subtitle="What drives us, and the promise we make to every learner who walks through our doors." />

      <Section className="py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {GOALS.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 120} dir={i === 0 ? "left" : "right"}>
              <TiltCard max={5} className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/10">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-3xl text-white shadow-sm shadow-brand-600/30 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <i className={`ti ${icon}`} />
                </span>
                <h2 className="mt-5 font-display text-2xl font-bold text-slate-900 group-hover:text-brand-700">{title}</h2>
                <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pb-16">
        <SectionHeading eyebrow="Our Commitments" title="Promises we keep" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMMITMENTS.map((c, i) => (
            <Reveal key={c} delay={i * 70}>
              <div className="group flex h-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
                <i className="ti ti-circle-check mt-0.5 text-xl text-emerald-500 transition-transform duration-300 group-hover:scale-125" />
                <span className="text-sm text-slate-700">{c}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
