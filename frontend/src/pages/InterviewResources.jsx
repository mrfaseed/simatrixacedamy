import { Link } from "react-router-dom";
import { Section, SectionHeading, PageHero, Button, Reveal, TiltCard } from "../components/ui";
import { useSeo } from "../lib/useSeo";

const TOPICS = [
  ["ti-binary-tree", "Data Structures & Algorithms", ["Arrays & strings", "Linked lists & trees", "Sorting & searching", "Time & space complexity"]],
  ["ti-database", "Databases", ["SQL queries & joins", "Normalization", "Indexing basics", "Transactions"]],
  ["ti-world-www", "Web Fundamentals", ["HTTP & REST", "Browser & DOM", "Authentication", "Security basics"]],
  ["ti-cpu", "Core CS", ["OOP concepts", "Operating systems", "Networking basics", "System design intro"]],
];

const TIPS = [
  "Think out loud — interviewers value your reasoning, not just the answer.",
  "Walk through your projects with the problem, your approach and the impact.",
  "Practise on a whiteboard or paper, not only in an editor.",
  "Prepare 2-3 thoughtful questions to ask the interviewer.",
];

export default function InterviewResources() {
  useSeo({
    title: "Interview Resources · Elysium Academy",
    description: "Curated interview prep topics and tips — data structures, databases, web fundamentals and core CS — to help you walk in prepared and confident.",
    canonical: "/interview-resources",
  });

  return (
    <>
      <PageHero title="Interview Resources"
        subtitle="Curated topics and tips to help you walk into your interview prepared and confident." />

      <Section className="py-14">
        <SectionHeading eyebrow="Study guide" title="What to revise" />
        <div className="grid gap-5 sm:grid-cols-2">
          {TOPICS.map(([icon, title, items], i) => (
            <Reveal key={title} delay={i * 90}>
              <TiltCard max={5} className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-600/10">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl text-white shadow-sm shadow-brand-600/30 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    <i className={`ti ${icon}`} />
                  </span>
                  <h3 className="font-display font-bold text-slate-900 group-hover:text-brand-700">{title}</h3>
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
                  {items.map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <i className="ti ti-point-filled text-xs text-brand-400" /> {it}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 rounded-2xl border border-slate-200 bg-white p-6" delay={120}>
          <h3 className="font-display text-lg font-bold text-slate-900">Interview day tips</h3>
          <ul className="mt-4 space-y-3">
            {TIPS.map((t, i) => (
              <li key={t} className="group flex items-start gap-3 text-sm text-slate-700">
                <i className="ti ti-bulb mt-0.5 text-lg text-accent-500 transition-transform duration-300 group-hover:scale-125" style={{ transitionDelay: `${i * 30}ms` }} /> {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-10 text-center">
          <Button as={Link} to="/courses" variant="outline" size="lg">
            Explore our courses <i className="ti ti-arrow-right" />
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
