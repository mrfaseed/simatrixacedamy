import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Section, PageHero, Reveal } from "../components/ui";
import EnquiryForm from "../components/EnquiryForm";
import { useSeo } from "../lib/useSeo";

export default function Appointment() {
  const [courses, setCourses] = useState([]);

  useSeo({
    title: "Book an Appointment · Elysium Academy",
    description: "Schedule a visit or a call with our counselors. Get free course counselling and a personalized learning roadmap at Elysium Academy.",
    canonical: "/appointment",
  });

  useEffect(() => {
    api.getCourses().then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <PageHero title="Book an Appointment"
        subtitle="Schedule a visit or a call with our counselors. Pick a course you're interested in and we'll do the rest." />

      <Section className="grid gap-10 py-14 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-slate-900">What to expect</h2>
          <ul className="mt-5 space-y-4 text-sm text-slate-600">
            {[
              ["ti-clock", "A 30-minute, no-pressure conversation about your goals."],
              ["ti-map-2", "Meet us at our Madurai head office or any branch."],
              ["ti-phone", "Prefer a call? We'll reach out at a time that suits you."],
              ["ti-gift", "Free course counselling and a personalized roadmap."],
            ].map(([icon, text], i) => (
              <Reveal as="li" key={text} delay={100 + i * 80} className="group flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <i className={`ti ${icon} text-lg`} />
                </span>
                <span className="pt-1.5">{text}</span>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Request an appointment</h2>
          <p className="mt-1 text-sm text-slate-500">We'll confirm your slot over phone or email.</p>
          <div className="mt-5">
            <EnquiryForm courses={courses} type="appointment" />
          </div>
        </Reveal>
      </Section>
    </>
  );
}
