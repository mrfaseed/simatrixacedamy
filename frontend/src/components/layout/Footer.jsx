import { Link } from "react-router-dom";
import { useSettings } from "../../lib/useSettings";

export default function Footer() {
  const year = new Date().getFullYear();
  const s = useSettings();

  const phone = s.contact_phone || "096777 81155";
  const email = s.contact_email || "info@simatrixacademy.com";
  const address = s.contact_address || "227, IInd Floor, Church Road, Anna Nagar, Madurai - 625020";

  const explore = [
    ["About Us", "/about"],
    ["Courses", "/courses"],
    ["Placement Training", "/placement"],
    ["Blog", "/blog"],
    ["Gallery", "/gallery"],
    ["Contact", "/contact"],
  ];

  const programs = [
    ["Full Stack Development", "/courses?category=full-stack"],
    ["Data Science & AI", "/courses?category=data-science"],
    ["Cloud Computing", "/courses?category=cloud"],
    ["Cybersecurity", "/courses?category=cybersecurity"],
  ];

  const socials = [
    ["ti-brand-linkedin", s.social_linkedin, "LinkedIn"],
    ["ti-brand-instagram", s.social_instagram, "Instagram"],
    ["ti-brand-youtube", s.social_youtube, "YouTube"],
    ["ti-brand-facebook", s.social_facebook, "Facebook"],
    ["ti-brand-whatsapp", s.whatsapp ? `https://wa.me/${s.whatsapp}` : "https://wa.me/919677781155", "WhatsApp"],
  ].filter(([, url]) => url);

  return (
    <footer className="relative mt-24 overflow-hidden bg-gradient-to-b from-slate-950 via-[#150f3d] to-slate-950 text-slate-300">
      {/* top gradient hairline — the exact logo gradient, not a generic tint */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #1E8FE0 20%, #241C6B 50%, #7B2FCB 80%, transparent)",
        }}
      />
      {/* ambient glow, split blue → violet like the two ends of the mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "linear-gradient(90deg, rgba(30,143,224,0.18), rgba(123,47,203,0.18))" }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Simatrix
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #4FC3F7, #C084FC)" }}
              >
                Academy
              </span>
            </span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
            A software training institute delivering industry-aligned, hands-on
            programs with dedicated placement assistance across Tamil Nadu.
          </p>

          <div className="mt-6 flex gap-2.5">
            {socials.map(([icon, href, label]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="group grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-slate-400 ring-1 ring-white/10 transition hover:text-white hover:ring-[#7B2FCB]/50"
                onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #1E8FE0, #7B2FCB)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <i className={`ti ${icon} text-base`} />
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <FooterHeading>Explore</FooterHeading>
          <ul className="mt-5 space-y-2.5 text-sm">
            {explore.map(([label, to]) => (
              <li key={to}>
                <FooterLink to={to}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Programs */}
        <div>
          <FooterHeading>Top Programs</FooterHeading>
          <ul className="mt-5 space-y-2.5 text-sm">
            {programs.map(([label, to]) => (
              <li key={to}>
                <FooterLink to={to}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Get in touch */}
        <div>
          <FooterHeading>Get in touch</FooterHeading>
          <ul className="mt-5 space-y-4 text-sm text-slate-400">
            <li className="flex gap-3">
              <ContactIcon icon="ti-map-pin" />
              <span className="leading-relaxed">{address}</span>
            </li>
            <li className="flex items-center gap-3">
              <ContactIcon icon="ti-phone" />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="transition hover:text-white">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <ContactIcon icon="ti-mail" />
              <a href={`mailto:${email}`} className="transition hover:text-white">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:px-6">
          <p>© {year} Simatrix Academy. All rights reserved.</p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 transition hover:border-[#7B2FCB]/50 hover:text-white"
          >
            <i className="ti ti-lock text-[13px]" />
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ---- small presentational helpers ---- */

function FooterHeading({ children }) {
  return (
    <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white">
      {children}
      <span
        className="mt-3 block h-px w-9"
        style={{ background: "linear-gradient(90deg, #4FC3F7, transparent)" }}
      />
    </h4>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center text-slate-400 transition-colors hover:text-white"
    >
      <span
        className="mr-0 h-px w-0 transition-all duration-300 group-hover:mr-2 group-hover:w-4"
        style={{ background: "linear-gradient(90deg, #4FC3F7, #C084FC)" }}
      />
      {children}
    </Link>
  );
}

function ContactIcon({ icon }) {
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8AD1FF] ring-1 ring-white/10"
      style={{ background: "linear-gradient(135deg, rgba(30,143,224,0.2), rgba(123,47,203,0.12))" }}
    >
      <i className={`ti ${icon} text-sm`} />
    </span>
  );
}
