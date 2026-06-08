import { useState, useEffect, useCallback } from "react";
import { fetchData, returnToken, sendData } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";

// ─── Design tokens (matches BroadcastPage exactly) ────────────────────────────
// Primary   #195C51   deep teal-green
// Bg        #F4F6F5   page background
// Surface   #FFFFFF   cards / panels
// Border    #E2E8E6   subtle cool-green tint
// Text-1    #111C1A   headings
// Text-2    #4B5E5A   body copy
// Text-dim  #00000099 muted / labels
// Text-ph   #A8BEBB   placeholder

const cls = (...args) => args.filter(Boolean).join(" ");

// ─── Shared primitives ────────────────────────────────────────────────────────
const inputCls = [
    "w-full bg-white border border-[#D1DBD8] rounded-lg px-3 py-2.5",
    "text-sm text-[#111C1A] placeholder-[#A8BEBB]",
    "focus:outline-none focus:border-[#195C51] focus:ring-2 focus:ring-[#195C51]/10",
    "transition-all duration-150",
].join(" ");

const labelCls =
    "block text-[10px] tracking-[0.18em] uppercase text-[#00000099] font-semibold mb-1.5";

// ─── Badge ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function Badge({ children, color = "green" }) {
    const map = {
        green:  "bg-[#195C51]/10 text-[#195C51] border border-[#195C51]/20",
        gold:   "bg-amber-50 text-amber-700 border border-amber-200",
        teal:   "bg-teal-50 text-teal-700 border border-teal-200",
        red:    "bg-red-50 text-red-600 border border-red-200",
        slate:  "bg-slate-100 text-slate-500 border border-slate-200",
        blue:   "bg-blue-50 text-blue-600 border border-blue-200",
        purple: "bg-purple-50 text-purple-600 border border-purple-200",
    };
    return (
        <span className={cls(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase",
            map[color] || map.green
        )}>
            {children}
        </span>
    );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function Spinner({ size = "sm" }) {
    const s = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
        <span className={cls(s, "inline-block rounded-full animate-spin border-2 border-[#195C51]/20 border-t-[#195C51]")} />
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function StatCard({ label, value, accent = "green", sub }) {
    const border = { green: "border-[#195C51]/20", gold: "border-amber-200", red: "border-red-200", slate: "border-slate-200", blue: "border-blue-200" };
    const num    = { green: "text-[#195C51]",       gold: "text-amber-600",   red: "text-red-500",   slate: "text-slate-500",  blue: "text-blue-600" };
    return (
        <div className={cls("bg-white rounded-xl border p-4 shadow-sm", border[accent] || border.green)}>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#00000099] mb-1">{label}</p>
            <p className={cls("text-3xl font-bold tabular-nums", num[accent] || num.green)}>{value ?? "—"}</p>
            {sub && <p className="text-[10px] text-[#A8BEBB] mt-1">{sub}</p>}
        </div>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }) {
    return <div><label className={labelCls}>{label}</label>{children}</div>;
}

// ─── SendButton ───────────────────────────────────────────────────────────────
function SendButton({ loading, onClick, label, disabled }) {
    return (
        <button onClick={onClick} disabled={loading || disabled}
            className="w-full flex items-center justify-center gap-2.5
                       bg-[#195C51] hover:bg-[#144A41] active:bg-[#0F3830]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white text-sm font-semibold tracking-wide
                       py-3 rounded-lg shadow-sm shadow-[#195C51]/20 transition-all duration-150">
            {loading ? <Spinner /> : <span className="text-sm">✦</span>}
            {loading ? "Sending…" : label}
        </button>
    );
}

// ─── PagBtn ───────────────────────────────────────────────────────────────────
function PagBtn({ label, disabled, onClick }) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={cls(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                disabled
                    ? "text-[#C5D2CF] border-[#E2E8E6] cursor-not-allowed bg-white"
                    : "text-[#195C51] border-[#195C51]/30 bg-white hover:bg-[#195C51]/5 hover:border-[#195C51]/50"
            )}>
            {label}
        </button>
    );
}

// ─── Type → badge colour mapping ──────────────────────────────────────────────
const TYPE_COLOR = {
    admin:     "gold",
    broadcast: "teal",
    general:   "green",
    alert:     "red",
    info:      "blue",
    security:  "purple",
};
const typeColor = (t) => TYPE_COLOR[t] || "slate";

const TABS = [
    { id: "compose", label: "Compose",   icon: "✦" },
    { id: "stats",   label: "Analytics", icon: "◈" },
    { id: "history", label: "History",   icon: "≡" },
];

// ═════════════════════════════════════════════════════════════════════════════
//  Root page
// ═════════════════════════════════════════════════════════════════════════════
export default function NotificationCentre() {
    const [activeTab, setActiveTab] = useState("compose");
    const [toastMsg,  setToastMsg]  = useState(null);

    const showToast = useCallback((text, type = "success") => {
        setToastMsg({ text, type });
        setTimeout(() => setToastMsg(null), 4000);
    }, []);

    return (
        <div className="min-h-screen bg-[#F4F6F5] text-[#111C1A]">

            {/* Toast */}
            {toastMsg && (
                <div className={cls(
                    "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium",
                    toastMsg.type === "success"
                        ? "bg-white border-[#195C51]/30 text-[#195C51]"
                        : "bg-white border-red-200 text-red-600"
                )}>
                    <span className={cls(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0",
                        toastMsg.type === "success" ? "bg-[#195C51]" : "bg-red-500"
                    )}>
                        {toastMsg.type === "success" ? "✓" : "✕"}
                    </span>
                    {toastMsg.text}
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Page header */}
                <div className="mb-7">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#195C51]/70 mb-1.5 font-semibold">
                        Admin · Notifications
                    </p>
                    <h1 className="text-2xl font-bold text-[#111C1A] tracking-tight leading-none mb-1">
                        Notification Centre
                    </h1>
                    <p className="text-sm text-[#00000099]">Send, broadcast, and monitor push notifications across your user base</p>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 p-1 bg-white border border-[#E2E8E6] rounded-xl w-fit mb-7 shadow-sm">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={cls(
                                "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                                activeTab === t.id
                                    ? "bg-[#195C51] text-white shadow-sm"
                                    : "text-[#00000099] hover:text-[#111C1A] hover:bg-[#F4F6F5]"
                            )}>
                            <span className="text-xs">{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === "compose" && <ComposePanel showToast={showToast} />}
                {activeTab === "stats"   && <StatsPanel   showToast={showToast} />}
                {activeTab === "history" && <HistoryPanel showToast={showToast} />}
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  Compose Panel  — four send modes as sub-tabs
// ═════════════════════════════════════════════════════════════════════════════
function ComposePanel({ showToast }) {
    const [mode, setMode] = useState("user");

    const MODES = [
        { id: "user",      label: "Single User",  badge: "USER",      badgeColor: "green"  },
        { id: "users",     label: "Multi-User",   badge: "MULTI",     badgeColor: "blue"   },
        { id: "role",      label: "By Role",      badge: "ROLE",      badgeColor: "purple" },
        { id: "broadcast", label: "Broadcast",    badge: "ALL",       badgeColor: "teal"   },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
            <div className="bg-white border border-[#E2E8E6] rounded-2xl overflow-hidden shadow-sm">
                {/* Sub-tabs */}
                <div className="border-b border-[#E2E8E6] px-6 pt-5 pb-0 flex gap-6 overflow-x-auto">
                    {MODES.map(m => (
                        <button key={m.id} onClick={() => setMode(m.id)}
                            className={cls(
                                "flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                                mode === m.id
                                    ? "border-[#195C51] text-[#195C51]"
                                    : "border-transparent text-[#00000099] hover:text-[#4B5E5A]"
                            )}>
                            {m.label}
                            <Badge color={m.badgeColor}>{m.badge}</Badge>
                        </button>
                    ))}
                </div>
                <div className="p-6">
                    {mode === "user"      && <SingleUserForm   showToast={showToast} />}
                    {mode === "users"     && <MultiUserForm    showToast={showToast} />}
                    {mode === "role"      && <RoleForm         showToast={showToast} />}
                    {mode === "broadcast" && <BroadcastForm    showToast={showToast} />}
                </div>
            </div>
            <ComposeTips mode={mode} />
        </div>
    );
}

// ─── Shared notification fields (title, body, type, data) ─────────────────────
function NotificationFields({ form, setForm }) {
    const TYPES = ["general", "admin", "alert", "info", "security", "broadcast"];
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Field label="Title *">
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. System Maintenance" className={inputCls} />
                </Field>
                <Field label="Type">
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                        className={inputCls}>
                        {TYPES.map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </select>
                </Field>
            </div>
            <Field label="Body *">
                <textarea rows={4} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                    placeholder="Notification message body…"
                    className={cls(inputCls, "resize-none")} />
                <p className="text-[11px] text-[#C5D2CF] mt-1.5 text-right">{form.body.length} chars</p>
            </Field>
            <Field label="Image URL (optional)">
                <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://…" className={inputCls} />
            </Field>
        </div>
    );
}

const emptyForm = () => ({ title: "", body: "", type: "general", imageUrl: "" });

// ─── Single User Form ─────────────────────────────────────────────────────────
function SingleUserForm({ showToast }) {
    const [form,    setForm]    = useState(emptyForm());
    const [userId,  setUserId]  = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!userId.trim())   return showToast("User ID is required", "error");
        if (!form.title.trim()) return showToast("Title is required", "error");
        if (!form.body.trim())  return showToast("Body is required",  "error");

        setLoading(true);
        const res = await sendData(
            `${presence_server}/api/admin/notifications/user`,
            { userId: userId.trim(), ...form },
            returnToken()
        );
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        showToast("Notification sent successfully");
        setUserId(""); setForm(emptyForm());
    };

    return (
        <div className="space-y-5">
            <Field label="User ID *">
                <input value={userId} onChange={e => setUserId(e.target.value)}
                    placeholder="MongoDB ObjectId of the target user"
                    className={inputCls} />
            </Field>
            <NotificationFields form={form} setForm={setForm} />
            <SendButton loading={loading} onClick={handleSend} label="Send Notification" />
        </div>
    );
}

// ─── Multi-User Form ──────────────────────────────────────────────────────────
function MultiUserForm({ showToast }) {
    const [form,     setForm]     = useState(emptyForm());
    const [rawIds,   setRawIds]   = useState("");   // comma/newline separated
    const [loading,  setLoading]  = useState(false);

    const parsedIds = rawIds
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(s => /^[a-f\d]{24}$/i.test(s));

    const handleSend = async () => {
        if (!parsedIds.length)    return showToast("Enter at least one valid User ID", "error");
        if (!form.title.trim())   return showToast("Title is required", "error");
        if (!form.body.trim())    return showToast("Body is required",  "error");

        setLoading(true);
        const res = await sendData(
            `${presence_server}/api/admin/notifications/users`,
            { userIds: parsedIds, ...form },
            returnToken()
        );
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        const { sent = 0, failed = 0 } = res.data;
        showToast(`Sent to ${sent} user${sent !== 1 ? "s" : ""} — ${failed} failed`);
        setRawIds(""); setForm(emptyForm());
    };

    return (
        <div className="space-y-5">
            <Field label={`User IDs * — comma or newline separated${parsedIds.length ? ` · ${parsedIds.length} valid` : ""}`}>
                <textarea rows={4} value={rawIds} onChange={e => setRawIds(e.target.value)}
                    placeholder={"64a1b2c3d4e5f6789012abcd\n64a1b2c3d4e5f6789012abce"}
                    className={cls(inputCls, "resize-none font-mono text-xs")} />
            </Field>
            {parsedIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {parsedIds.slice(0, 6).map(id => (
                        <span key={id} className="font-mono text-[10px] bg-[#195C51]/8 text-[#195C51]
                                                   border border-[#195C51]/20 px-2 py-0.5 rounded">
                            {id.slice(-6)}…
                        </span>
                    ))}
                    {parsedIds.length > 6 && (
                        <span className="text-[10px] text-[#A8BEBB] self-center">
                            +{parsedIds.length - 6} more
                        </span>
                    )}
                </div>
            )}
            <NotificationFields form={form} setForm={setForm} />
            <SendButton loading={loading} onClick={handleSend} label={`Send to ${parsedIds.length || "…"} Users`} />
        </div>
    );
}

// ─── Role Form ────────────────────────────────────────────────────────────────
const ROLES = ["USER", "ADMIN", "MODERATOR", "SUPPORT"];

function RoleForm({ showToast }) {
    const [form,    setForm]    = useState(emptyForm());
    const [role,    setRole]    = useState("USER");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!form.title.trim()) return showToast("Title is required", "error");
        if (!form.body.trim())  return showToast("Body is required",  "error");

        setLoading(true);
        const res = await sendData(
            `${presence_server}/api/admin/notifications/role`,
            { role, ...form },
            returnToken()
        );
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        const { sent = 0, failed = 0, total = 0 } = res.data;
        showToast(`Sent to ${sent}/${total} ${role} users — ${failed} failed`);
        setForm(emptyForm());
    };

    return (
        <div className="space-y-5">
            <Field label="Target Role *">
                <div className="grid grid-cols-4 gap-2">
                    {ROLES.map(r => (
                        <button key={r} onClick={() => setRole(r)}
                            className={cls(
                                "py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all border",
                                role === r
                                    ? "bg-[#195C51] text-white border-[#195C51] shadow-sm"
                                    : "bg-white text-[#00000099] border-[#E2E8E6] hover:border-[#195C51]/40 hover:text-[#195C51]"
                            )}>
                            {r}
                        </button>
                    ))}
                </div>
            </Field>
            <NotificationFields form={form} setForm={setForm} />
            <SendButton loading={loading} onClick={handleSend} label={`Send to All ${role}s`} />
        </div>
    );
}

// ─── Broadcast Form ───────────────────────────────────────────────────────────
function BroadcastForm({ showToast }) {
    const [form,      setForm]      = useState({ ...emptyForm(), type: "broadcast" });
    const [loading,   setLoading]   = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const handleSend = async () => {
        if (!form.title.trim()) return showToast("Title is required", "error");
        if (!form.body.trim())  return showToast("Body is required",  "error");
        if (!confirmed)        return showToast("Please confirm broadcast to all users", "error");

        setLoading(true);
        const res = await sendData(
            `${presence_server}/api/admin/notifications/broadcast`,
            form,
            returnToken()
        );
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        const { sent = 0, failed = 0, total = 0 } = res.data;
        showToast(`Broadcast complete — ${sent}/${total} delivered, ${failed} failed`);
        setForm({ ...emptyForm(), type: "broadcast" }); setConfirmed(false);
    };

    return (
        <div className="space-y-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
                <span className="text-amber-500 text-lg leading-none flex-shrink-0">⚠</span>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                    This will send a push notification to <strong>every active user</strong>.
                    Use only for platform-wide announcements.
                </p>
            </div>
            <NotificationFields form={form} setForm={setForm} />
            {/* Confirm checkbox */}
            <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => setConfirmed(p => !p)}
                    className={cls(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        confirmed ? "bg-[#195C51] border-[#195C51]" : "border-[#D1DBD8] group-hover:border-[#195C51]/50"
                    )}>
                    {confirmed && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <span className="text-sm text-[#4B5E5A]">
                    I confirm this should be sent to <span className="text-[#195C51] font-semibold">all active users</span>
                </span>
            </label>
            <SendButton loading={loading} onClick={handleSend} label="Broadcast to All Users"
                        disabled={!confirmed} />
        </div>
    );
}

// ─── Compose Tips sidebar ─────────────────────────────────────────────────────
const TIPS = {
    user:      { icon: "◎", title: "Single User", color: "green",  points: ["Targets one specific user by MongoDB ID", "Ideal for support responses or personal alerts", "Saved to the user's notification inbox"] },
    users:     { icon: "◉", title: "Multi-User",  color: "blue",   points: ["Paste IDs separated by commas or newlines", "Invalid IDs (non-24-char hex) are filtered out", "Results show per-user sent/failed counts"] },
    role:      { icon: "⬡", title: "By Role",     color: "purple", points: ["Targets all active users with the selected role", "Useful for staff announcements or tier-specific alerts", "USER is the most common target for client-facing notes"] },
    broadcast: { icon: "⊕", title: "Broadcast",   color: "teal",   points: ["Sends to every active user in the database", "Requires explicit confirmation before sending", "Best used for platform maintenance or major releases"] },
};

function ComposeTips({ mode }) {
    const tip = TIPS[mode] || TIPS.user;
    const borderMap = { green: "border-[#195C51]/20", blue: "border-blue-200", purple: "border-purple-200", teal: "border-teal-200" };
    const bgMap     = { green: "bg-[#195C51]/5",      blue: "bg-blue-50",      purple: "bg-purple-50",      teal: "bg-teal-50" };
    const textMap   = { green: "text-[#195C51]",      blue: "text-blue-600",   purple: "text-purple-600",   teal: "text-teal-600" };

    return (
        <div className={cls(
            "rounded-2xl border p-5 flex flex-col gap-4 h-fit shadow-sm transition-all duration-200",
            "bg-white", borderMap[tip.color]
        )}>
            <div className="flex items-center gap-3">
                <div className={cls("w-9 h-9 rounded-xl flex items-center justify-center text-lg", bgMap[tip.color])}>
                    <span className={textMap[tip.color]}>{tip.icon}</span>
                </div>
                <div>
                    <p className={labelCls} style={{ marginBottom: 0 }}>Send Mode</p>
                    <p className={cls("text-sm font-semibold", textMap[tip.color])}>{tip.title}</p>
                </div>
            </div>
            <div className="space-y-2.5">
                {tip.points.map((pt, i) => (
                    <div key={i} className="flex gap-2.5">
                        <span className={cls("text-xs mt-0.5 flex-shrink-0", textMap[tip.color])}>·</span>
                        <p className="text-xs text-[#4B5E5A] leading-relaxed">{pt}</p>
                    </div>
                ))}
            </div>
            <div className={cls("rounded-xl border px-4 py-3 mt-1", borderMap[tip.color], bgMap[tip.color])}>
                <p className={cls("text-xs font-medium", textMap[tip.color])}>
                    ✓ Notifications are always saved to the database regardless of push delivery outcome.
                </p>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  Stats Panel
// ═════════════════════════════════════════════════════════════════════════════
function StatsPanel({ showToast }) {
    const [stats,   setStats]   = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetchData(`${presence_server}/api/admin/notifications/stats`, returnToken());
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        setStats(res.data);
    }, [showToast]);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
    );

    if (!stats) return null;

    const readRate = stats.totalNotifications > 0
        ? Math.round(((stats.totalNotifications - stats.unreadNotifications) / stats.totalNotifications) * 100)
        : 0;

    return (
        <div className="space-y-5">
            {/* Stat grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Total"       value={stats.totalNotifications}  accent="green" />
                <StatCard label="Unread"      value={stats.unreadNotifications} accent="gold"
                          sub={`${100 - readRate}% unread`} />
                <StatCard label="Today"       value={stats.todayNotifications}  accent="blue"  />
                <StatCard label="Deleted"     value={stats.deletedNotifications} accent="red"  />
                <StatCard label="Admin Sent"  value={stats.adminNotifications}  accent="slate" />
                <StatCard label="Broadcasts"  value={stats.broadcastNotifications} accent="teal" />
            </div>

            {/* Read rate bar */}
            <div className="bg-white border border-[#E2E8E6] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className={labelCls} style={{ marginBottom: 2 }}>Read Rate</p>
                        <p className="text-2xl font-bold text-[#195C51]">{readRate}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-[#00000099]">
                            {stats.totalNotifications - stats.unreadNotifications} read
                            &nbsp;·&nbsp;
                            {stats.unreadNotifications} unread
                        </p>
                        <p className="text-xs text-[#A8BEBB] mt-0.5">of {stats.totalNotifications} total</p>
                    </div>
                </div>
                <div className="h-3 bg-[#F4F6F5] rounded-full border border-[#E2E8E6] overflow-hidden">
                    <div
                        className="h-full bg-[#195C51] rounded-full transition-all duration-700"
                        style={{ width: `${readRate}%` }}
                    />
                </div>
            </div>

            {/* Breakdown cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* By type breakdown */}
                <div className="bg-white border border-[#E2E8E6] rounded-2xl p-6 shadow-sm">
                    <p className={labelCls}>By Type</p>
                    <div className="space-y-3 mt-3">
                        {[
                            { label: "Admin",     value: stats.adminNotifications,     color: "gold"  },
                            { label: "Broadcast", value: stats.broadcastNotifications, color: "teal"  },
                            { label: "Other",     value: stats.totalNotifications - stats.adminNotifications - stats.broadcastNotifications, color: "slate" },
                        ].map(row => {
                            const pct = stats.totalNotifications > 0
                                ? Math.round((row.value / stats.totalNotifications) * 100)
                                : 0;
                            const barColor = { gold: "bg-amber-400", teal: "bg-teal-500", slate: "bg-slate-300" };
                            return (
                                <div key={row.label}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs text-[#4B5E5A] font-medium">{row.label}</span>
                                        <span className="text-xs text-[#00000099] tabular-nums">{row.value} · {pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-[#F4F6F5] rounded-full overflow-hidden">
                                        <div className={cls("h-full rounded-full", barColor[row.color])}
                                             style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Activity summary */}
                <div className="bg-white border border-[#E2E8E6] rounded-2xl p-6 shadow-sm">
                    <p className={labelCls}>Activity Summary</p>
                    <div className="space-y-3 mt-3">
                        {[
                            { label: "Sent today",   value: stats.todayNotifications,   icon: "◎" },
                            { label: "Active (not deleted)", value: stats.totalNotifications - stats.deletedNotifications, icon: "◉" },
                            { label: "Soft-deleted", value: stats.deletedNotifications, icon: "✕" },
                        ].map(row => (
                            <div key={row.label}
                                 className="flex items-center justify-between py-2.5 border-b border-[#F0F4F3] last:border-0">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[#195C51] text-xs">{row.icon}</span>
                                    <span className="text-xs text-[#4B5E5A]">{row.label}</span>
                                </div>
                                <span className="text-sm font-bold tabular-nums text-[#111C1A]">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={load}
                    className="flex items-center gap-2 text-xs text-[#195C51] hover:text-[#144A41]
                               font-semibold border border-[#195C51]/30 hover:border-[#195C51]/50
                               bg-white hover:bg-[#195C51]/5 px-4 py-2 rounded-lg transition-all">
                    ↺ Refresh
                </button>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  History Panel
// ═════════════════════════════════════════════════════════════════════════════
function HistoryPanel({ showToast }) {
    const [notifications, setNotifications] = useState([]);
    const [pagination,    setPagination]    = useState({ page: 1, totalPages: 1, total: 0, unread: 0 });
    const [loading,       setLoading]       = useState(true);
    const [typeFilter,    setTypeFilter]    = useState("all");

    const loadPage = useCallback(async (page = 1) => {
        setLoading(true);
        // Admin fetches all notifications via the stats + a general list
        // We reuse GET /notifications scoped globally — adjust endpoint if your
        // backend exposes a separate admin list endpoint
        const res = await fetchData(
            `${presence_server}/api/admin/notifications?page=${page}&limit=15`,
            returnToken()
        );
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        const d = res.data?.data ?? res.data;
        setNotifications(d?.notifications ?? d?.data ?? []);
        if (d?.pagination) setPagination(d.pagination);
    }, [showToast]);

    useEffect(() => { loadPage(1); }, [loadPage]);

    const filtered = typeFilter === "all"
        ? notifications
        : notifications.filter(n => n.type === typeFilter);

    const types = ["all", ...new Set(notifications.map(n => n.type).filter(Boolean))];

    return (
        <div className="space-y-5">
            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total (page)"  value={notifications.length}     accent="green" />
                <StatCard label="Unread"        value={pagination.unread}        accent="gold"  />
                <StatCard label="All-time Total" value={pagination.total}        accent="slate" />
                <StatCard label="Page"
                          value={`${pagination.page} / ${pagination.totalPages}`}
                          accent="slate" />
            </div>

            {/* Type filter pills */}
            {types.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    {types.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={cls(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all",
                                typeFilter === t
                                    ? "bg-[#195C51] text-white border-[#195C51]"
                                    : "bg-white text-[#00000099] border-[#E2E8E6] hover:border-[#195C51]/40 hover:text-[#195C51]"
                            )}>
                            {t === "all" ? `All (${notifications.length})` : t}
                        </button>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-[#E2E8E6] rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-[#C5D2CF]">
                        <p className="text-3xl mb-3">◈</p>
                        <p className="text-sm">No notifications found</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#E2E8E6] bg-[#F9FBFA]">
                                    {["Type", "Title", "Body", "User", "Status", "Date"].map(h => (
                                        <th key={h}
                                            className="text-left text-[10px] uppercase tracking-widest text-[#00000099]
                                                       font-semibold px-4 py-3 first:pl-6 last:pr-6">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(n => (
                                    <tr key={n._id}
                                        className="border-b border-[#F0F4F3] hover:bg-[#F9FBFA] transition-colors">
                                        <td className="px-4 py-3 pl-6">
                                            <Badge color={typeColor(n.type)}>{n.type || "general"}</Badge>
                                        </td>
                                        <td className="px-4 py-3 max-w-[160px]">
                                            <p className={cls(
                                                "text-xs truncate",
                                                !n.isRead ? "font-semibold text-[#111C1A]" : "text-[#4B5E5A]"
                                            )}>{n.title}</p>
                                        </td>
                                        <td className="px-4 py-3 max-w-[200px]">
                                            <p className="text-[11px] text-[#00000099] truncate">{n.body}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-[10px] text-[#A8BEBB]">
                                                {typeof n.user === "object" ? (n.user?.email || n.user?._id) : n.user}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                {n.isDeleted ? (
                                                    <Badge color="red">Deleted</Badge>
                                                ) : n.isRead ? (
                                                    <Badge color="slate">Read</Badge>
                                                ) : (
                                                    <Badge color="gold">Unread</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 pr-6 text-[11px] text-[#00000099] whitespace-nowrap">
                                            {new Date(n.createdAt).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric",
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between px-6 py-3 border-t border-[#E2E8E6] bg-[#F9FBFA]">
                            <p className="text-xs text-[#A8BEBB]">
                                {pagination.total} total notification{pagination.total !== 1 ? "s" : ""}
                                {typeFilter !== "all" && ` · filtered to "${typeFilter}"`}
                            </p>
                            <div className="flex gap-2">
                                <PagBtn label="← Prev" disabled={pagination.page <= 1}
                                        onClick={() => loadPage(pagination.page - 1)} />
                                <PagBtn label="Next →" disabled={pagination.page >= pagination.totalPages}
                                        onClick={() => loadPage(pagination.page + 1)} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}