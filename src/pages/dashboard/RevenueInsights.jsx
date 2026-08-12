// src/pages/dashboard/RevenueInsights.jsx
import React, { useState, useEffect, useCallback} from 'react';
import {
    CreditCard, Users, ChevronLeft, ChevronRight,
    Plus, Edit2, Power, PowerOff, ShieldCheck, CheckCircle2,
    PieChart as PieChartIcon, TrendingUp, X,
     ArrowLeft, Receipt, Banknote, BarChart2
} from 'lucide-react';
import {
    MdVerified, MdAccessTime, MdPauseCircle, MdCancel,
    MdTimer, MdHourglassEmpty, MdErrorOutline
} from 'react-icons/md';
import {BarChart, Bar, PieChart, Pie, Cell,
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import { fetchData, sendData, updateData, patchData, returnToken, formatDate } from '../../utils/helper.js';
import { presence_server } from '../../config/server_api.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import { PrivacyNameToggle } from './DeviceInsights.jsx';

// ─── Privacy Helper ────────────────────────────────────────────────────────────
const maskEmailLocal = (email) => {
    if (!email) return '—';
    const at = email.indexOf('@');
    if (at === -1) return `${email.slice(0, 3)}***`;
    const local = email.slice(0, at);
    const domain = email.slice(at);
    return `${local.slice(0, 3)}${'*'.repeat(Math.max(3, local.length - 3))}${domain}`;
};

// ─── Revenue Helpers ───────────────────────────────────────────────────────────
// The backend (services/revenue.util.js) is the single source of truth for
// what counts as revenue — it annotates every subscription it returns with
// `countedAsRevenue` and `revenueAmount`. These helpers read that first and
// only fall back to a local estimate if an older API response is missing
// those fields, so the dashboard can never silently disagree with the
// backend's business rules (e.g. excluding admin-granted subscriptions).
const isCountedAsRevenue = (sub) => {
    if (typeof sub?.countedAsRevenue === 'boolean') return sub.countedAsRevenue;
    // Defensive fallback for older responses — mirrors the backend rule.
    return !sub?.isTrial && sub?.paymentMethod !== 'admin_grant' &&
        ['active', 'grace_period', 'expired', 'cancelled'].includes(sub?.status);
};

const getRevenueAmount = (sub) => {
    if (typeof sub?.revenueAmount === 'number') return sub.revenueAmount;
    if (!isCountedAsRevenue(sub)) return 0;
    if (sub?.pricingSnapshot?.totalPaid > 0) return sub.pricingSnapshot.totalPaid;
    const ppm = sub?.pricingSnapshot?.pricePerMonth || 0;
    const dur = sub?.durationMonths || 0;
    return ppm * dur;
};

// ─── Date Range Helpers ────────────────────────────────────────────────────────
// Every preset resolves to explicit, human-predictable boundaries. `to` is
// always "today" (inclusive) for anything but "Last Year", which is a fully
// closed historical period.
const toISODate = (d) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${day}`;
};

const startOfWeek = (d) => {
    const date = new Date(d);
    const dow = date.getDay(); // 0 = Sunday
    const diff = date.getDate() - dow; // week starts Sunday
    return new Date(date.getFullYear(), date.getMonth(), diff);
};

const getDateRangeForPeriod = (period, customFrom, customTo) => {
    const today = new Date();
    switch (period) {
        case 'today':
            return { from: toISODate(today), to: toISODate(today) };
        case 'this_week':
            return { from: toISODate(startOfWeek(today)), to: toISODate(today) };
        case 'this_month':
            return { from: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)), to: toISODate(today) };
        case 'this_year':
            return { from: toISODate(new Date(today.getFullYear(), 0, 1)), to: toISODate(today) };
        case 'last_year':
            return {
                from: toISODate(new Date(today.getFullYear() - 1, 0, 1)),
                to: toISODate(new Date(today.getFullYear() - 1, 11, 31)),
            };
        case 'custom':
        default:
            return { from: customFrom, to: customTo };
    }
};

const PERIOD_LABELS = {
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month',
    this_year: 'This Year',
    last_year: 'Last Year',
    custom: 'Custom Range',
};

// ─── UI Primitives ─────────────────────────────────────────────────────────────
// eslint-disable-next-line react/prop-types
const Card = ({ children, className = '' }) => (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>
);

// eslint-disable-next-line react/prop-types
const StatusPill = ({ status }) => {
    const cfg = {
        active:       { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', icon: MdVerified,       label: 'Active' },
        trial:        { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-200',    icon: MdAccessTime,     label: 'Trial' },
        grace_period: { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200',   icon: MdPauseCircle,    label: 'Grace Period' },
        cancelled:    { bg: 'bg-slate-100',   text: 'text-slate-700',   border: 'border-slate-300',   icon: MdCancel,         label: 'Cancelled' },
        expired:      { bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-200',     icon: MdTimer,          label: 'Expired' },
        pending:      { bg: 'bg-yellow-100',  text: 'text-yellow-800',  border: 'border-yellow-200',  icon: MdHourglassEmpty, label: 'Pending' },
        failed:       { bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-200',     icon: MdErrorOutline,   label: 'Failed' },
    }[status?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: ShieldCheck, label: status };

    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <Icon size={12} /> {cfg.label}
        </span>
    );
};

// ─── Revenue Trend Chart ───────────────────────────────────────────────────────
const RevenueTrendChart = ({ token }) => {
    const [trendData, setTrendData]       = useState([]);
    const [loading, setLoading]           = useState(true);
    const [timePeriod, setTimePeriod]     = useState('this_month');
    const [customFrom, setCustomFrom]     = useState('');
    const [customTo, setCustomTo]         = useState('');
    // Collected and earned come from separate, clearly-labeled fields on
    // the /revenue summary endpoint.
    const [summaryCollected, setSummaryCollected] = useState(null);
    const [summaryEarned, setSummaryEarned]       = useState(null);
    const [currency, setCurrency]         = useState('RWF');

    const buildQuery = useCallback(
        () => getDateRangeForPeriod(timePeriod, customFrom, customTo),
        [timePeriod, customFrom, customTo]
    );

    const loadTrend = useCallback(async () => {
        const { from, to } = buildQuery();
        if (!from || !to) return;
        setLoading(true);
        try {
            const res = await fetchData(
                `${presence_server}/api/admin/subscriptions/revenue/trend?from=${from}&to=${to}`,
                token
            );
            if (res.data) {
                // FIX: backend now returns { period, collected, earned } per item
                const raw = res.data.trend || res.data.data?.trend || [];
                setTrendData(raw);
            }
        } catch (err) {
            console.error('Revenue trend error:', err);
        }
        setLoading(false);
    }, [buildQuery, token]);

    // Load summary KPIs from the /revenue endpoint
    const loadSummaryTotal = useCallback(async () => {
        const { from, to } = buildQuery();
        if (!from || !to) return;
        try {
            const res = await fetchData(
                `${presence_server}/api/admin/subscriptions/revenue?from=${from}&to=${to}`,
                token
            );
            if (res.data) {
                const rev = res.data.revenue || res.data;
                // FIX: backend now returns { collected, earned, currency }
                setSummaryCollected(rev.collected ?? null);
                setSummaryEarned(rev.earned ?? null);
                if (rev.currency) setCurrency(rev.currency);
            }
        } catch (_) {}
    }, [buildQuery, token]);

    useEffect(() => {
        loadTrend();
        loadSummaryTotal();
    }, [loadTrend, loadSummaryTotal]);

    const PERIOD_OPTS = [
        { id: 'today',      label: PERIOD_LABELS.today },
        { id: 'this_week',  label: PERIOD_LABELS.this_week },
        { id: 'this_month', label: PERIOD_LABELS.this_month },
        { id: 'this_year',  label: PERIOD_LABELS.this_year },
        { id: 'last_year',  label: PERIOD_LABELS.last_year },
        { id: 'custom',     label: PERIOD_LABELS.custom },
    ];

    const { from: resolvedFrom, to: resolvedTo } = buildQuery();
    const fmtRangeLabel = (iso) => iso
        ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';

    const fmtRevenue = (val) => {
        if (val == null) return '—';
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ${currency}`;
        if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}K ${currency}`;
        return `${val.toLocaleString()} ${currency}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-[#1A2E2A] text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-white/10">
                <p className="font-bold mb-1 text-gray-300 text-[10px]">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-gray-300 text-[10px]">{p.name}:</span>
                        <span className="font-black text-[10px]" style={{ color: p.color }}>
                            {fmtRevenue(p.value)}
                        </span>
                    </p>
                ))}
            </div>
        );
    };

    return (
        <Card className="p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#195C51]" />
                    <div>
                        <h2 className="font-display font-semibold text-lg leading-tight">Revenue Trend</h2>
                        <p className="text-xs text-slate-500">Money actually collected vs. revenue recognized (MRR), by month</p>
                    </div>
                </div>

                {/* Period Switcher */}
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {PERIOD_OPTS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setTimePeriod(opt.id)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    timePeriod === opt.id
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {timePeriod === 'custom' && (
                        <div className="flex items-center gap-2 text-xs">
                            <input
                                type="date"
                                value={customFrom}
                                onChange={e => setCustomFrom(e.target.value)}
                                className="border border-slate-200 rounded-md px-2 py-1 text-xs outline-none focus:border-[#195C51]"
                            />
                            <span className="text-slate-400">→</span>
                            <input
                                type="date"
                                value={customTo}
                                onChange={e => setCustomTo(e.target.value)}
                                className="border border-slate-200 rounded-md px-2 py-1 text-xs outline-none focus:border-[#195C51]"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Explicit, unambiguous statement of the period being shown */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <span className="font-bold text-slate-700">{PERIOD_LABELS[timePeriod]}:</span>
                <span>{fmtRangeLabel(resolvedFrom)} → {fmtRangeLabel(resolvedTo)}</span>
            </div>

            {/* Two KPI cards — collected and earned — both sourced from the backend /revenue endpoint */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 py-4 px-5 bg-gradient-to-r from-[#195C51]/8 to-transparent rounded-xl border border-[#195C51]/15">
                    <Banknote className="w-8 h-8 text-[#195C51] opacity-60 shrink-0" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Revenue Collected</p>
                        {loading ? (
                            <div className="h-7 w-28 bg-slate-100 animate-pulse rounded-md" />
                        ) : (
                            <p className="text-2xl font-bold text-[#195C51]">{fmtRevenue(summaryCollected)}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">Actual cash received for payments made in this period. Excludes admin-granted &amp; trial subscriptions.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 py-4 px-5 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
                    <BarChart2 className="w-8 h-8 text-blue-500 opacity-60 shrink-0" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Revenue Earned (MRR)</p>
                        {loading ? (
                            <div className="h-7 w-28 bg-slate-100 animate-pulse rounded-md" />
                        ) : (
                            <p className="text-2xl font-bold text-blue-600">{fmtRevenue(summaryEarned)}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">Value of active, paid subscription-months in this period — not new cash received.</p>
                    </div>
                </div>
            </div>

            {/* FIX: Chart now renders both `collected` and `earned` series */}
            <div className="h-[160px] min-h-[160px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : trendData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                        <TrendingUp className="w-8 h-8 opacity-20" />
                        <p className="text-sm font-medium">No revenue data for this period.</p>
                        <p className="text-xs">Revenue trend populates as subscriptions are collected.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#195C51" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#195C51" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 10, fill: '#64748B' }}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#64748B' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                                width={40}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            {/* FIX: collected series — lump-sum cash received */}
                            <Area
                                type="monotone"
                                dataKey="collected"
                                name="Collected"
                                stroke="#195C51"
                                fill="url(#collectedGrad)"
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: '#195C51', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 5 }}
                            />
                            {/* FIX: earned series — MRR spread across active months */}
                            <Area
                                type="monotone"
                                dataKey="earned"
                                name="Earned (MRR)"
                                stroke="#3B82F6"
                                fill="url(#earnedGrad)"
                                strokeWidth={2}
                                strokeDasharray="4 2"
                                dot={{ r: 2.5, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 4 }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={24}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', fontWeight: '700', color: '#475569', paddingTop: '4px' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend explainer */}
            <div className="flex gap-6 text-[10px] text-slate-500 border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#195C51] inline-block rounded" />
                    <strong className="text-slate-700">Revenue Collected</strong> — actual payment received when the subscription started
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-blue-400 inline-block rounded border-dashed" style={{borderTop:'2px dashed #3B82F6', background:'none'}} />
                    <strong className="text-slate-700">Revenue Earned</strong> — that payment spread evenly across each paid month (MRR)
                </span>
            </div>
        </Card>
    );
};

// ─── Revenue History Drawer ────────────────────────────────────────────────────
const RevenueHistoryDrawer = ({ user, onClose, token }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    const fullName = `${user.user?.firstName || ''} ${user.user?.lastName || ''}`.trim();

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            try {
                const userId = user.user?._id || user._id;
                const res = await fetchData(
                    `${presence_server}/api/admin/subscriptions/user/${userId}/history`,
                    token
                );
                if (res.data) {
                    setHistory(res.data.subscriptions || res.data.history || []);
                    setSummary(res.data.summary || null);
                }
            } catch (err) {
                console.error('History error:', err);
            }
            setLoading(false);
        };
        loadHistory();
    }, [user, token]);

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

    // Chart only includes subscriptions the backend has verified as revenue
    // (real payment, not admin-granted or trial), and distributes each
    // subscription's amount across its active months.
    const paidHistory = history.filter(isCountedAsRevenue);

    // Build month-by-month distribution chart data
    const buildDistributionChart = () => {
        const byMonth = {};
        for (const s of paidHistory) {
            const totalPaid = getRevenueAmount(s);
            const duration  = s.durationMonths || 1;
            const perMonth  = totalPaid / duration;
            const start     = new Date(s.startDate);
            for (let i = 0; i < duration; i++) {
                const d   = new Date(start.getFullYear(), start.getMonth() + i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                byMonth[key] = (byMonth[key] || 0) + perMonth;
            }
        }
        return Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([period, earned]) => ({ period, earned: Math.round(earned) }));
    };

    // Build collected-per-subscription chart (one bar per payment event)
    const buildCollectedChart = () =>
        paidHistory
            .slice()
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .map(s => ({
                period:    fmtDate(s.startDate),
                collected: getRevenueAmount(s),
                status:    s.status,
                plan:      s.plan?.name || 'Plan',
            }));

    const distributionData = buildDistributionChart();
    const collectedData    = buildCollectedChart();

    const currency = summary?.currency || history[0]?.pricingSnapshot?.currency || 'RWF';

    // Prefer summary.totalPaid, computed and verified server-side.
    // Fallback only applies if an older API response omits it.
    const totalPaidDisplay = summary?.totalPaid != null
        ? summary.totalPaid
        : paidHistory.reduce((sum, s) => sum + getRevenueAmount(s), 0);

    const activeSubs  = history.filter(h => h.status === 'active').length;
    const firstSub    = history.slice(-1)[0];
    const latestSub   = history[0];
    const memberSince = firstSub?.startDate ? fmtDate(firstSub.startDate) : '—';

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-[#1A2E2A] text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-white/10">
                <p className="font-bold mb-1 text-gray-300 text-[10px]">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-gray-300 text-[10px]">{p.name}:</span>
                        <span className="font-black text-[10px]" style={{ color: p.color }}>
                            {p.value.toLocaleString()} {currency}
                        </span>
                    </p>
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="shrink-0 px-6 py-5 border-b border-slate-200 bg-slate-50/80">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="font-display font-bold text-lg text-slate-900">Revenue History</h2>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                    <Receipt className="w-3.5 h-3.5" />
                                    {fullName || 'Unknown User'} · Subscription journey
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                            <div className="w-8 h-8 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-medium">Loading subscription history…</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">

                        {/* Summary KPIs */}
                        <div className="p-6 border-b border-slate-100">
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                {/* FIX: totalPaid comes from summary.totalPaid (backend-filtered) */}
                                <div className="bg-[#195C51]/5 rounded-xl p-4 border border-[#195C51]/15">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Paid (Lifetime)</p>
                                    <p className="text-2xl font-bold text-[#195C51]">
                                        {totalPaidDisplay.toLocaleString()} {currency}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Real payments only — excludes failed, pending, trial &amp; admin-granted subscriptions</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Subscriptions</p>
                                    <p className="text-2xl font-bold text-slate-800">{history.length}</p>
                                    <p className="text-xs text-slate-400">{activeSubs} currently active</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Member Since</p>
                                    <p className="font-semibold text-slate-800">{memberSince}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Latest Plan</p>
                                    <p className="font-semibold text-slate-800">{latestSub?.plan?.name || '—'}</p>
                                </div>
                            </div>

                            {/* FIX: Two charts — collected per payment + monthly distribution */}
                            {paidHistory.length > 0 && (
                                <div className="space-y-5">

                                    {/* Chart 1: Cash collected — one bar per payment event */}
                                    {collectedData.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                Cash Collected Per Payment
                                            </p>
                                            <div className="h-[110px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={collectedData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                                                        <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                                                        <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={35}
                                                            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="collected" name="Collected" fill="#195C51" radius={[3, 3, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}

                                    {/* Chart 2: Monthly earned distribution — spreads subscriptions across their active months */}
                                    {distributionData.length > 1 && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                                Monthly Earned Distribution
                                            </p>
                                            <p className="text-[9px] text-slate-400 mb-2">
                                                Each subscription's value spread across its active months
                                            </p>
                                            <div className="h-[110px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={distributionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="earnedUserGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.18} />
                                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                                                        <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                                                        <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={35}
                                                            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="earned"
                                                            name="Earned"
                                                            stroke="#3B82F6"
                                                            fill="url(#earnedUserGrad)"
                                                            strokeWidth={2}
                                                            dot={{ r: 2.5, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {paidHistory.length === 0 && (
                                <div className="py-4 text-center text-slate-400 text-xs">No paid subscriptions to chart.</div>
                            )}
                        </div>

                        {/* Transaction List — shows ALL subscriptions for full history view */}
                        <div className="p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                                All Subscriptions ({history.length})
                            </h3>

                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                                    <Receipt className="w-10 h-10 opacity-20" />
                                    <p className="text-sm font-medium">No subscription history found.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((sub, i) => {
                                        const isFirst       = i === history.length - 1;
                                        const effectivePaid = getRevenueAmount(sub);
                                        // Backend-verified: whether this subscription counted toward revenue
                                        const countedAsRevenue = isCountedAsRevenue(sub);
                                        return (
                                            <div
                                                key={sub._id || i}
                                                className={`relative flex gap-4 pb-4 ${!isFirst ? 'border-b border-slate-100' : ''}`}
                                            >
                                                {/* Timeline dot */}
                                                <div className="flex flex-col items-center mt-1 shrink-0">
                                                    <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                                        sub.status === 'active'       ? 'bg-emerald-500' :
                                                        sub.status === 'cancelled'    ? 'bg-slate-300'   :
                                                        sub.status === 'expired'      ? 'bg-red-400'     :
                                                        sub.status === 'grace_period' ? 'bg-amber-400'   :
                                                        sub.status === 'failed'       ? 'bg-red-200'     :
                                                        'bg-blue-400'
                                                    }`} />
                                                    {!isFirst && (
                                                        <div className="w-0.5 flex-1 bg-slate-100 mt-1" style={{ minHeight: 24 }} />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-900">{sub.plan?.name || 'Unknown Plan'}</p>
                                                            <p className="text-[10px] text-slate-500">
                                                                {sub.durationMonths} month{sub.durationMonths > 1 ? 's' : ''} · {sub.paymentMethod?.toUpperCase()}
                                                            </p>
                                                        </div>
                                                        <StatusPill status={sub.status} />
                                                    </div>

                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                                                        <span className="flex items-center gap-1">
                                                            {/* FIX: show effective amount + revenue badge */}
                                                            <span className={`font-bold ${countedAsRevenue ? 'text-[#195C51]' : 'text-slate-400 line-through'}`}>
                                                                {effectivePaid.toLocaleString()} {sub.pricingSnapshot?.currency || ''}
                                                            </span>
                                                            {countedAsRevenue ? (
                                                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-black uppercase">Revenue</span>
                                                            ) : (
                                                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-black uppercase">Not counted</span>
                                                            )}
                                                        </span>
                                                        <span>Start: {fmtDate(sub.startDate)}</span>
                                                        <span>End: {fmtDate(sub.endDate)}</span>
                                                    </div>

                                                    {sub.status === 'cancelled' && sub.cancelledAt && (
                                                        <p className="text-[10px] text-red-400 mt-1">Cancelled on {fmtDate(sub.cancelledAt)}</p>
                                                    )}
                                                    {sub.status === 'grace_period' && sub.gracePeriodEnd && (
                                                        <p className="text-[10px] text-amber-600 mt-1">Grace ends {fmtDate(sub.gracePeriodEnd)}</p>
                                                    )}
                                                    {sub.status === 'failed' && (
                                                        <p className="text-[10px] text-red-400 mt-1">Payment failed — not counted as revenue</p>
                                                    )}
                                                    {sub.paymentMethod === 'admin_grant' && (
                                                        <p className="text-[10px] text-slate-400 mt-1">Granted by an administrator — no payment was made, not counted as revenue</p>
                                                    )}
                                                    {sub.isTrial && (
                                                        <p className="text-[10px] text-blue-400 mt-1">Trial — not counted as revenue</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RevenueInsights() {
    const token = returnToken();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('subscriptions');

    const [subs, setSubs]         = useState([]);
    const [subStats, setSubStats] = useState({ total: 0, page: 1, totalPages: 1 });
    const [subStatusFilter, setSubStatusFilter] = useState('');
    const [subsLoading, setSubsLoading]         = useState(true);
    const [planDistribution, setPlanDistribution] = useState([]);

    const [historyUser, setHistoryUser] = useState(null);

    const [plans, setPlans]       = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [editingPlan, setEditingPlan]   = useState(null);
    const [saving, setSaving]             = useState(false);

    const initialPlanState = {
        name: '', description: '', maxDevices: 1, maxShares: 0, maxSessions: 1,
        minDurationMonths: 1, maxDurationMonths: 12, pricePerMonth: '', features: ''
    };
    const [formData, setFormData] = useState(initialPlanState);

    const loadSubscriptions = useCallback(async (page = 1, status = subStatusFilter) => {
        setSubsLoading(true);
        try {
            const query = `?page=${page}&limit=10${status ? `&status=${status}` : ''}`;
            const res = await fetchData(`${presence_server}/api/admin/subscriptions/subscriptions${query}`, token);
            if (res.data) {
                setSubs(res.data.subscriptions || []);
                setSubStats({ total: res.data.total, page: res.data.currentPage, totalPages: res.data.totalPages });
            }
        } catch (err) {
            showNotification('Failed to load subscriptions'+err.message, 'error');
        }
        setSubsLoading(false);
    }, [token, subStatusFilter]);

    const loadGlobalStats = useCallback(async () => {
        try {
            const res = await fetchData(`${presence_server}/api/admin/analytics-users?limit=1`, token);
            if (res.data?.globalStats?.subscriptionBreakdown) {
                const breakdown = res.data.globalStats.subscriptionBreakdown;
                const planCounts = {};
                breakdown.forEach(item => {
                    if (['active', 'trial', 'grace_period'].includes(item.status)) {
                        const name = item.planName || 'Unknown Plan';
                        planCounts[name] = (planCounts[name] || 0) + item.count;
                    }
                });
                const CHART_COLORS = ['#195C51', '#2DC87A', '#F0A500', '#6B8BD4', '#8B5CF6'];
                const formattedData = Object.entries(planCounts).map(([name, value], index) => ({
                    name, value, color: CHART_COLORS[index % CHART_COLORS.length]
                }));
                setPlanDistribution(formattedData);
            }
        } catch (err) { console.error('Plan stats error:', err); }
    }, [token]);

    const loadPlans = useCallback(async () => {
        setPlansLoading(true);
        try {
            const res = await fetchData(`${presence_server}/api/admin/subscriptions/plans`, token);
            if (res.data) setPlans(res.data.plans || []);
        } catch (err) { showNotification('Failed to load plans'+err.message, 'error'); }
        setPlansLoading(false);
    }, [token]);

    useEffect(() => {
        if (activeTab === 'subscriptions') { loadSubscriptions(1); loadGlobalStats(); }
        if (activeTab === 'plans')         loadPlans();
    }, [activeTab]);

    const handleOpenModal = (plan = null) => {
        if (plan) {
            const rwfPrice = plan.pricing?.find(p => p.currency === 'RWF') || plan.pricing?.[0];
            setFormData({ ...plan, pricePerMonth: rwfPrice ? rwfPrice.pricePerMonth : '', features: plan.features ? plan.features.join(', ') : '' });
            setEditingPlan(plan);
        } else {
            setFormData(initialPlanState);
            setEditingPlan(null);
        }
        setIsModalOpen(true);
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
                pricing: [{ country: 'RW', currency: 'RWF', pricePerMonth: Number(formData.pricePerMonth) }]
            };
            const res = editingPlan
                ? await updateData(`${presence_server}/api/admin/subscriptions/plans/${editingPlan._id}`, payload, token)
                : await sendData(`${presence_server}/api/admin/subscriptions/plans`, payload, token);
            if (res.error) throw new Error(res.error);
            showNotification(`Plan ${editingPlan ? 'updated' : 'created'} successfully`, 'success');
            setIsModalOpen(false);
            loadPlans();
        } catch (err) { showNotification(err.message, 'error'); }
        setSaving(false);
    };

    const handleTogglePlanStatus = async (planId, isActive) => {
        try {
            const endpoint = isActive ? `/api/admin/subscriptions/plan/disable/${planId}` : `/api/admin/subscriptions/enable/${planId}`;
            const res = await patchData(`${presence_server}${endpoint}`, {}, token);
            if (res.error) throw new Error(res.error);
            showNotification(`Plan ${isActive ? 'disabled' : 'enabled'}`, 'success');
            loadPlans();
        } catch (err) { showNotification(err.message, 'error'); }
    };

    return (
        <div className="space-y-6 font-sans text-slate-900 pb-10">
            {historyUser && (
                <RevenueHistoryDrawer
                    user={historyUser}
                    onClose={() => setHistoryUser(null)}
                    token={token}
                />
            )}

            <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Revenue Insights</h1>
                <p className="text-slate-500 text-sm mt-1">Monitor subscription billing, revenue trends, and customer history.</p>
            </div>

            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
                <button onClick={() => setActiveTab('subscriptions')} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'subscriptions' ? 'bg-[#195C51] text-white shadow-md' : 'text-gray-500 hover:text-[#195C51]'}`}>
                    <Users size={16} /> Subscribers
                </button>
                <button onClick={() => setActiveTab('plans')} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'plans' ? 'bg-[#195C51] text-white shadow-md' : 'text-gray-500 hover:text-[#195C51]'}`}>
                    <CreditCard size={16} /> Plan Management
                </button>
            </div>

            {activeTab === 'subscriptions' && (
                <div className="animate-slide-entrance space-y-6">

                    <RevenueTrendChart token={token} />

                    {planDistribution.length > 0 && (
                        <Card className="p-6 flex flex-col md:flex-row items-center gap-8">
                            <div className="md:w-1/3 space-y-3">
                                <div className="flex items-center gap-2">
                                    <PieChartIcon className="w-6 h-6 text-[#195C51]" />
                                    <h2 className="font-display font-bold text-xl">Active Plan Distribution</h2>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Breakdown of your user base currently on active, trial, or grace period plans.
                                </p>
                            </div>
                            <div className="h-[220px] w-full md:w-2/3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-center p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                                            {planDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 'bold' }}
                                            formatter={(value) => [`${value} Subscribers`, 'Users']}
                                        />
                                        <Legend
                                            verticalAlign="middle" align="right" layout="vertical" iconType="circle"
                                            wrapperStyle={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}

                    <Card className="overflow-hidden">
                        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                            <div>
                                <h2 className="font-display font-semibold text-lg">Subscriber Directory</h2>
                                <p className="text-xs text-slate-500 mt-1">Total Records: {subStats.total} · 10 per page</p>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
                                {['', 'active', 'grace_period', 'expired', 'cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => { setSubStatusFilter(status); loadSubscriptions(1, status); }}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${subStatusFilter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {status === '' ? 'All' : status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Plan & Duration</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Revenue</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Timeline</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider text-right">History</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {subsLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : subs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                                No subscription records found.
                                            </td>
                                        </tr>
                                    ) : subs.map(sub => {
                                        const user = sub.user || {};
                                        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                                        // FIX: use effective amount in table too
                                        const effectivePaid    = getRevenueAmount(sub);
                                        const countedAsRevenue = isCountedAsRevenue(sub);
                                        return (
                                            <tr key={sub._id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <PrivacyNameToggle fullName={fullName || 'Unknown User'} />
                                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{maskEmailLocal(user.email)}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800">{sub.plan?.name || 'Unknown Plan'}</p>
                                                    <p className="text-xs text-slate-500">{sub.durationMonths} Month{sub.durationMonths > 1 ? 's' : ''}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusPill status={sub.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className={`font-bold ${countedAsRevenue ? 'text-[#195C51]' : 'text-slate-300'}`}>
                                                        {effectivePaid.toLocaleString()} {sub.pricingSnapshot?.currency}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sub.paymentMethod}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-medium text-slate-700">Start: {formatDate(sub.startDate)}</p>
                                                    <p className="text-xs font-medium text-slate-500">End: {formatDate(sub.endDate)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setHistoryUser(sub)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#195C51]/8 hover:bg-[#195C51] text-[#195C51] hover:text-white border border-[#195C51]/20 hover:border-[#195C51] rounded-lg text-[10px] font-black uppercase tracking-wider transition-all group-hover:opacity-100"
                                                    >
                                                        <Receipt className="w-3.5 h-3.5" />
                                                        History
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {subStats.totalPages > 1 && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Page {subStats.page} of {subStats.totalPages}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={subStats.page === 1}
                                        onClick={() => loadSubscriptions(subStats.page - 1)}
                                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-bold transition-all flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Prev
                                    </button>
                                    <button
                                        disabled={subStats.page >= subStats.totalPages}
                                        onClick={() => loadSubscriptions(subStats.page + 1)}
                                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-bold transition-all flex items-center gap-1"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {activeTab === 'plans' && (
                <div className="animate-slide-entrance space-y-6">
                    <div className="flex justify-end">
                        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-[#195C51] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0E3A32] shadow-md transition-all active:scale-95">
                            <Plus size={16} /> Create New Tier
                        </button>
                    </div>

                    {plansLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-[#195C51] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : plans.length === 0 ? (
                        <Card className="p-12 flex flex-col items-center text-center">
                            <CreditCard className="w-12 h-12 text-slate-200 mb-4" />
                            <h3 className="font-bold text-lg text-slate-700">No Plans Configured</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-6">Create your first subscription tier to start monetizing.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {plans.map(plan => {
                                const localPrice = plan.pricing?.find(p => p.currency === 'RWF') || plan.pricing?.[0];
                                return (
                                    <Card key={plan._id} className={`flex flex-col h-full transition-all ${plan.isActive ? 'border-[#195C51]/20 hover:shadow-lg' : 'opacity-70 grayscale-[30%]'}`}>
                                        <div className={`h-2 w-full ${plan.isActive ? 'bg-[#195C51]' : 'bg-slate-300'}`} />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-display font-bold text-xl text-slate-900">{plan.name}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">{plan.description || 'No description'}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {plan.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                            <div className="mb-6 flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-900">{localPrice?.pricePerMonth?.toLocaleString() || 0}</span>
                                                <span className="text-sm font-bold text-slate-500">{localPrice?.currency || 'RWF'}/mo</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mb-6">
                                                {[
                                                    { label: 'Devices',  val: plan.maxDevices  },
                                                    { label: 'Shares',   val: plan.maxShares   },
                                                    { label: 'Logins',   val: plan.maxSessions },
                                                ].map(l => (
                                                    <div key={l.label} className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                                                        <p className="text-sm font-black text-[#195C51]">{l.val}</p>
                                                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{l.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Features Included</h4>
                                                <ul className="space-y-2">
                                                    {plan.features?.map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                                            <CheckCircle2 className="w-4 h-4 text-[#195C51] shrink-0" /> {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="mt-8 pt-4 border-t border-slate-100 flex gap-2">
                                                <button onClick={() => handleOpenModal(plan)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200">
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button onClick={() => handleTogglePlanStatus(plan._id, plan.isActive)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors border ${plan.isActive ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}>
                                                    {plan.isActive ? <><PowerOff size={14} /> Disable</> : <><Power size={14} /> Enable</>}
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{editingPlan ? 'Edit Subscription Tier' : 'Create Subscription Tier'}</h2>
                                <p className="text-xs text-slate-500 font-medium">Define limits and pricing for this plan.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="plan-form" onSubmit={handleSavePlan} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Plan Name *</label>
                                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                                        <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Price Per Month (RWF) *</label>
                                        <input type="number" required min="0" value={formData.pricePerMonth} onChange={e => setFormData({ ...formData, pricePerMonth: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#195C51]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Max Devices *</label>
                                        <input type="number" required min="1" value={formData.maxDevices} onChange={e => setFormData({ ...formData, maxDevices: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Max Shares *</label>
                                        <input type="number" required min="0" value={formData.maxShares} onChange={e => setFormData({ ...formData, maxShares: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Max Login Sessions *</label>
                                        <input type="number" required min="1" value={formData.maxSessions} onChange={e => setFormData({ ...formData, maxSessions: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51]" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
                                            <span>Features</span>
                                            <span className="text-gray-400 font-normal normal-case">(Comma separated)</span>
                                        </label>
                                        <textarea rows="3" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} placeholder="Analytics dashboard, Priority support..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51] resize-none custom-scrollbar" />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-sm">
                                Cancel
                            </button>
                            <button type="submit" form="plan-form" disabled={saving} className="px-8 py-2.5 bg-[#195C51] text-white rounded-xl font-bold hover:bg-[#0E3A32] transition-colors shadow-md disabled:opacity-50 text-sm">
                                {saving ? 'Saving...' : 'Save Tier Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}