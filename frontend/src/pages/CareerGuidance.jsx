import { Link } from "react-router-dom";
import { Section, SectionHeading, PageHero, Button, Reveal, TiltCard } from "../components/ui";
import { useSeo } from "../lib/useSeo";

const SERVICES = [
  ["ti-compass", "Career Counselling", "One-on-one sessions to map your interests to the right tech career path."],
  ["ti-route", "Personalized Roadmaps", "A step-by-step learning plan based on your goals and current level."],
  ["ti-certificate", "Certification Guidance", "Advice on which certifications add the most value to your profile."],
  ["ti-trending-up", "Industry Insights", "Stay informed on in-demand skills, salary trends and hiring patterns."],
];

export default function CareerGuidance() {
  useSeo({
    title: "Career Guidance · JK Education",
    description: "Career counselling, personalized learning roadmaps and certification guidance to help you choose the right tech path.",
  });

  return (
    <>
      <PageHero
        eyebrow="Find Your Path"
        title="Career Guidance"
        subtitle="Not sure where to start? Our counselors help you choose a path that fits your goals."
      />

      <Section className="py-16">
        <SectionHeading eyebrow="How we help" title="Guidance at every step" />
        <div className="grid gap-6 sm:grid-cols-2">
          {SERVICES.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 100}>
              <TiltCard max={5} className="group flex h-full gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/10">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl text-white shadow-sm shadow-brand-600/30 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <i className={`ti ${icon}`} />
                </span>
                <div>
                  <h3 className="font-display font-bold text-slate-900 group-hover:text-brand-700">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Button as={Link} to="/appointment" size="lg" variant="gradient">
            <i className="ti ti-calendar-event" /> Book a free counselling session
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
