import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Section, Spinner, Reveal } from "../components/ui";
import MapEmbed from "../components/MapEmbed";
import { useSeo } from "../lib/useSeo";

export default function Branches() {
  const [branches, setBranches] = useState(null);

  useSeo({
    title: "Our Branches · Elysium Academy",
    description: "Find an Elysium Academy branch near you across Tamil Nadu. Addresses, phone numbers, working hours and maps for every location.",
    canonical: "/branches",
  });

  useEffect(() => {
    api.getBranches().then((res) => setBranches(res.data));
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
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">Across Tamil Nadu</span>
          </div>
          <h1 className="reveal mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ "--d": "80ms" }}>Our Branches</h1>
          <p className="reveal mt-4 max-w-2xl text-lg text-brand-100/85" style={{ "--d": "160ms" }}>
            Find an Elysium Academy near you — across Tamil Nadu.
          </p>
        </Section>
      </section>

      <Section className="py-14">
        {!branches ? (
          <div className="grid place-items-center py-20">
            <Spinner className="text-3xl" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b, i) => (
              <Reveal
                key={b.id}
                delay={(i % 3) * 90}
                className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10 ${
                  b.is_primary ? "border-brand-300 ring-1 ring-brand-100" : "border-slate-200"
                }`}
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  <MapEmbed src={b.map_src} title={`${b.name} map`} />
                </div>
                <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-slate-900">{b.name}</h3>
                  {b.is_primary && (
                    <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase text-accent-600">
                      Head Office
                    </span>
                  )}
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  {b.address && (
                    <li className="flex gap-2">
                      <i className="ti ti-map-pin mt-0.5 text-brand-600" /> {b.address}
                    </li>
                  )}
                  {b.phone && (
                    <li className="flex gap-2">
                      <i className="ti ti-phone text-brand-600" />
                      <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="hover:text-brand-700">{b.phone}</a>
                    </li>
                  )}
                  {b.hours && (
                    <li className="flex gap-2">
                      <i className="ti ti-clock text-brand-600" /> {b.hours}
                    </li>
                  )}
                </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
