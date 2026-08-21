import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Section, Reveal } from "../components/ui";
import EnquiryForm from "../components/EnquiryForm";
import MapEmbed from "../components/MapEmbed";
import { useSeo } from "../lib/useSeo";

export default function Contact() {
  const [courses, setCourses] = useState([]);
  const [branch, setBranch] = useState(null);
  const [mapSrc, setMapSrc] = useState(null);

  const contactAddress = branch?.address || "227, IInd Floor, Church Road, Anna Nagar, Madurai - 625020, Tamil Nadu";
  const contactPhone = branch?.phone || "096777 81155 / 096777 24437";
  const contactHours = branch?.hours || "Monday - Saturday: 9 AM - 7 PM\nSunday: 10 AM - 3 PM";

  useSeo({
    title: "Contact Us · Simatrix Academy",
    description: branch
      ? `Get in touch with Simatrix Academy, ${branch.name}. Call ${branch.phone || "096777 81155"}, email info@simatrixacademy.com, or send us a message and we'll respond within one business day.`
      : "Get in touch with Simatrix Academy. Call 096777 81155, email info@simatrixacademy.com, or send us a message and we'll respond within one business day.",
    canonical: "/contact",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Simatrix Academy",
      email: "info@simatrixacademy.com",
      telephone: branch?.phone || "+91-96777-81155",
      address: {
        "@type": "PostalAddress",
        streetAddress: branch?.address || "227, IInd Floor, Church Road, Anna Nagar",
        addressLocality: branch?.name || "Madurai",
        postalCode: branch?.postal_code || "625020",
        addressRegion: branch?.region || "Tamil Nadu",
        addressCountry: "IN",
      },
    },
  });

  useEffect(() => {
    api.getCourses().then((res) => setCourses(res.data)).catch(() => {});
    api.getBranches()
      .then((res) => {
        const viruthunagar = res.data.find((b) => /viruthunagar/i.test(`${b.name || ""} ${b.address || ""}`));
        const selectedBranch = viruthunagar || res.data.find((b) => b.is_primary) || res.data[0];
        if (selectedBranch) {
          setBranch(selectedBranch);
          setMapSrc(selectedBranch.map_src);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="animated-gradient relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-20 text-white">
        <div className="bg-dotgrid absolute inset-0 opacity-50" />
        <div className="blob absolute -left-28 -top-36 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="blob absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-accent-500/12 blur-3xl" style={{ animationDelay: "-6s" }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-300/45 to-transparent" />
        <Section className="relative">
          <div className="reveal flex items-center gap-3">
            <span className="h-px w-10 bg-accent-300/70" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">Get In Touch</span>
          </div>
          <h1 className="reveal mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ "--d": "80ms" }}>Contact Us</h1>
          <p className="reveal mt-4 max-w-2xl text-lg text-brand-100/85" style={{ "--d": "160ms" }}>
            Have a question or ready to enroll? Reach out and our team will get
            back to you shortly.
          </p>
        </Section>
      </section>

      <Section className="grid gap-10 py-14 lg:grid-cols-2">
        <div>
          <Reveal as="h2" className="font-display text-2xl font-bold text-slate-900">Get in touch</Reveal>
          <div className="mt-6 space-y-5">
            <ContactItem icon="ti-map-pin" title="Head Office" delay={80}>
              {contactAddress}
            </ContactItem>
            <ContactItem icon="ti-phone" title="Phone" delay={160}>
              {contactPhone.split("/").map((phone, idx) => (
                <span key={idx}>
                  <a href={`tel:${phone.trim().replace(/\s/g, "")}`} className="hover:text-brand-700">
                    {phone.trim()}
                  </a>
                  {idx < contactPhone.split("/").length - 1 ? " / " : ""}
                </span>
              ))}
            </ContactItem>
            <ContactItem icon="ti-mail" title="Email" delay={240}>
              <a href="mailto:info@simatrixacademy.com" className="hover:text-brand-700">
                info@simatrixacademy.com
              </a>
            </ContactItem>
            <ContactItem icon="ti-clock" title="Working Hours" delay={320}>
              {contactHours.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < contactHours.split("\n").length - 1 ? <br /> : null}
                </span>
              ))}
            </ContactItem>
          </div>

          <Reveal delay={360} className="mt-8 flex gap-3">
            <a href="https://wa.me/919677781155" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              <i className="ti ti-brand-whatsapp" /> WhatsApp
            </a>
            <a href="tel:09677781155"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:shadow-md hover:shadow-brand-600/40">
              <i className="ti ti-phone" /> Call Now
            </a>
          </Reveal>
        </div>

        <Reveal delay={120} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Send us a message</h2>
          <p className="mt-1 text-sm text-slate-500">We'll respond within one business day.</p>
          <div className="mt-5">
            <EnquiryForm courses={courses} />
          </div>
        </Reveal>
      </Section>

      <Section className="pb-16">
        <Reveal className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="aspect-[21/9]">
            <MapEmbed src={mapSrc} title="Simatrix Academy head office map" />
          </div>
        </Reveal>
      </Section>
    </>
  );
}

function ContactItem({ icon, title, children, delay = 0 }) {
  return (
    <Reveal delay={delay} className="group flex gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl text-white shadow-sm shadow-brand-600/30 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
        <i className={`ti ${icon}`} />
      </span>
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 text-sm text-slate-600">{children}</div>
      </div>
    </Reveal>
  );
}
