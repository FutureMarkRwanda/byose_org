import { useEffect, useState, useRef } from "react";

// ─── Links — swap when ready ──────────────────────────────────────────────────
const LINKS = {
    playStore: "https://play.google.com/store/apps/details?id=info.byose.presenceeye",
    appStore:  "https://apps.apple.com/us/app/presence-eye/id6758922721",
};

const BRAND_LOGO = "https://res.cloudinary.com/ddsojj7zo/image/upload/v1773043990/presence_eye_blue_icon2_xxtg1z.png";

// ─── Placeholder app screen images (replace with real screenshots) ─────────────
// Using gradient placeholders that mimic app screens — swap src with real images
const APP_SCREENS = [
    {
        label: "Dashboard",
        gradient: "linear-gradient(160deg, #0E1E3A 0%, #142D5C 100%)",
        accent: "#497EE7",
    },
    {
        label: "Attendance",
        gradient: "linear-gradient(160deg, #0D2218 0%, #0F3D28 100%)",
        accent: "#3DDC84",
    },
    {
        label: "Reports",
        gradient: "linear-gradient(160deg, #1A1408 0%, #2E2310 100%)",
        accent: "#C9A84C",
    },
    {
        label: "Team View",
        gradient: "linear-gradient(160deg, #160E2E 0%, #271852 100%)",
        accent: "#9B7FE8",
    },
];

function detectOS() {
    if (typeof navigator === "undefined") return "desktop";
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua))             return "android";
    if (/iphone|ipad|ipod/i.test(ua))   return "ios";
    return "desktop";
}

const cls = (...a) => a.filter(Boolean).join(" ");

// ─── Keyframe injection ───────────────────────────────────────────────────────
const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    .pe-fade-up {
        opacity: 0;
        transform: translateY(28px);
        animation: peRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes peRise {
        to { opacity: 1; transform: translateY(0); }
    }
    .pe-delay-1 { animation-delay: 0.1s; }
    .pe-delay-2 { animation-delay: 0.25s; }
    .pe-delay-3 { animation-delay: 0.4s; }
    .pe-delay-4 { animation-delay: 0.55s; }
    .pe-delay-5 { animation-delay: 0.7s; }
    .pe-delay-6 { animation-delay: 0.85s; }

    .pe-float {
        animation: peFloat 6s ease-in-out infinite;
    }
    @keyframes peFloat {
        0%, 100% { transform: translateY(0px) rotate(-2deg); }
        50%       { transform: translateY(-12px) rotate(-2deg); }
    }
    .pe-float-2 {
        animation: peFloat2 7s ease-in-out infinite;
        animation-delay: 1s;
    }
    @keyframes peFloat2 {
        0%, 100% { transform: translateY(0px) rotate(2deg); }
        50%       { transform: translateY(-8px) rotate(2deg); }
    }
    .pe-float-3 {
        animation: peFloat3 8s ease-in-out infinite;
        animation-delay: 0.5s;
    }
    @keyframes peFloat3 {
        0%, 100% { transform: translateY(0px) rotate(-1deg); }
        50%       { transform: translateY(-14px) rotate(-1deg); }
    }

    .pe-card:hover .pe-card-shine {
        opacity: 1;
    }
    .pe-card-shine {
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
    }

    .pe-grain::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
        border-radius: inherit;
        pointer-events: none;
        mix-blend-mode: overlay;
    }

    .pe-screen-glow {
        box-shadow:
            0 0 0 1px rgba(201,168,76,0.15),
            0 32px 80px rgba(0,0,0,0.5),
            0 8px 24px rgba(0,0,0,0.3);
    }

    .pe-btn-gold {
        position: relative;
        overflow: hidden;
        transition: all 0.25s ease;
    }
    .pe-btn-gold::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.25s ease;
    }
    .pe-btn-gold:hover::before { opacity: 1; }
    .pe-btn-gold:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(201,168,76,0.35); }

    .pe-platform-card {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .pe-platform-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(201,168,76,0.08);
    }

    .pe-hairline {
        background: linear-gradient(90deg, transparent 0%, #C9A84C 30%, #E8C96B 50%, #C9A84C 70%, transparent 100%);
    }

    .pe-star {
        position: absolute;
        width: 2px; height: 2px;
        background: white;
        border-radius: 50%;
        animation: peTwinkle var(--dur, 3s) ease-in-out infinite;
        animation-delay: var(--delay, 0s);
    }
    @keyframes peTwinkle {
        0%, 100% { opacity: 0.1; transform: scale(1); }
        50%       { opacity: 0.8; transform: scale(1.5); }
    }
`;

export default function DownloadPage() {
    const [os,          setOs]          = useState(null);
    const [redirecting, setRedirecting] = useState(false);
    const [countdown,   setCountdown]   = useState(3);
    const [logoError,   setLogoError]   = useState(false);
    const [activeScreen, setActiveScreen] = useState(1);

    useEffect(() => {
        const detected = detectOS();
        setOs(detected);

        if (detected === "android" || detected === "ios") {
            setRedirecting(true);
            const target = detected === "android" ? LINKS.playStore : LINKS.appStore;
            let c = 3;
            const tick = setInterval(() => { c--; setCountdown(c); if (c <= 0) clearInterval(tick); }, 1000);
            setTimeout(() => { window.location.href = target; }, 100);
            return () => clearInterval(tick);
        }
    }, []);

    // Auto-cycle screens
    useEffect(() => {
        const t = setInterval(() => setActiveScreen(s => (s + 1) % APP_SCREENS.length), 3500);
        return () => clearInterval(t);
    }, []);

    if (os === null) return <>{injectStyles()}<RedirectShell><Detecting /></RedirectShell></>;

    if (redirecting) {
        const isAndroid = os === "android";
        const storeName = isAndroid ? "Google Play" : "App Store";
        return (
            <>
                {injectStyles()}
                <RedirectShell>
                    <div className="flex flex-col items-center gap-10 text-center px-6">
                        <LogoMark error={logoError} setError={setLogoError} />

                        <div className="space-y-3 pe-fade-up pe-delay-2">
                            <p style={{ fontFamily: "'DM Sans', sans-serif" }}
                               className="text-[10px] tracking-[0.35em] uppercase text-[#C9A84C] font-semibold">
                                Redirecting you now
                            </p>
                            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                                className="text-5xl font-bold text-white leading-tight">
                                Opening {storeName}
                            </h1>
                            <p style={{ fontFamily: "'DM Sans', sans-serif" }}
                               className="text-slate-400 text-base max-w-xs mx-auto leading-relaxed font-light">
                                Taking you directly to the store. If nothing happens, use the button below.
                            </p>
                        </div>

                        {/* Gold ring countdown */}
                        <div className="relative w-24 h-24 pe-fade-up pe-delay-3">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="3"/>
                                <circle cx="48" cy="48" r="40" fill="none" stroke="#C9A84C" strokeWidth="3"
                                    strokeDasharray="251.3"
                                    strokeDashoffset={251.3 * (countdown / 3)}
                                    strokeLinecap="round"
                                    style={{ transition: "stroke-dashoffset 1s linear" }}/>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {isAndroid
                                    ? <AndroidIcon className="w-9 h-9" color="#3DDC84" />
                                    : <AppleIcon   className="w-9 h-9" color="#d0d0d0" />}
                            </div>
                        </div>

                        <a href={isAndroid ? LINKS.playStore : LINKS.appStore}
                           className="pe-btn-gold pe-fade-up pe-delay-4 inline-flex items-center gap-3
                                      px-9 py-4 rounded-xl text-sm font-semibold tracking-wide
                                      border border-[#C9A84C]/50 text-[#C9A84C]"
                           style={{ fontFamily: "'DM Sans', sans-serif", background: "rgba(201,168,76,0.06)" }}>
                            {isAndroid
                                ? <AndroidIcon className="w-5 h-5" color="#3DDC84" />
                                : <AppleIcon   className="w-5 h-5" color="#d0d0d0" />}
                            Open {storeName} manually
                        </a>
                    </div>
                </RedirectShell>
            </>
        );
    }

    // ── Desktop full page ─────────────────────────────────────────────────────
    return (
        <>
            {injectStyles()}
            <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen w-full">

                {/* ═══ HERO — dark navy, full viewport ═══ */}
                <section className="relative min-h-screen flex flex-col overflow-hidden pe-grain"
                         style={{ background: "linear-gradient(160deg, #0D1B2A 0%, #0F2340 55%, #0A1628 100%)" }}>

                    {/* Stars */}
                    <Stars />

                    {/* Ambient glows */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-20"
                             style={{ background: "radial-gradient(ellipse, #497EE7 0%, transparent 65%)" }} />
                        <div className="absolute bottom-[-100px] right-[-80px] w-[500px] h-[500px] opacity-15"
                             style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 65%)" }} />
                        <div className="absolute bottom-[-80px] left-[-60px] w-[400px] h-[400px] opacity-10"
                             style={{ background: "radial-gradient(circle, #497EE7 0%, transparent 65%)" }} />
                    </div>

                    {/* Gold top hairline */}
                    <div className="pe-hairline absolute top-0 left-0 right-0 h-px" />

                    {/* Nav */}
                    <nav className="relative z-10 flex items-center justify-between px-8 md:px-16 pt-8 pe-fade-up pe-delay-1">
                        <LogoMark error={logoError} setError={setLogoError} />
                        <a href="https://presence-eye.byose.info"
                           style={{ fontFamily: "'DM Sans', sans-serif" }}
                           className="text-[12px] tracking-[0.2em] uppercase font-semibold
                                      text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors duration-200">
                            Web App →
                        </a>
                    </nav>

                    {/* Hero content */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center
                                    text-center px-6 pt-16 pb-24 gap-8">

                        <div className="pe-fade-up pe-delay-1">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                                             border border-[#C9A84C]/25 bg-[#C9A84C]/6 text-[#C9A84C]
                                             text-[10px] font-semibold tracking-[0.25em] uppercase">
                                <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-pulse" />
                                <b className={`text-[#C9A84C]`}>Now Available on Mobile</b>
                            </span>
                        </div>

                        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                            className="pe-fade-up pe-delay-2 text-6xl md:text-7xl lg:text-8xl font-bold
                                       text-white leading-[1.0] tracking-tight max-w-4xl">
                            Presence,
                            <br />
                            <em style={{ fontStyle: "italic", color: "#C9A84C" }}>perfected.</em>
                        </h1>

                        <p className="pe-fade-up pe-delay-3 text-slate-400 text-lg md:text-xl max-w-xl
                                      leading-relaxed font-light">
                            Intelligent attendance and presence management for teams that operate at the highest level.
                        </p>

                        {/* CTA row */}
                        <div className="pe-fade-up pe-delay-4 flex flex-col sm:flex-row gap-4 items-center">
                            <a href={LINKS.playStore} target="_blank" rel="noopener noreferrer"
                               className="pe-btn-gold inline-flex items-center gap-3 px-8 py-4 rounded-xl
                                          text-[#0D1B2A] font-semibold text-sm tracking-wide"
                               style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E8C96B 50%, #C9A84C 100%)",
                                        boxShadow: "0 4px 24px rgba(201,168,76,0.30)" }}>
                                <AndroidIcon className="w-5 h-5" color="#0D1B2A" />
                                Google Play
                            </a>
                            <a href={LINKS.appStore} target="_blank" rel="noopener noreferrer"
                               className="pe-btn-gold inline-flex items-center gap-3 px-8 py-4 rounded-xl
                                          text-[#C9A84C] font-semibold text-sm tracking-wide border border-[#C9A84C]/35"
                               style={{ background: "rgba(201,168,76,0.06)" }}>
                                <AppleIcon className="w-5 h-5" color="#C9A84C" />
                                App Store
                            </a>
                        </div>

                        {/* App screens — floating 3D perspective */}
                        <div className="pe-fade-up pe-delay-5 relative w-full max-w-3xl mx-auto mt-8"
                             style={{ perspective: "1200px", height: "360px" }}>

                            {/* Screen left — tilted away */}
                            <div className="pe-float absolute left-[2%] top-[10%] w-[28%]"
                                 style={{ transform: "rotateY(22deg) rotateX(4deg) rotate(-2deg)",
                                          transformOrigin: "center center",
                                          zIndex: 1 }}>
                                <AppScreen screen={APP_SCREENS[0]} dim />
                            </div>

                            {/* Screen center — front and center */}
                            <div className="pe-float-3 absolute left-[50%] top-0 w-[34%]"
                                 style={{ transform: "translateX(-50%) rotateX(3deg)",
                                          transformOrigin: "center center",
                                          zIndex: 3 }}>
                                <AppScreen screen={APP_SCREENS[activeScreen]} hero />
                            </div>

                            {/* Screen right — tilted away */}
                            <div className="pe-float-2 absolute right-[2%] top-[10%] w-[28%]"
                                 style={{ transform: "rotateY(-22deg) rotateX(4deg) rotate(2deg)",
                                          transformOrigin: "center center",
                                          zIndex: 1 }}>
                                <AppScreen screen={APP_SCREENS[(activeScreen + 2) % APP_SCREENS.length]} dim />
                            </div>

                        </div>

                        {/* Screen dots */}
                        <div className="flex gap-2 items-center -mt-2 pe-fade-up pe-delay-6">
                            {APP_SCREENS.map((_, i) => (
                                <button key={i} onClick={() => setActiveScreen(i)}
                                        className="transition-all duration-300 rounded-full"
                                        style={{
                                            width:  activeScreen === i ? "24px" : "6px",
                                            height: "6px",
                                            background: activeScreen === i ? "#C9A84C" : "rgba(201,168,76,0.25)"
                                        }} />
                            ))}
                        </div>
                    </div>

                    {/* Gold divider — transition to white */}
                    <div className="pe-hairline absolute bottom-0 left-0 right-0 h-[2px]" />
                </section>

                {/* ═══ LIGHT SECTION — platform cards + features ═══ */}
                <section className="relative bg-white px-6 py-24 overflow-hidden">

                    {/* Subtle warm tint overlay */}
                    <div className="pointer-events-none absolute inset-0"
                         style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%)" }} />

                    <div className="relative max-w-4xl mx-auto flex flex-col items-center gap-20">

                        {/* Section header */}
                        <div className="text-center space-y-4">
                            <p className="text-[10px] tracking-[0.35em] uppercase font-semibold"
                               style={{ color: "#C9A84C" }}>
                                Available Platforms
                            </p>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif",
                                         color: "#0E1E3A", fontSize: "clamp(2rem, 4vw, 3rem)",
                                         fontWeight: 700, lineHeight: 1.2 }}>
                                Your platform. Your choice.
                            </h2>
                            <div className="w-10 h-px mx-auto"
                                 style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
                        </div>

                        {/* Platform cards — light mode */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">

                            <LightPlatformCard
                                icon={<AndroidIcon className="w-8 h-8" color="#3DDC84" />}
                                iconBg="#3DDC84"
                                label="Android"
                                sub="Google Play Store"
                                available
                                href={LINKS.playStore}
                                cta="Download on Play Store"
                                detail="Android 8.0 and above"
                            />
                            <LightPlatformCard
                                icon={<AppleIcon className="w-8 h-8" color="#1C1C1E" />}
                                iconBg="#888"
                                label="iPhone & iPad"
                                sub="Apple App Store"
                                available
                                href={LINKS.appStore}
                                cta="Download on App Store"
                                detail="iOS 15.0 and above"
                            />
                            <LightPlatformCard
                                icon={<DesktopIcon className="w-8 h-8" color="#C9A84C" />}
                                iconBg="#C9A84C"
                                label="Desktop"
                                sub="Windows & macOS"
                                available={false}
                                cta="Notify me when ready"
                                detail="Coming in a future release"
                                onComingSoonClick={() => {
                                    window.location.href = "mailto:rw.byose@gmail.com?subject=Presence Eye Desktop — Notify Me";
                                }}
                            />
                        </div>

                        {/* Feature strip */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl overflow-hidden"
                             style={{ background: "#E8ECF0" }}>
                            {[
                                { icon: "📱", title: "Remote Device Control",    body: "Control and interact with your devices directly from your smartphone, wherever you are." },
                                { icon: "✦", title: "Quick & Easy Setup",   body: "Connect your devices in seconds and start controlling them without complicated steps." },
                                { icon: "🏠", title: "Smart Home Monitoring",   body: "Stay aware of your devices and manage them anytime to keep your home running smoothly." },
                            ].map((f, i) => (
                                <div key={i} className="bg-white px-8 py-8 space-y-3">
                                    <span className="text-xl" style={{ color: "#C9A84C" }}>{f.icon}</span>
                                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif",
                                                fontSize: "1.15rem", fontWeight: 700, color: "#0E1E3A" }}>
                                        {f.title}
                                    </p>
                                    <p className="text-sm leading-relaxed font-light" style={{ color: "#6B7F90" }}>
                                        {f.body}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Web fallback */}
                        <div className="w-full flex flex-col sm:flex-row items-center gap-6 px-8 py-7 rounded-2xl"
                             style={{ background: "#F8F5EF", border: "1px solid rgba(201,168,76,0.2)" }}>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                 style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}>
                                <GlobeIcon className="w-5 h-5" color="#C9A84C" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif",
                                            fontSize: "1.1rem", fontWeight: 700, color: "#0E1E3A", marginBottom: "2px" }}>
                                    Prefer to stay in your browser?
                                </p>
                                <p className="text-sm font-light" style={{ color: "#6B7F90" }}>
                                    The full Presence Eye experience is available on desktop without any download.
                                </p>
                            </div>
                            <a href="https://presence-eye.byose.info"
                               className="flex-shrink-0 text-[13px] font-semibold tracking-wide transition-colors"
                               style={{ color: "#C9A84C" }}
                               onMouseEnter={e => e.target.style.color = "#E8C96B"}
                               onMouseLeave={e => e.target.style.color = "#C9A84C"}>
                                Open web app →
                            </a>
                        </div>

                    </div>
                </section>

                {/* ═══ DARK FOOTER ═══ */}
                <footer className="relative py-12 px-8 text-center pe-grain"
                        style={{ background: "#0A1322", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
                    <div className="pe-hairline absolute top-0 left-0 right-0 h-px" />
                    <p className="text-[11px] tracking-[0.2em] uppercase font-light" style={{ color: "#4A5E70" }}>
                        Presence Eye is a product of{" "}
                        <a href="https://byose.info"
                           className="transition-colors"
                           style={{ color: "#C9A84C", opacity: 0.7, textDecoration: "none" }}
                           onMouseEnter={e => e.target.style.opacity = "1"}
                           onMouseLeave={e => e.target.style.opacity = "0.7"}>
                            BYOSE Tech
                        </a>
                    </p>
                </footer>

            </div>
        </>
    );
}

// ─── App Screen mockup ────────────────────────────────────────────────────────
function AppScreen({ screen, hero = false, dim = false }) {
    return (
        <div className={cls("pe-screen-glow rounded-2xl overflow-hidden relative",
                            hero ? "ring-1 ring-[#C9A84C]/30" : "")}
             style={{ aspectRatio: "9/19.5",
                      background: screen.gradient,
                      opacity: dim ? 0.55 : 1,
                      transition: "all 0.6s ease" }}>

            {/* Mock status bar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-[8px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>9:41</span>
                <div className="flex gap-1 items-center">
                    {[3,2,1].map(b => (
                        <div key={b} className="rounded-sm"
                             style={{ width: "3px", height: `${b * 3 + 2}px`, background: `rgba(255,255,255,${b * 0.25})` }} />
                    ))}
                    <div className="w-3 h-1.5 rounded-sm ml-1" style={{ background: "rgba(255,255,255,0.4)" }} />
                </div>
            </div>

            {/* Mock screen content */}
            <div className="px-4 pt-2 space-y-3">
                {/* Header bar */}
                <div className="h-2.5 w-16 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />

                {/* Big stat card */}
                <div className="rounded-xl p-3 mt-1"
                     style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="h-1.5 w-10 rounded-full mb-2" style={{ background: screen.accent, opacity: 0.6 }} />
                    <div className="h-5 w-12 rounded-md" style={{ background: "rgba(255,255,255,0.25)" }} />
                    <div className="h-1 w-14 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.1)" }} />
                </div>

                {/* List rows */}
                {[0.9, 0.7, 0.5].map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex-shrink-0"
                             style={{ background: screen.accent, opacity: o * 0.4 }} />
                        <div className="flex-1 space-y-1">
                            <div className="h-1.5 rounded-full" style={{ background: `rgba(255,255,255,${o * 0.2})`, width: `${60 + i * 15}%` }} />
                            <div className="h-1 rounded-full"   style={{ background: `rgba(255,255,255,${o * 0.1})`, width: `${40 + i * 10}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Gold label on hero */}
            {hero && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <span className="px-3 py-1 rounded-full text-[8px] font-semibold tracking-widest uppercase"
                          style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C",
                                   border: "1px solid rgba(201,168,76,0.3)" }}>
                        {screen.label}
                    </span>
                </div>
            )}
        </div>
    );
}

// ─── Light platform card ──────────────────────────────────────────────────────
function LightPlatformCard({ icon, iconBg, label, sub, available, href, cta, detail, onComingSoonClick }) {
    const inner = (
        <div className={cls(
            "pe-platform-card group relative h-full flex flex-col gap-6 p-7 rounded-2xl border",
            available
                ? "bg-white border-[#E8ECF0] cursor-pointer"
                : "bg-[#FAFAFA] border-[#F0F0F0] cursor-default"
        )}>
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                 style={{ background: available ? `${iconBg}12` : "#F5F5F5" }}>
                {icon}
            </div>

            {/* Text */}
            <div className="flex-1 space-y-1">
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "1.25rem", fontWeight: 700,
                            color: available ? "#0E1E3A" : "#B0B8C0" }}>
                    {label}
                </p>
                <p className="text-[13px] font-light" style={{ color: available ? "#6B7F90" : "#C0C8D0" }}>
                    {sub}
                </p>
            </div>

            {/* Detail */}
            <p className="text-[11px] tracking-wide font-light"
               style={{ color: available ? "#A8B4BC" : "#CDD4D8" }}>
                {detail}
            </p>

            {/* CTA */}
            {available ? (
                <div className="flex items-center gap-2 text-[13px] font-semibold tracking-wide
                                transition-all duration-200 group-hover:gap-3"
                     style={{ color: "#C9A84C" }}>
                    {cta} <span>→</span>
                </div>
            ) : (
                <button onClick={onComingSoonClick}
                        className="text-left flex items-center gap-2 text-[13px] font-semibold
                                   tracking-wide transition-colors"
                        style={{ color: "rgba(201,168,76,0.45)", fontFamily: "'DM Sans', sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.color = "rgba(201,168,76,0.7)"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.45)"}>
                    {cta} →
                </button>
            )}

            {/* Gold bottom hairline on hover */}
            {available && (
                <div className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100
                                transition-opacity duration-300"
                     style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
            )}
        </div>
    );

    return available ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
           className="block h-full" style={{ textDecoration: "none" }}>
            {inner}
        </a>
    ) : <div className="h-full">{inner}</div>;
}

// ─── Stars field ─────────────────────────────────────────────────────────────
function Stars() {
    const stars = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 70,
        size: Math.random() > 0.8 ? 3 : 2,
        dur: `${3 + Math.random() * 4}s`,
        delay: `${Math.random() * 4}s`,
    }));
    return (
        <div className="pointer-events-none absolute inset-0">
            {stars.map(s => (
                <div key={s.id} className="pe-star"
                     style={{
                         left: `${s.x}%`, top: `${s.y}%`,
                         width: `${s.size}px`, height: `${s.size}px`,
                         "--dur": s.dur, "--delay": s.delay,
                     }} />
            ))}
        </div>
    );
}

// ─── Redirect shell ───────────────────────────────────────────────────────────
function RedirectShell({ children }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden pe-grain"
             style={{ background: "linear-gradient(160deg, #0D1B2A 0%, #0F2340 55%, #0A1628 100%)" }}>
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-20"
                     style={{ background: "radial-gradient(ellipse, #497EE7 0%, transparent 65%)" }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-15"
                     style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 65%)" }} />
            </div>
            <div className="pe-hairline absolute top-0 left-0 right-0 h-px" />
            <Stars />
            <div className="relative z-10">{children}</div>
        </div>
    );
}

// ─── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark({ error, setError }) {
    return (
        <div className="pe-fade-up pe-delay-1 flex items-center gap-3">
            {!error ? (
                <img src={BRAND_LOGO} alt="Presence Eye" className="h-10 w-auto object-contain"
                     onError={() => setError(true)} />
            ) : (
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif",
                               fontSize: "1.6rem", fontWeight: 700, color: "#fff", letterSpacing: "1px" }}>
                    Presence<span style={{ color: "#C9A84C" }}>Eye</span>
                    <span style={{ display: "inline-block", width: "7px", height: "7px",
                                   background: "#C9A84C", borderRadius: "50%", marginLeft: "4px",
                                   verticalAlign: "middle", position: "relative", top: "-3px" }} />
                </span>
            )}
        </div>
    );
}

// ─── Detecting ────────────────────────────────────────────────────────────────
function Detecting() {
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="w-8 h-8 rounded-full border-2 border-t-[#C9A84C] animate-spin"
                 style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#C9A84C" }} />
            <p style={{ color: "#4A5E70", fontSize: "13px", letterSpacing: "0.15em",
                        fontFamily: "'DM Sans', sans-serif" }}>
                Detecting your device…
            </p>
        </div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function AndroidIcon({ className, color = "#3DDC84" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill={color}>
            <path d="M17.523 15.341a.857.857 0 1 1 0-1.714.857.857 0 0 1 0 1.714m-11.046 0a.857.857 0 1 1 0-1.714.857.857 0 0 1 0 1.714M17.81 10.232l1.73-2.996a.36.36 0 0 0-.131-.491.36.36 0 0 0-.491.131L17.17 9.9a10.57 10.57 0 0 0-4.17-.847c-1.49 0-2.91.3-4.17.847L6.082 6.876a.36.36 0 0 0-.622.36l1.73 2.996C4.95 11.376 3.5 13.567 3.5 16h17c0-2.433-1.45-4.624-2.69-5.768"/>
        </svg>
    );
}

function AppleIcon({ className, color = "#d0d0d0" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill={color}>
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
    );
}

function DesktopIcon({ className, color = "#C9A84C" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color}
             strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
        </svg>
    );
}

function GlobeIcon({ className, color = "#C9A84C" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color}
             strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
    );
}

// ─── Style injector ───────────────────────────────────────────────────────────
function injectStyles() {
    return <style dangerouslySetInnerHTML={{ __html: STYLES }} />;
}