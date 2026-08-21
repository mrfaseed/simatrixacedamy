import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Spinner } from "../../components/ui";
import {
  AdminNotificationsProvider,
  NotificationBell,
  useAdminNotifications,
} from "./AdminNotifications";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: "ti-layout-dashboard", end: true },
  { to: "/admin/courses", label: "Courses", icon: "ti-book-2" },
  { to: "/admin/categories", label: "Categories", icon: "ti-category" },
 // { to: "/admin/branches", label: "Branches", icon: "ti-building" },
  { to: "/admin/enquiries", label: "Enquiries", icon: "ti-inbox" },
  { to: "/admin/testimonials", label: "Testimonials", icon: "ti-quote" },
  { to: "/admin/blog", label: "Blog", icon: "ti-news" },
  { to: "/admin/gallery", label: "Gallery", icon: "ti-photo" },
  { to: "/admin/awards", label: "Awards", icon: "ti-award" },
  { to: "/admin/staff", label: "Staff", icon: "ti-users" },
  { to: "/admin/activity", label: "Activity", icon: "ti-history" },
  { to: "/admin/settings", label: "Settings", icon: "ti-settings" },
];


   const pageTexture = {
  backgroundColor: "#120A2E",
  backgroundImage: [
    "radial-gradient(ellipse 1000px 750px at 90% -10%, rgba(192,132,252,0.55), transparent 55%)",
    "radial-gradient(ellipse 900px 700px at 10% 15%, rgba(139,92,246,0.45), transparent 55%)",
    "radial-gradient(ellipse 1100px 800px at 50% 115%, rgba(217,70,239,0.40), transparent 60%)",
    "linear-gradient(160deg, #17103A 0%, #1F1147 45%, #2B0F45 100%)",
  ].join(", "),
  backgroundBlendMode: "screen, screen, screen, normal",
};

const glassPanel = {
  backgroundColor: "rgba(27,18,64,0.75)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

/* gradient text — the loudest, most consistent accent in this theme */
const gradientText =
  "bg-gradient-to-r from-violet-300 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent";

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden" style={pageTexture}>
        <GlowOrbs />
        <div className="relative flex flex-col items-center gap-4">
          <Spinner className="text-3xl text-fuchsia-300/80" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">Loading</span>
        </div>
      </div>
    );

  if (!admin) return <Navigate to="/admin/login" replace />;

  const doLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <AdminNotificationsProvider>
      <div className="flex h-screen overflow-hidden" style={pageTexture}>
        {/* Sidebar — fixed full height, frosted glass over the gradient backdrop */}
        <aside
          className="relative hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-white/10 text-white/65 md:flex"
          style={glassPanel}
        >
          <GlowOrbs subtle />

          <div className="relative flex h-14 items-center gap-2.5 border-b border-white/10 px-5">
  <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white/10">
    <img src="/simatrix_logo_only.png" alt="Simatrix Academy" className="h-6 w-6 object-contain" />
  </span>
  <span className="text-lg font-black tracking-tight text-white">
    Simatrix <span className={gradientText}>Academy</span>
  </span>
</div>

          <nav className="relative flex-1 space-y-1 overflow-y-auto p-3">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}w
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 overflow-hidden rounded-xl border-l-2 px-3.5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-200 ease-out ${
                    isActive
                      ? "border-fuchsia-400 bg-white/[0.06] text-white"
                      : "border-transparent text-white/45 hover:border-fuchsia-400/40 hover:bg-white/[0.04] hover:text-white/85"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <i className={`ti ${l.icon} text-lg ${isActive ? "text-fuchsia-300" : "text-white/30 group-hover:text-fuchsia-300/70"}`} />
                    <span className="flex-1">{l.label}</span>
                    {l.to === "/admin/enquiries" && <EnquiryNavBadge />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="relative border-t border-white/10 p-3">
            <button
              onClick={doLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-medium tracking-wide text-rose-300 transition-colors duration-200 ease-out hover:border-rose-400/30 hover:bg-rose-400/[0.08] hover:text-rose-200"
            >
              <i className="ti ti-logout text-lg" /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header
            className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-5"
            style={glassPanel}
          >
            <div className="flex items-center gap-3 md:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/30">
                <i className="ti ti-school text-sm" />
              </span>
              <span className="text-base font-black tracking-tight text-white">
                Elysium <span className={gradientText}>Admin</span>
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <span className="hidden text-sm font-medium text-white/65 sm:block">{admin.name}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-md shadow-fuchsia-500/30">
                {admin.name.charAt(0)}
              </span>
              <button
                onClick={doLogout}
                aria-label="Logout"
                className="grid h-10 w-10 place-items-center rounded-full text-white/40 transition-colors duration-200 ease-out hover:bg-rose-400/10 hover:text-rose-200 md:hidden"
              >
                <i className="ti ti-logout text-lg" />
              </button>
            </div>
          </header>
          {/* Only the inner content scrolls */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-0" style={pageTexture}>
            <Outlet />
          </main>
        </div>
      </div>
    </AdminNotificationsProvider>
  );
}

function EnquiryNavBadge() {
  const { newCount } = useAdminNotifications();
  if (!newCount) return null;
  return (
    <span className="relative grid min-w-[20px] place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-1.5 text-[11px] font-bold text-white shadow shadow-fuchsia-500/30">
      <span className="eh-badge-pulse absolute inset-0 rounded-full bg-white/25" />
      <span className="relative">{newCount > 99 ? "99+" : newCount}</span>
      <style>{`
        .eh-badge-pulse { animation: eh-badge-pulse 2s ease-in-out infinite; }
        @keyframes eh-badge-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .eh-badge-pulse { animation: none !important; } }
      `}</style>
    </span>
  );
}

/* -------------------------------------------------------- ambient glow */
function GlowOrbs({ subtle = false }) {
  const opacity = subtle ? "opacity-60" : "";
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${opacity}`}>
      <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-[90px]" />
      <div className="absolute -right-16 top-1/2 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[100px]" />
      <div className="absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-purple-500/15 blur-[90px]" />
    </div>
  );
}