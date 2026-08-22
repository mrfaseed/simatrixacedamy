import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, MessageCircle, Mail, Sun, Moon, Monitor, ChevronDown, Menu, X as CloseIcon } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ABOUT_LINKS = [
  { label: "Academy Overview", to: "/about" },
  { label: "Mission & Vision", to: "/about/mission" },
  { label: "Our Pillars", to: "/about/pillars" },
  { label: "Awards", to: "/awards" },
  { label: "Gallery", to: "/gallery" },
];

const SUPPORT_LINKS = [
  { label: "Placement Training", to: "/placement" },
  { label: "Career Guidance", to: "/career-guidance" },
  { label: "Book Appointment", to: "/appointment" },
  { label: "Help Center", to: "/help-center" },
  { label: "Blog", to: "/blog" },
  { label: "Student Reviews", to: "/reviews" },
  { label: "Interview Resources", to: "/interview-resources" },
];

export default function Navbar() {
  const { pathname, search } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Floating Pill Container */}
      <div className="fixed top-4 left-1/2 z-50 w-full max-w-6xl -translate-x-1/2 px-4 sm:px-6">
        <header
          className={`flex h-[56px] items-center justify-between rounded-full border border-black/5 bg-white/90 px-3 shadow-sm backdrop-blur-md transition-all duration-300 ${
            scrolled ? "bg-white/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]" : ""
          }`}
        >
          
          {/* Left Section: Brand */}
          <div className="flex w-[190px] shrink-0 items-center justify-center pl-2">
            <Link to="/" className="flex items-center justify-center">
              {/* Nudged up 3px visually to compensate for image padding/visual weight */}
              <img src="/MASTER SDS .png" alt="Simatrix Logo" className="h-auto w-[190px] shrink-0 -translate-y-[6px] object-contain" />
            </Link>
          </div>

          {/* Middle Section: Navigation Links (Desktop) */}
          <nav className="hidden items-center gap-1 lg:flex">
            <TopLink to="/" label="Home" />
            <NavHoverMenu label="About" links={ABOUT_LINKS} />
            <TopLink to="/courses" label="Courses" />
            <NavHoverMenu label="Support" links={SUPPORT_LINKS} />
            <TopLink to="/contact" label="Contact" />
          </nav>

          {/* Right Section: Utility & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Quick Search (Always visible) */}
            <button className="hidden h-9 w-[180px] items-center justify-between gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition-colors hover:bg-slate-100 lg:flex">
              <div className="flex shrink-0 items-center gap-2">
                <Search className="h-[14px] w-[14px]" />
                <span className="whitespace-nowrap text-[13px]">
                  Quick search...
                </span>
              </div>
              <kbd className="flex h-[18px] shrink-0 items-center justify-center rounded border border-slate-200 bg-white px-[5px] text-[10px] font-medium text-slate-500 shadow-sm">
                ⌘K
              </kbd>
            </button>

            {/* Divider */}
            <div className="mx-2 hidden h-4 w-[1px] bg-slate-200 sm:block" />

            {/* Action Icons & Theme Toggle */}
            <div className="hidden items-center gap-1.5 sm:flex">
              {/* WhatsApp */}
              <SocialBtn icon={<MessageCircle className="h-4 w-4" />} />
              {/* Email */}
              <SocialBtn icon={<Mail className="h-4 w-4" />} />
              {/* Theme Toggle Menu */}
              <ThemeToggle />
            </div>

            {/* Mobile Toggle */}
            <button
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/MASTER SDS .png" alt="Simatrix Logo" className="h-8 w-auto object-contain" />
            </div>
            <button
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"
              onClick={() => setMobileOpen(false)}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="mt-8 flex flex-col gap-4 text-lg font-medium text-slate-800">
            <NavLink to="/" onClick={() => setMobileOpen(false)}>Home</NavLink>
            <div className="h-px bg-slate-100" />
            <span className="text-sm font-semibold text-slate-400">About</span>
            <div className="flex flex-col gap-3 pl-4 text-base text-slate-600">
              {ABOUT_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}>{l.label}</NavLink>
              ))}
            </div>
            <div className="h-px bg-slate-100" />
             <NavLink to="/courses" onClick={() => setMobileOpen(false)}>Courses</NavLink>
            <div className="h-px bg-slate-100" />
             <span className="text-sm font-semibold text-slate-400">Support</span>
            <div className="flex flex-col gap-3 pl-4 text-base text-slate-600">
              {SUPPORT_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}>{l.label}</NavLink>
              ))}
            </div>
            <div className="h-px bg-slate-100" />
            <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</NavLink>
          </nav>
        </div>
      )}
    </>
  );
}

/* Sub-components */

function TopLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-3.5 py-1.5 text-[14px] font-medium transition-colors ${
          isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function NavHoverMenu({ label, links }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[14px] font-medium text-slate-600 outline-none transition-colors group-hover:bg-slate-50 group-hover:text-slate-900">
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover:rotate-180" />
      </button>
      
      {/* Invisible hover bridge to prevent menu from closing when moving mouse down */}
      <div className="absolute left-0 top-full h-3 w-full" />
      
      {/* Dropdown Content */}
      <div className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-[100] min-w-[200px] origin-top-left -translate-y-2 scale-95 opacity-0 shadow-xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white p-1.5">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block cursor-pointer rounded-xl px-3 py-2 text-[14px] font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialBtn({ icon }) {
  return (
    <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900">
      {icon}
    </button>
  );
}

function ThemeToggle() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 outline-none">
          <Sun className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={12}
          align="end"
          className="z-[100] min-w-[140px] overflow-hidden rounded-xl border border-black/5 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95"
        >
          <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900 data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900">
            <Sun className="h-4 w-4" /> Light Mode
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900 data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900">
            <Moon className="h-4 w-4" /> Dark Mode
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 hover:text-slate-900 data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900">
            <Monitor className="h-4 w-4" /> System
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
