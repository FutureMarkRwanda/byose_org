import { useState, useEffect, useCallback } from "react";
import { fetchData, returnToken, sendData } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Primary   #195C51   deep teal-green
// Bg        #F4F6F5   page background
// Surface   #FFFFFF   cards / panels
// Border    #E2E8E6   subtle cool-green tint
// Text-1    #111C1A   headings
// Text-2    #4B5E5A   body copy
// Text-dim  #8FA39F   muted / labels
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
    "block text-[10px] tracking-[0.18em] uppercase text-[#8FA39F] font-semibold mb-1.5";

// ─── Badge ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function Badge({ children, color = "green" }) {
    const map = {
        green: "bg-[#195C51]/10 text-[#195C51] border border-[#195C51]/20",
        gold:  "bg-amber-50 text-amber-700 border border-amber-200",
        teal:  "bg-teal-50 text-teal-700 border border-teal-200",
        red:   "bg-red-50 text-red-600 border border-red-200",
        slate: "bg-slate-100 text-slate-500 border border-slate-200",
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
function StatCard({ label, value, accent = "green" }) {
    const border = { green: "border-[#195C51]/20", gold: "border-amber-200", red: "border-red-200", slate: "border-slate-200" };
    const num    = { green: "text-[#195C51]",       gold: "text-amber-600",   red: "text-red-500",   slate: "text-slate-500" };
    return (
        <div className={cls("bg-white rounded-xl border p-4 shadow-sm", border[accent] || border.green)}>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8FA39F] mb-1">{label}</p>
            <p className={cls("text-3xl font-bold tabular-nums", num[accent] || num.green)}>{value}</p>
        </div>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function Field({ label, children }) {
    return <div><label className={labelCls}>{label}</label>{children}</div>;
}

// ─── SendButton ───────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function SendButton({ loading, onClick, label }) {
    return (
        <button onClick={onClick} disabled={loading}
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
// eslint-disable-next-line react/prop-types
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

const TABS = [
    { id: "compose", label: "Compose", icon: "✦" },
    { id: "history", label: "History", icon: "◈" },
];

// ═════════════════════════════════════════════════════════════════════════════
//  Root page
// ═════════════════════════════════════════════════════════════════════════════
export default function BroadcastPage() {
    const [activeTab, setActiveTab] = useState("compose");
    const [toastMsg,  setToastMsg]  = useState(null);
    const [detailId,  setDetailId]  = useState(null);

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
                        Admin · Communications
                    </p>
                    <h1 className="text-2xl font-bold text-[#111C1A] tracking-tight leading-none mb-1">
                        Broadcast Centre
                    </h1>
                    <p className="text-sm text-[#8FA39F]">Send system alerts and product updates to verified users</p>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 p-1 bg-white border border-[#E2E8E6] rounded-xl w-fit mb-7 shadow-sm">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={cls(
                                "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                                activeTab === t.id
                                    ? "bg-[#195C51] text-white shadow-sm"
                                    : "text-[#8FA39F] hover:text-[#111C1A] hover:bg-[#F4F6F5]"
                            )}>
                            <span className="text-xs">{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === "compose" && <ComposePanel showToast={showToast} />}
                {activeTab === "history" && (
                    <HistoryPanel showToast={showToast} detailId={detailId} setDetailId={setDetailId} />
                )}
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  Compose Panel
// ═════════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line react/prop-types
function ComposePanel({ showToast }) {
    const [emailType, setEmailType] = useState("alert");
    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
            <div className="bg-white border border-[#E2E8E6] rounded-2xl overflow-hidden shadow-sm">
                {/* Sub-tabs */}
                <div className="border-b border-[#E2E8E6] px-6 pt-5 pb-0 flex gap-6">
                    {[
                        { id: "alert",  label: "Alert Message",  badge: "ALERT",   badgeColor: "gold" },
                        { id: "update", label: "Product Update", badge: "RELEASE", badgeColor: "teal" },
                    ].map(t => (
                        <button key={t.id} onClick={() => setEmailType(t.id)}
                            className={cls(
                                "flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all",
                                emailType === t.id
                                    ? "border-[#195C51] text-[#195C51]"
                                    : "border-transparent text-[#8FA39F] hover:text-[#4B5E5A]"
                            )}>
                            {t.label}
                            <Badge color={t.badgeColor}>{t.badge}</Badge>
                        </button>
                    ))}
                </div>
                <div className="p-6">
                    {emailType === "alert"
                        ? <AlertForm  showToast={showToast} />
                        : <UpdateForm showToast={showToast} />}
                </div>
            </div>
            <AudienceSidebar />
        </div>
    );
}

// ─── Alert Form ───────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function AlertForm({ showToast }) {
    const [message,      setMessage]      = useState("");
    const [audienceType, setAudienceType] = useState("SELECTED");
    const [selectedIds,  setSelectedIds]  = useState([]);
    const [loading,      setLoading]      = useState(false);

    useEffect(() => {
        const handler = (e) => {
            setAudienceType(e.detail.audienceType);
            setSelectedIds(e.detail.selectedIds);
        };
        window.addEventListener("audience-change", handler);
        return () => window.removeEventListener("audience-change", handler);
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return showToast("Message is required", "error");
        if (audienceType === "SELECTED" && !selectedIds.length)
            return showToast("Select at least one user", "error");

        setLoading(true);
        const body = { audienceType, message };
        if (audienceType === "SELECTED") body.userIds = selectedIds;
        const res = await sendData(`${presence_server}/api/broadcast/alert`, body, returnToken());
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        showToast(`Alert sent — ${res.data.data.sentCount} delivered, ${res.data.data.failedCount} failed`);
        setMessage("");
    };

    return (
        <div className="space-y-5">
            <div>
                <label className={labelCls}>Message</label>
                <textarea rows={7} value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Enter the alert message to broadcast to users…"
                    className={cls(inputCls, "resize-none")} />
                <p className="text-[11px] text-[#C5D2CF] mt-1.5 text-right">{message.length} chars</p>
            </div>
            <SendButton loading={loading} onClick={handleSend} label="Send Alert" />
        </div>
    );
}

// ─── Product Update Form ──────────────────────────────────────────────────────
const EMPTY_ITEM = () => ({ icon: "✦", label: "UPDATE", title: "", description: "" });

// eslint-disable-next-line react/prop-types
function UpdateForm({ showToast }) {
    const [headline,     setHeadline]     = useState("");
    const [intro,        setIntro]        = useState("");
    const [ctaLabel,     setCtaLabel]     = useState("Explore What's New");
    const [ctaUrl,       setCtaUrl]       = useState("");
    const [forByose,     setForByose]     = useState(false);
    const [items,        setItems]        = useState([EMPTY_ITEM()]);
    const [audienceType, setAudienceType] = useState("SELECTED");
    const [selectedIds,  setSelectedIds]  = useState([]);
    const [loading,      setLoading]      = useState(false);

    useEffect(() => {
        const handler = (e) => {
            setAudienceType(e.detail.audienceType);
            setSelectedIds(e.detail.selectedIds);
        };
        window.addEventListener("audience-change", handler);
        return () => window.removeEventListener("audience-change", handler);
    }, []);

    const updateItem = (idx, field, val) =>
        setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
    const addItem    = () => setItems(prev => [...prev, EMPTY_ITEM()]);
    const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

    const handleSend = async () => {
        if (!headline.trim()) return showToast("Headline is required", "error");
        if (!items[0]?.title) return showToast("At least one update item is required", "error");
        if (audienceType === "SELECTED" && !selectedIds.length)
            return showToast("Select at least one user", "error");

        const updates = { headline, intro, ctaLabel, ctaUrl, forByose, items };
        const body = { audienceType, updates };
        if (audienceType === "SELECTED") body.userIds = selectedIds;

        setLoading(true);
        const res = await sendData(`${presence_server}/api/broadcast/product-update`, body, returnToken());
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        showToast(`Update sent — ${res.data.data.sentCount} delivered, ${res.data.data.failedCount} failed`);
        setHeadline(""); setIntro(""); setItems([EMPTY_ITEM()]);
    };

    return (
        <div className="space-y-5">
            <Field label="Headline *">
                <input value={headline} onChange={e => setHeadline(e.target.value)}
                    placeholder="e.g. Spring 2025 Release" className={inputCls} />
            </Field>
            <Field label="Intro paragraph">
                <textarea rows={3} value={intro} onChange={e => setIntro(e.target.value)}
                    placeholder="Brief intro shown above the update items…"
                    className={cls(inputCls, "resize-none")} />
            </Field>

            {/* Update items */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className={labelCls}>Update Items *</label>
                    <button onClick={addItem}
                        className="flex items-center gap-1 text-xs text-[#195C51] hover:text-[#144A41] font-medium transition-colors">
                        <span className="text-base leading-none">+</span> Add item
                    </button>
                </div>
                <div className="space-y-3">
                    {items.map((item, idx) => (
                        <div key={idx} className="border border-[#E2E8E6] rounded-xl p-4 bg-[#F9FBFA] space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] tracking-widest uppercase text-[#A8BEBB] font-semibold">
                                    Item {idx + 1}
                                </span>
                                {items.length > 1 && (
                                    <button onClick={() => removeItem(idx)}
                                        className="text-[#A8BEBB] hover:text-red-500 text-xs transition-colors">
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Icon</label>
                                    <input value={item.icon} onChange={e => updateItem(idx, "icon", e.target.value)}
                                        placeholder="⚡" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Label</label>
                                    <input value={item.label} onChange={e => updateItem(idx, "label", e.target.value)}
                                        placeholder="NEW FEATURE" className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Title *</label>
                                <input value={item.title} onChange={e => updateItem(idx, "title", e.target.value)}
                                    placeholder="Feature name" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Description *</label>
                                <textarea rows={2} value={item.description}
                                    onChange={e => updateItem(idx, "description", e.target.value)}
                                    placeholder="What changed and why it matters…"
                                    className={cls(inputCls, "resize-none")} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3">
                <Field label="CTA Label">
                    <input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)}
                        placeholder="Explore What's New" className={inputCls} />
                </Field>
                <Field label="CTA URL">
                    <input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)}
                        placeholder="https://…" className={inputCls} />
                </Field>
            </div>

            {/* BYOSE toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => setForByose(p => !p)}
                    className={cls(
                        "w-10 h-5 rounded-full border transition-all duration-200 relative flex-shrink-0",
                        forByose ? "bg-[#195C51] border-[#195C51]" : "bg-[#E2E8E6] border-[#D1DBD8]"
                    )}>
                    <span className={cls(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                        forByose ? "left-5" : "left-0.5"
                    )} />
                </div>
                <span className="text-sm text-[#4B5E5A] group-hover:text-[#111C1A] transition-colors">
                    Send on behalf of <span className="text-[#195C51] font-semibold">BYOSE Tech</span>
                </span>
            </label>

            <SendButton loading={loading} onClick={handleSend} label="Send Product Update" />
        </div>
    );
}

// ─── Audience Sidebar ─────────────────────────────────────────────────────────
function AudienceSidebar() {
    const [audienceType, setAudienceType] = useState("SELECTED");
    const [users,        setUsers]        = useState([]);
    const [search,       setSearch]       = useState("");
    const [selected,     setSelected]     = useState(new Set());
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("audience-change", {
            detail: { audienceType, selectedIds: [...selected] }
        }));
    }, [audienceType, selected]);

    useEffect(() => {
        if (audienceType !== "SELECTED") return;
        if (users.length) return;
        (async () => {
            setLoadingUsers(true);
            const res = await fetchData(`${presence_server}/users/no-more`, returnToken());
            setLoadingUsers(false);
            if (!res.error) {
                const arr = res.data?.users || res.data?.data || res.data || [];
                setUsers(Array.isArray(arr) ? arr : []);
            }
        })();
    }, [audienceType, users.length]);

    const filtered = users.filter(u =>
        u.isVerified &&
        (u.email?.toLowerCase().includes(search.toLowerCase()) ||
         u.name?.toLowerCase().includes(search.toLowerCase()))
    );

    const toggleUser = (id) => {
        setSelected(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const toggleAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(u => u._id)));
    };

    return (
        <div className="bg-white border border-[#E2E8E6] rounded-2xl p-5 flex flex-col gap-4 h-fit shadow-sm">
            <div>
                <p className={labelCls}>Audience</p>
                <div className="grid grid-cols-2 gap-2">
                    {["ALL", "SELECTED"].map(opt => (
                        <button key={opt}
                            onClick={() => { setAudienceType(opt); setSelected(new Set()); }}
                            className={cls(
                                "py-2.5 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all border",
                                audienceType === opt
                                    ? "bg-[#195C51] text-white border-[#195C51] shadow-sm"
                                    : "bg-white text-[#8FA39F] border-[#E2E8E6] hover:border-[#195C51]/40 hover:text-[#195C51]"
                            )}>
                            {opt === "ALL" ? "All Users" : "Selected"}
                        </button>
                    ))}
                </div>
            </div>

            {audienceType === "ALL" && (
                <div className="rounded-xl border border-[#195C51]/20 bg-[#195C51]/5 px-4 py-3">
                    <p className="text-xs text-[#195C51] font-medium">
                        ✓ Will be sent to all <span className="font-bold">verified</span> users
                    </p>
                </div>
            )}

            {audienceType === "SELECTED" && (
                <div className="space-y-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8BEBB] text-sm">⌕</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search users…"
                            className="w-full bg-[#F4F6F5] border border-[#E2E8E6] rounded-lg
                                       pl-8 pr-3 py-2 text-xs text-[#111C1A] placeholder-[#A8BEBB]
                                       focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/10 transition-all" />
                    </div>

                    {loadingUsers ? (
                        <div className="flex justify-center py-6"><Spinner /></div>
                    ) : (
                        <>
                            {filtered.length > 0 && (
                                <div className="flex items-center justify-between pb-1.5 border-b border-[#E2E8E6]">
                                    <button onClick={toggleAll}
                                        className="text-[10px] text-[#195C51] hover:text-[#144A41] font-semibold uppercase tracking-widest transition-colors">
                                        {selected.size === filtered.length ? "Deselect all" : "Select all"}
                                    </button>
                                    <span className="text-[10px] text-[#A8BEBB]">{selected.size} / {filtered.length}</span>
                                </div>
                            )}

                            <div className="max-h-[320px] overflow-y-auto space-y-0.5">
                                {filtered.length === 0 && (
                                    <p className="text-xs text-[#A8BEBB] text-center py-6">
                                        {users.length ? "No verified users match" : "No verified users found"}
                                    </p>
                                )}
                                {filtered.map(user => (
                                    <label key={user._id}
                                        className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[#F4F6F5] cursor-pointer transition-colors group">
                                        <div onClick={() => toggleUser(user._id)}
                                            className={cls(
                                                "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                                selected.has(user._id)
                                                    ? "bg-[#195C51] border-[#195C51]"
                                                    : "border-[#D1DBD8] group-hover:border-[#195C51]/50"
                                            )}>
                                            {selected.has(user._id) && (
                                                <span className="text-white text-[8px] font-bold">✓</span>
                                            )}
                                        </div>
                                        <div className="w-7 h-7 rounded-full bg-[#195C51] flex items-center justify-center
                                                        text-[10px] font-bold text-white flex-shrink-0">
                                            {(user.name || user.email || "?")[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            {user.name && (
                                                <p className="text-xs font-medium text-[#111C1A] truncate">{user.name}</p>
                                            )}
                                            <p className="text-[11px] text-[#8FA39F] truncate">{user.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}

                    {selected.size > 0 && (
                        <div className="rounded-lg border border-[#195C51]/20 bg-[#195C51]/5 px-3 py-2">
                            <p className="text-xs text-[#195C51] font-medium">
                                {selected.size} user{selected.size !== 1 ? "s" : ""} selected
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  History Panel
// ═════════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line react/prop-types
function HistoryPanel({ showToast, detailId, setDetailId }) {
    const [broadcasts,    setBroadcasts]    = useState([]);
    const [pagination,    setPagination]    = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading,       setLoading]       = useState(true);
    const [detail,        setDetail]        = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [resending,     setResending]     = useState(null);

    const loadPage = useCallback(async (page = 1) => {
        setLoading(true);
        const res = await fetchData(`${presence_server}/api/broadcast?page=${page}&limit=10`, returnToken());
        setLoading(false);
        if (res.error) return showToast(res.error, "error");
        setBroadcasts(res.data.data.broadcasts);
        setPagination(res.data.data.pagination);
    }, [showToast]);

    useEffect(() => { loadPage(1); }, [loadPage]);

    const openDetail = async (id) => {
        setDetailId(id);
        setDetailLoading(true);
        const res = await fetchData(`${presence_server}/api/broadcast/${id}`, returnToken());
        setDetailLoading(false);
        if (res.error) return showToast(res.error, "error");
        setDetail(res.data.data);
    };

    const handleResend = async (id) => {
        setResending(id);
        const res = await sendData(`${presence_server}/api/broadcast/${id}/resend-failed`, {}, returnToken());
        setResending(null);
        if (res.error) return showToast(res.error, "error");
        showToast(`Resend complete — ${res.data.data.sentCount} delivered`);
        loadPage(pagination.page);
        if (detailId === id) openDetail(id);
    };

    const totalSent   = broadcasts.reduce((s, b) => s + (b.sentCount   || 0), 0);
    const totalFailed = broadcasts.reduce((s, b) => s + (b.failedCount || 0), 0);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Broadcasts" value={pagination.total} accent="green" />
                <StatCard label="Emails Delivered"  value={totalSent}        accent="green" />
                <StatCard label="Failed (page)"     value={totalFailed}      accent="red"   />
                <StatCard label="Current Page"
                          value={`${pagination.page} / ${pagination.totalPages}`}
                          accent="slate" />
            </div>

            <div className={cls("grid gap-5 transition-all", detailId ? "xl:grid-cols-[1fr_400px]" : "grid-cols-1")}>

                {/* Table */}
                <div className="bg-white border border-[#E2E8E6] rounded-2xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>
                    ) : broadcasts.length === 0 ? (
                        <div className="text-center py-20 text-[#C5D2CF]">
                            <p className="text-3xl mb-3">◈</p>
                            <p className="text-sm">No broadcasts yet</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#E2E8E6] bg-[#F9FBFA]">
                                        {["Type", "Subject / Headline", "Audience", "Sent", "Failed", "Date", ""].map(h => (
                                            <th key={h}
                                                className="text-left text-[10px] uppercase tracking-widest text-[#8FA39F]
                                                           font-semibold px-4 py-3 first:pl-6 last:pr-6">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {broadcasts.map((b) => (
                                        <tr key={b._id} onClick={() => openDetail(b._id)}
                                            className={cls(
                                                "border-b border-[#F0F4F3] cursor-pointer transition-colors",
                                                detailId === b._id ? "bg-[#195C51]/5" : "hover:bg-[#F9FBFA]"
                                            )}>
                                            <td className="px-4 py-3 pl-6">
                                                <Badge color={b.type === "ALERT_MESSAGE" ? "gold" : "teal"}>
                                                    {b.type === "ALERT_MESSAGE" ? "Alert" : "Update"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 max-w-[180px]">
                                                <p className="text-[#111C1A] text-xs font-medium truncate">{b.subject}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge color={b.audienceType === "ALL" ? "green" : "slate"}>
                                                    {b.audienceType}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[#195C51] font-semibold tabular-nums">{b.sentCount}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cls(
                                                    "font-semibold tabular-nums",
                                                    b.failedCount > 0 ? "text-red-500" : "text-[#C5D2CF]"
                                                )}>{b.failedCount}</span>
                                            </td>
                                            <td className="px-4 py-3 text-[11px] text-[#8FA39F] whitespace-nowrap">
                                                {new Date(b.createdAt).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric",
                                                    hour: "2-digit", minute: "2-digit"
                                                })}
                                            </td>
                                            <td className="px-4 py-3 pr-6">
                                                {b.failedCount > 0 && (
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleResend(b._id); }}
                                                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider
                                                                   text-amber-600 hover:text-amber-700 font-semibold
                                                                   border border-amber-200 hover:border-amber-300
                                                                   bg-amber-50 hover:bg-amber-100
                                                                   px-2.5 py-1 rounded-lg transition-all">
                                                        {resending === b._id ? <Spinner /> : "↺ Retry"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex items-center justify-between px-6 py-3 border-t border-[#E2E8E6] bg-[#F9FBFA]">
                                <p className="text-xs text-[#A8BEBB]">
                                    {pagination.total} total broadcast{pagination.total !== 1 ? "s" : ""}
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

                {/* Detail drawer */}
                {detailId && (
                    <DetailDrawer
                        detail={detail}
                        loading={detailLoading}
                        onClose={() => { setDetailId(null); setDetail(null); }}
                        onResend={handleResend}
                        resending={resending === detailId}
                    />
                )}
            </div>
        </div>
    );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
function DetailDrawer({ detail, loading, onClose, onResend, resending }) {
    return (
        <div className="bg-white border border-[#E2E8E6] rounded-2xl overflow-hidden flex flex-col max-h-[680px] shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8E6] bg-[#F9FBFA]">
                <p className={labelCls} style={{ margin: 0 }}>Broadcast Detail</p>
                <button onClick={onClose}
                    className="w-7 h-7 rounded-full flex items-center justify-center
                               text-[#8FA39F] hover:text-[#111C1A] hover:bg-[#E2E8E6] transition-all text-base">
                    ×
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-12"><Spinner size="lg" /></div>
            ) : detail ? (
                <div className="flex-1 overflow-y-auto">
                    <div className="px-5 py-4 border-b border-[#E2E8E6] space-y-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-[#111C1A] leading-snug">{detail.subject}</p>
                                <p className="text-[11px] text-[#8FA39F] mt-0.5">
                                    {new Date(detail.createdAt).toLocaleString("en-US", {
                                        dateStyle: "medium", timeStyle: "short"
                                    })}
                                </p>
                            </div>
                            <Badge color={detail.type === "ALERT_MESSAGE" ? "gold" : "teal"}>
                                {detail.type === "ALERT_MESSAGE" ? "Alert" : "Update"}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                                { label: "Total",     value: detail.totalRecipients, color: "text-[#111C1A]" },
                                { label: "Delivered", value: detail.sentCount,       color: "text-[#195C51]" },
                                { label: "Failed",    value: detail.failedCount,     color: detail.failedCount > 0 ? "text-red-500" : "text-[#C5D2CF]" },
                            ].map(s => (
                                <div key={s.label} className="bg-[#F4F6F5] rounded-lg py-2 border border-[#E2E8E6]">
                                    <p className={cls("text-lg font-bold tabular-nums", s.color)}>{s.value}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-[#A8BEBB] mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {detail.failedCount > 0 && (
                            <button onClick={() => onResend(detail._id)} disabled={resending}
                                className="w-full flex items-center justify-center gap-2
                                           bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300
                                           text-amber-700 text-xs font-semibold uppercase tracking-widest
                                           py-2.5 rounded-lg transition-all">
                                {resending ? <Spinner /> : "↺ Resend to Failed Recipients"}
                            </button>
                        )}
                    </div>

                    <div className="px-5 py-4">
                        <p className={labelCls}>Recipients</p>
                        <div className="space-y-0.5">
                            {(detail.recipients || []).map((r, i) => (
                                <div key={i}
                                    className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[#F4F6F5] transition-colors">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-[#195C51] flex items-center justify-center
                                                        text-[9px] font-bold text-white flex-shrink-0">
                                            {(r.user?.name || r.email || "?")[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            {r.user?.name && (
                                                <p className="text-[11px] font-medium text-[#111C1A] truncate">{r.user.name}</p>
                                            )}
                                            <p className="text-[10px] text-[#8FA39F] truncate">{r.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
                                        {r.status === "sent" ? (
                                            <span className="text-[#195C51] text-[10px] font-semibold">✓ sent</span>
                                        ) : (
                                            <span className="text-red-500 text-[10px] font-semibold" title={r.failReason}>
                                                ✕ failed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}