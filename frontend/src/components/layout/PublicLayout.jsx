import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLenis } from "../../lib/Uselenis";

const BUTTON_PRIMARY = "#2563EB";
const BUTTON_HOVER = "#1D4ED8";

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      setProgress(scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${BUTTON_PRIMARY}, ${BUTTON_HOVER})`,
        }}
      />
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-[60] grid h-11 w-11 place-items-center rounded-full text-white shadow-lg shadow-[#1D4ED8]/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ background: `linear-gradient(135deg, ${BUTTON_PRIMARY}, ${BUTTON_HOVER})` }}
    >
      <i className="ti ti-arrow-up text-lg" />
    </button>
  );
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  useLenis();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const main = document.getElementById("main");
    main?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollProgress />
      <Navbar />
      <p className="sr-only" aria-live="polite">Page changed</p>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
