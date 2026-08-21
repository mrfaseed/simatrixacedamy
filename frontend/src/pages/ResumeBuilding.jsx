import { Link } from "react-router-dom";
import { Section, SectionHeading, PageHero, Button, Reveal, TiltCard } from "../components/ui";
import { useSeo } from "../lib/useSeo";

// Simatrix Academy brand palette (matched to logo, light theme only)
// Bright blue  -> #1358E0
// Blue-violet  -> #4B3CC7
// Violet       -> #7C3AED

const SECTIONS = [
  ["ti-user", "Contact & Header", ["Full name & job title", "Phone & professional email", "LinkedIn / GitHub links", "City & country (no full address)"]],
  ["ti-quote", "Professional Summary", ["2-3 lines, tailored to the role", "Lead with your strongest skill", "Mention years of experience", "Add a measurable highlight"]],
  ["ti-code", "Skills", ["Group by category", "List tools & frameworks", "Be honest about your level", "Match the job description"]],
  ["ti-briefcase", "Experience & Projects", ["Use action verbs", "Quantify the impact", "Newest first", "Link live demos or repos"]],
  ["ti-school", "Education & Certifications", ["Degree, institute & year", "Relevant coursework", "Online certifications", "Training programmes attended"]],
  ["ti-trophy", "Achievements", ["Awards & recognitions", "Hackathons & competitions", "Volunteering & leadership", "Publications, if any"]],
];

const TIPS = [
  "Keep it to one page (two only if you have 5+ years of experience).",
  "Tailor your resume to each job — mirror the keywords from the description.",
  "Use bullet points that start with strong action verbs: Built, Led, Improved, Reduced.",
  "Quantify results wherever possible — \"cut load time by 40%\" beats \"improved performance\".",
  "Save and send as a PDF so your formatting stays intact.",
  "Proofread twice — typos are the fastest way to get rejected.",
];

const DOS = [
  "Use a clean, single-column, ATS-friendly layout",
  "Choose one readable font and consistent spacing",
  "Name the file FirstName_LastName_Resume.pdf",
  "Show outcomes, not just responsibilities",
];

const DONTS = [
  "Add photos, age, or marital status",
  "Use fancy graphics that break ATS parsing",
  "Write long paragraphs instead of bullets",
  "Include irrelevant or outdated experience",
];

export default function ResumeBuilding() {
  useSeo({
    title: "Resume Building Guide · Simatrix Academy",
    description: "A step-by-step guide to crafting an ATS-friendly resume that gets you shortlisted.",
  });

  return (
    <>
      <PageHero
        eyebrow="Career Toolkit"
        title="Resume Building"
        subtitle="A step-by-step guide to crafting a resume that gets you shortlisted and into the interview room."
      />

      <Section className="py-16">
        <SectionHeading eyebrow="Structure" title="What goes into a great resume" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(([icon, title, items], i) => (
            <Reveal key={title} delay={(i % 3) * 100}>
              <TiltCard max={6} className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#7C3AED]/10">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#1358E0]/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#1358E0] to-[#7C3AED] text-2xl text-white shadow-sm shadow-[#7C3AED]/30 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    <i className={`ti ${icon}`} />
                  </span>
                  <h3 className="font-display font-bold text-slate-900 group-hover:text-[#4B3CC7]">{title}</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <i className="ti ti-point-filled mt-0.5 text-xs text-[#7C3AED]" /> {it}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* Do / Don't */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Reveal className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-emerald-700">
              <i className="ti ti-circle-check text-xl" /> Do
            </h3>
            <ul className="mt-4 space-y-3">
              {DOS.map((t, i) => (
                <li key={t} className="reveal flex items-start gap-3 text-sm text-slate-700" style={{ "--d": `${i * 70}ms` }}>
                  <i className="ti ti-check mt-0.5 text-lg text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/80 to-white p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-rose-600">
              <i className="ti ti-circle-x text-xl" /> Don't
            </h3>
            <ul className="mt-4 space-y-3">
              {DONTS.map((t, i) => (
                <li key={t} className="reveal flex items-start gap-3 text-sm text-slate-700" style={{ "--d": `${i * 70}ms` }}>
                  <i className="ti ti-x mt-0.5 text-lg text-rose-400" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Pro tips */}
        <Reveal className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-slate-900">
            <i className="ti ti-bulb text-[#7C3AED]" /> Pro tips
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {TIPS.map((t, i) => (
              <li key={t} className="reveal flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm text-slate-700" style={{ "--d": `${i * 60}ms` }}>
                <i className="ti ti-arrow-badge-right mt-0.5 text-lg text-[#1358E0]" /> {t}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* CTA — light */}
        <Reveal className="relative mt-14 overflow-hidden rounded-3xl border border-[#7C3AED]/10 bg-gradient-to-br from-[#EAF1FF] via-white to-[#F3ECFF] p-10 text-center text-slate-900 shadow-sm">
          <div className="relative">
            <h3 className="font-display text-2xl font-bold sm:text-3xl">Ready to stand out?</h3>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">Get your resume reviewed by our placement mentors and walk into interviews with confidence.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/appointment" size="lg" variant="gradient">
                <i className="ti ti-calendar-event" /> Get your resume reviewed
              </Button>
              <Button as={Link} to="/interview-resources" size="lg" variant="outline">
                Prepare for interviews <i className="ti ti-arrow-right" />
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}