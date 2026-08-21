import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/ui";

/* ============================================================================
   ELYSIUM ACADEMY — ADMIN LOGIN
   ----------------------------------------------------------------------------
   Design language: "the quiet hour inside the observatory tower."
   The academy's crest is a rotating sigil of nested rings — the same geometry
   used across the brand mark — and the login card is staged as if the sigil
   itself has cracked open a doorway of violet light. Fireflies (the academy's
   informal mascot / wayfinding motif) drift upward through the scene, and the
   card's border carries a slow current of light, as though it is still being
   drawn.

   Token system
   ----------------------------------------------------------------------------
   Color
     --ink        #0B0620   deep night — page base
     --plum       #1B0F3D   card base
     --violet     #8B5CF6   primary accent
     --fuchsia    #E879F9   secondary accent
     --gold       #FBBF66   the academy's "gold seal" — sparingly used
     --mist       #C9C3E0   muted text on dark

   Type
     Display : "Cormorant Garamond" — a humanist serif for the wordmark and
               the page's one big idea, evoking an engraved brass plaque.
     Body    : "Inter" — quiet, legible, does not compete with the display face.

   Layout
     Centered card over a full-bleed animated night sky. A rotating sigil sits
     behind the wordmark as the signature element. Everything else is quiet:
     one accent color family, restrained motion, generous spacing.

   Signature element
     The rotating three-ring sigil + upward-drifting firefly field. It is the
     one thing this screen is remembered by.
   ============================================================================ */

/* -------------------------------------------------------------------------- */
/*  Global styles + keyframes                                                  */
/* -------------------------------------------------------------------------- */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&display=swap');

    .ea-root {
      --ink: #0B0620;
      --plum: #1B0F3D;
      --plum-soft: #241354;
      --violet: #8B5CF6;
      --violet-soft: #A78BFA;
      --fuchsia: #E879F9;
      --gold: #FBBF66;
      --mist: #C9C3E0;
      --mist-dim: #9089B0;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .ea-display {
      font-family: 'Cormorant Garamond', serif;
    }

    /* ---- background ambience ---- */

    @keyframes ea-aurora-drift-a {
      0%   { transform: translate(-6%, -4%) scale(1);   opacity: 0.55; }
      50%  { transform: translate(4%, 3%) scale(1.12);  opacity: 0.75; }
      100% { transform: translate(-6%, -4%) scale(1);   opacity: 0.55; }
    }
    @keyframes ea-aurora-drift-b {
      0%   { transform: translate(5%, 2%) scale(1);     opacity: 0.45; }
      50%  { transform: translate(-4%, -5%) scale(1.08); opacity: 0.65; }
      100% { transform: translate(5%, 2%) scale(1);     opacity: 0.45; }
    }
    @keyframes ea-aurora-drift-c {
      0%   { transform: translate(0%, 4%) scale(1);     opacity: 0.35; }
      50%  { transform: translate(2%, -3%) scale(1.1);  opacity: 0.55; }
      100% { transform: translate(0%, 4%) scale(1);     opacity: 0.35; }
    }
    .ea-aurora-a { animation: ea-aurora-drift-a 22s ease-in-out infinite; }
    .ea-aurora-b { animation: ea-aurora-drift-b 26s ease-in-out infinite; }
    .ea-aurora-c { animation: ea-aurora-drift-c 30s ease-in-out infinite; }

    @keyframes ea-twinkle {
      0%, 100% { opacity: var(--tw-min, 0.15); }
      50%      { opacity: var(--tw-max, 0.85); }
    }
    .ea-star { animation: ea-twinkle var(--tw-dur, 4s) ease-in-out infinite; animation-delay: var(--tw-delay, 0s); }

    /* ---- sigil ---- */

    @keyframes ea-spin-cw  { to { transform: rotate(360deg); } }
    @keyframes ea-spin-ccw { to { transform: rotate(-360deg); } }
    @keyframes ea-sigil-breathe {
      0%, 100% { opacity: 0.55; filter: drop-shadow(0 0 8px rgba(139,92,246,0.35)); }
      50%      { opacity: 0.9;  filter: drop-shadow(0 0 20px rgba(232,121,249,0.5)); }
    }
    .ea-ring-outer { animation: ea-spin-cw 60s linear infinite; }
    .ea-ring-mid   { animation: ea-spin-ccw 40s linear infinite; }
    .ea-ring-inner { animation: ea-spin-cw 24s linear infinite; }
    .ea-sigil-glow { animation: ea-sigil-breathe 5s ease-in-out infinite; }

    /* ---- card ---- */

    @keyframes ea-border-current {
      0%   { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    .ea-card-border {
      background: linear-gradient(
        120deg,
        rgba(139,92,246,0.9) 0%,
        rgba(232,121,249,0.9) 25%,
        rgba(251,191,102,0.55) 45%,
        rgba(139,92,246,0.9) 70%,
        rgba(232,121,249,0.9) 100%
      );
      background-size: 220% 220%;
      animation: ea-border-current 8s linear infinite;
    }

    @keyframes ea-card-rise {
      0%   {
        opacity: 0;
        transform: perspective(1000px) translateY(46px) rotateX(10deg) scale(0.92);
        filter: blur(6px);
      }
      60% {
        opacity: 1;
        filter: blur(0px);
      }
      100% {
        opacity: 1;
        transform: perspective(1000px) translateY(0) rotateX(0deg) scale(1);
        filter: blur(0px);
      }
    }
    .ea-card-rise {
      animation: ea-card-rise 0.85s cubic-bezier(0.16,1,0.3,1) both;
      transform-style: preserve-3d;
      will-change: transform;
    }

    /* cursor-reactive tilt, layered on a wrapping element so it doesn't fight
       the entrance animation's own transform */
    .ea-card-tilt {
      transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
      transform: perspective(1000px)
        rotateX(var(--tiltY, 0deg))
        rotateY(var(--tiltX, 0deg))
        translateZ(0);
    }
    .ea-card-tilt.is-hovering {
      transition: transform 0.1s linear;
    }

    /* ambient glow that breathes behind the card at rest, and blooms on hover/focus */
    @keyframes ea-card-glow-breathe {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50%      { opacity: 0.85; transform: scale(1.04); }
    }
    .ea-card-glow {
      position: absolute;
      inset: -18px;
      border-radius: 30px;
      background: radial-gradient(
        60% 60% at 50% 30%,
        rgba(139,92,246,0.45),
        rgba(232,121,249,0.25) 55%,
        transparent 80%
      );
      filter: blur(22px);
      z-index: -1;
      animation: ea-card-glow-breathe 4.5s ease-in-out infinite;
      transition: opacity 0.35s ease, filter 0.35s ease;
      pointer-events: none;
    }
    .ea-card-glow.is-active {
      opacity: 1 !important;
      filter: blur(30px);
    }

    /* the light-current border sweeps faster while the card is hovered/focused */
    .ea-card-border.is-active {
      animation-duration: 3.2s;
    }

    @keyframes ea-stagger-up {
      0%   { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .ea-stagger { animation: ea-stagger-up 0.55s cubic-bezier(0.16,1,0.3,1) both; }

    @keyframes ea-shake {
      0%, 100% { transform: translateX(0); }
      20%      { transform: translateX(-7px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(3px); }
    }
    .ea-shake { animation: ea-shake 0.5s ease-in-out; }

    /* ---- inputs ---- */

    .ea-field {
      position: relative;
      border-radius: 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.10);
      transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    }
    .ea-field:hover {
      border-color: rgba(255,255,255,0.18);
    }
    .ea-field.is-focused {
      border-color: rgba(167,139,250,0.75);
      background: rgba(139,92,246,0.06);
      box-shadow: 0 0 0 4px rgba(139,92,246,0.14), 0 0 24px -6px rgba(232,121,249,0.35);
    }
    .ea-field.has-error {
      border-color: rgba(248,113,113,0.7);
      box-shadow: 0 0 0 4px rgba(248,113,113,0.12);
    }
    .ea-field-label {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      transform-origin: left center;
      transition: transform 0.2s ease, color 0.2s ease, top 0.2s ease;
      color: var(--mist-dim);
      letter-spacing: 0.01em;
    }
    .ea-field-label.is-floated {
      top: 10px;
      transform: translateY(0) scale(0.76);
      color: var(--violet-soft);
    }
    .ea-field input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: #F5F3FF;
      padding: 26px 44px 10px 16px;
      font-size: 15px;
    }
    .ea-field input:not(:placeholder-shown) ~ .ea-field-label,
    .ea-field.is-focused .ea-field-label {
      top: 10px;
      transform: translateY(0) scale(0.76);
      color: var(--violet-soft);
    }

    .ea-eye-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--mist-dim);
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .ea-eye-btn:hover { color: var(--violet-soft); transform: translateY(-50%) scale(1.08); }

    /* ---- button ---- */

    .ea-submit {
      position: relative;
      overflow: hidden;
      isolation: isolate;
      background: linear-gradient(135deg, #8B5CF6, #D946EF);
      transition: transform 0.18s ease, box-shadow 0.25s ease, filter 0.2s ease;
      box-shadow: 0 10px 30px -10px rgba(217,70,239,0.55);
    }
    .ea-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 14px 36px -8px rgba(217,70,239,0.7);
      filter: brightness(1.05);
    }
    .ea-submit:active:not(:disabled) { transform: translateY(0px) scale(0.99); }
    .ea-submit:disabled { opacity: 0.75; cursor: not-allowed; }

    .ea-submit::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        100deg,
        transparent 20%,
        rgba(255,255,255,0.35) 45%,
        transparent 70%
      );
      transform: translateX(-120%);
      z-index: 1;
    }
    .ea-submit:hover:not(:disabled)::before {
      transform: translateX(120%);
      transition: transform 0.85s ease;
    }

    @keyframes ea-spinner { to { transform: rotate(360deg); } }
    .ea-spinner { animation: ea-spinner 0.8s linear infinite; }

    /* ---- fireflies (fallback CSS particles, canvas handles the rest) ---- */

    @keyframes ea-drift-up {
      0%   { transform: translate3d(0, 0, 0); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translate3d(var(--dx, 20px), -120vh, 0); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .ea-root * {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
      }
    }
  `}</style>
);

/* -------------------------------------------------------------------------- */
/*  Aurora + starfield backdrop                                                */
/* -------------------------------------------------------------------------- */

function StarField({ count = 60 }) {
  const stars = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.6 + 0.6,
      dur: 3 + Math.random() * 5,
      delay: Math.random() * 5,
      max: 0.4 + Math.random() * 0.6,
    }))
  ).current;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="ea-star absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            "--tw-dur": `${s.dur}s`,
            "--tw-delay": `${s.delay}s`,
            "--tw-max": s.max,
            "--tw-min": 0.1,
          }}
        />
      ))}
    </div>
  );
}

function AuroraBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#0B0620" }}>
      <div
        className="ea-aurora-a absolute -left-1/4 -top-1/4 h-[70vh] w-[70vh] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.55), transparent 65%)" }}
      />
      <div
        className="ea-aurora-b absolute -right-1/4 top-0 h-[65vh] w-[65vh] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(232,121,249,0.45), transparent 65%)" }}
      />
      <div
        className="ea-aurora-c absolute bottom-[-20%] left-1/3 h-[70vh] w-[70vh] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(251,191,102,0.22), transparent 65%)" }}
      />
      <StarField />
      {/* soft vignette so the card reads clearly against the scene */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, transparent 40%, rgba(11,6,32,0.55) 100%)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Firefly canvas — upward-drifting motes of light                            */
/* -------------------------------------------------------------------------- */

function FireflyCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, dpr;
    let motes = [];

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (initial = false) => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + Math.random() * 40,
      r: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 0.35 + 0.12,
      drift: (Math.random() - 0.5) * 0.4,
      hue: Math.random() > 0.5 ? "179,148,255" : "232,163,249",
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.015 + Math.random() * 0.02,
    });

    const init = () => {
      resize();
      const count = width < 480 ? 18 : 34;
      motes = Array.from({ length: count }, () => spawn(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const m of motes) {
        m.y -= m.speed;
        m.x += m.drift;
        m.twinklePhase += m.twinkleSpeed;
        const alpha = 0.35 + Math.abs(Math.sin(m.twinklePhase)) * 0.55;

        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 6);
        glow.addColorStop(0, `rgba(${m.hue}, ${alpha})`);
        glow.addColorStop(1, `rgba(${m.hue}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();

        if (m.y < -20) Object.assign(m, spawn(false));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    init();
    if (!prefersReduced) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // draw a single static frame for reduced-motion users
      tick();
      cancelAnimationFrame(rafRef.current);
    }

    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Sigil — the academy crest, rotating behind the wordmark                    */
/* -------------------------------------------------------------------------- */

function Sigil({ size = 96 }) {
  const c = size / 2;
  return (
    <div className="ea-sigil-glow relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="ea-sigil-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#E879F9" />
          </linearGradient>
        </defs>

        <g className="ea-ring-outer" style={{ transformOrigin: "center" }}>
          <circle
            cx={c} cy={c} r={c - 3}
            fill="none" stroke="url(#ea-sigil-grad)" strokeWidth="1"
            strokeDasharray="2 6" opacity="0.7"
          />
        </g>

        <g className="ea-ring-mid" style={{ transformOrigin: "center" }}>
          <circle
            cx={c} cy={c} r={c - 16}
            fill="none" stroke="url(#ea-sigil-grad)" strokeWidth="1.2"
            opacity="0.55"
          />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const rr = c - 16;
            return (
              <circle
                key={deg}
                cx={c + rr * Math.cos(rad)}
                cy={c + rr * Math.sin(rad)}
                r="1.6"
                fill="#FBBF66"
              />
            );
          })}
        </g>

        <g className="ea-ring-inner" style={{ transformOrigin: "center" }}>
          <polygon
            points={[0, 1, 2].flatMap((k) => {
              const rad = (k * 120 - 90) * (Math.PI / 180);
              const rr = c - 30;
              return [`${c + rr * Math.cos(rad)},${c + rr * Math.sin(rad)}`];
            }).join(" ")}
            fill="none"
            stroke="url(#ea-sigil-grad)"
            strokeWidth="1.4"
            strokeLinejoin="round"
            opacity="0.85"
          />
        </g>
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #D946EF)",
            boxShadow: "0 8px 24px -6px rgba(217,70,239,0.6)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3l8 4-8 4-8-4 8-4z"
              stroke="white" strokeWidth="1.6"
              strokeLinejoin="round" fill="rgba(255,255,255,0.15)"
            />
            <path
              d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"
              stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"
            />
            <path d="M20 9v6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Custom field — floating label, focus glow, optional reveal toggle          */
/* -------------------------------------------------------------------------- */

function EaField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  delay = 0,
  reveal,
  onToggleReveal,
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="ea-stagger" style={{ animationDelay: `${delay}ms` }}>
      <div
        className={[
          "ea-field",
          focused ? "is-focused" : "",
          error ? "has-error" : "",
        ].join(" ")}
      >
        <input
          id={id}
          type={reveal !== undefined ? (reveal ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          placeholder=" "
        />
        <label htmlFor={id} className={`ea-field-label ${floated ? "is-floated" : ""}`}>
          {label}
        </label>
        {reveal !== undefined && (
          <button
            type="button"
            className="ea-eye-btn"
            onClick={onToggleReveal}
            tabIndex={-1}
            aria-label={reveal ? "Hide password" : "Show password"}
          >
            {reveal ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path
                  d="M10.6 6.2A9.5 9.5 0 0112 6c5 0 8.5 3.5 10 6-0.6 1.1-1.5 2.3-2.7 3.4M6.5 7.9C4.7 9.1 3.3 10.7 2 12c1.5 2.5 5 6 10 6 1 0 1.9-.14 2.8-.4"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"
                />
                <path
                  d="M9.9 9.9a3 3 0 104.2 4.2"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 12c1.5-2.5 5-6 10-6s8.5 3.5 10 6c-1.5 2.5-5 6-10 6s-8.5-3.5-10-6z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"
                />
                <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 pl-1 text-xs font-medium text-rose-300">{error}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Submit button — shine sweep + inline spinner                               */
/* -------------------------------------------------------------------------- */

function EaSubmit({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="ea-submit relative flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white"
    >
      <span className="relative z-10 flex items-center gap-2">
        {loading && (
          <svg className="ea-spinner h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12" cy="12" r="9"
              stroke="rgba(255,255,255,0.3)" strokeWidth="3"
            />
            <path
              d="M21 12a9 9 0 00-9-9"
              stroke="white" strokeWidth="3" strokeLinecap="round"
            />
          </svg>
        )}
        {children}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [cardActive, setCardActive] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, hovering: false });
  const cardWrapRef = useRef(null);

  const handleCardMouseMove = (e) => {
    const el = cardWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0 -> 1
    const py = (e.clientY - rect.top) / rect.height; // 0 -> 1
    const maxTilt = 5; // degrees, kept subtle
    setTilt({
      x: (px - 0.5) * maxTilt * 2,
      y: (0.5 - py) * maxTilt * 2,
      hovering: true,
    });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0, hovering: false });
    setCardActive(false);
  };

  const validate = useCallback(() => {
    const errs = {};
    if (!email.trim()) errs.email = "Enter your email to continue.";
    if (!password) errs.password = "Enter your password to continue.";
    return errs;
  }, [email, password]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const submit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      triggerShake();
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ea-root relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <GlobalStyle />
      <AuroraBackdrop />
      <FireflyCanvas />

      <div className="relative w-full max-w-sm">
        {/* Wordmark + sigil */}
        <Link
          to="/"
          className="ea-stagger mb-7 flex flex-col items-center gap-3 text-center"
          style={{ animationDelay: "0ms" }}
        >
          <Sigil size={92} />
          <span className="ea-display text-[26px] font-semibold tracking-wide text-white">
            Elysium{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(90deg,#C4B5FD,#F0ABFC,#FDE7C4)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Academy
            </span>
          </span>
        </Link>

        {/* Card */}
        <div
          ref={cardWrapRef}
          className={`ea-card-tilt relative ${tilt.hovering ? "is-hovering" : ""}`}
          style={{ "--tiltX": `${tilt.x}deg`, "--tiltY": `${tilt.y}deg` }}
          onMouseMove={handleCardMouseMove}
          onMouseEnter={() => setCardActive(true)}
          onMouseLeave={handleCardMouseLeave}
          onFocus={() => setCardActive(true)}
          onBlur={handleCardMouseLeave}
        >
          <div className={`ea-card-glow ${cardActive ? "is-active" : ""}`} aria-hidden="true" />
          <div
            className={`ea-card-border ea-card-rise rounded-[22px] p-[1.5px] ${shake ? "ea-shake" : ""} ${cardActive ? "is-active" : ""}`}
            style={{ animationDelay: "80ms" }}
          >
            <form
              onSubmit={submit}
              noValidate
              className="rounded-[20px] p-7"
              style={{
                background: "rgba(27,15,61,0.82)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
            <div className="ea-stagger" style={{ animationDelay: "140ms" }}>
              <h1 className="ea-display text-2xl font-semibold text-white">
                Admin Login
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--mist-dim)" }}>
                Sign in to manage the website.
              </p>
            </div>

            <div className="mt-7 space-y-4">
              <EaField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                error={fieldErrors.email}
                delay={200}
              />
              <EaField
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                error={fieldErrors.password}
                delay={260}
                reveal={showPassword}
                onToggleReveal={() => setShowPassword((v) => !v)}
              />
            </div>

            <div className="ea-stagger mt-7" style={{ animationDelay: "320ms" }}>
              <EaSubmit loading={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </EaSubmit>
            </div>

            <div className="ea-stagger" style={{ animationDelay: "380ms" }}>
              <Link
                to="/"
                className="mt-5 flex items-center justify-center gap-1.5 text-sm text-white/45 transition-colors hover:text-fuchsia-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 12H5M11 18l-6-6 6-6"
                    stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                Back to website
              </Link>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}