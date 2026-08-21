import { useState } from "react";
import { Link } from "react-router-dom";
import { Section, PageHero, Button, Reveal } from "../components/ui";
import { useSeo } from "../lib/useSeo";

const FAQS = [
  ["Do I need prior programming experience?", "No. Many of our courses start from the absolute basics. We'll guide you from fundamentals to job-ready skills, whatever your background."],
  ["Are the courses online or in-person?", "We offer in-person training at our branches. Reach out to your nearest branch to ask about schedules and any flexible options."],
  ["Do you provide placement assistance?", "Yes. Placement support — resume building, mock interviews and placement drives with hiring partners — is part of our programs."],
  ["Will I get a certificate?", "Yes, you receive a course completion certificate. Several tracks also prepare you for recognized industry certifications."],
  ["Can working professionals join?", "Absolutely. We offer flexible batch timings designed to fit around work schedules."],
  ["How do I pay the course fee?", "Speak with our counselors about fees, available batches and payment options for your chosen course."],
];

export default function HelpCenter() {
  const [open, setOpen] = useState(0);

  useSeo({
    title: "Help Center · Elysium Academy",
    description: "Answers to the questions we hear most often about courses, batches, placement assistance, certificates and fees at Elysium Academy.",
    canonical: "/help-center",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  });

  return (
    <>
      <PageHero title="Help Center"
        subtitle="Answers to the questions we hear most often. Still stuck? We're one call away." />

      <Section className="grid gap-10 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-3">
            {FAQS.map(([q, a], i) => (
              <Reveal key={q} delay={i * 60}>
                <div className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${open === i ? "border-brand-200 shadow-md shadow-brand-600/5" : "border-slate-200"}`}>
                  <button onClick={() => setOpen(open === i ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:text-brand-700">
                    <span className="font-medium text-slate-900">{q}</span>
                    <i className={`ti ti-chevron-down shrink-0 text-slate-400 transition-transform duration-300 ${open === i ? "rotate-180 text-brand-600" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <aside>
          <Reveal className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6" delay={120}>
            <h3 className="font-display text-lg font-bold text-slate-900">Still need help?</h3>
            <p className="mt-2 text-sm text-slate-600">Our team is happy to answer anything else.</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2"><i className="ti ti-phone text-brand-600" /> 096777 81155</p>
              <p className="flex items-center gap-2"><i className="ti ti-mail text-brand-600" /> info@elysiumacademy.org</p>
            </div>
            <Button as={Link} to="/contact" className="mt-5 w-full">Contact us</Button>
          </Reveal>
        </aside>
      </Section>
    </>
  );
}
