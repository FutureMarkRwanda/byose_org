import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { fetchData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";
import {
  MdTrendingUp,
  MdPeople,
  MdDevices,
  MdAttachMoney,
  MdWarning,
  MdRefresh,
  MdCreditCard,
  MdTimer,
  MdCheckCircle,
  MdErrorOutline,
  MdHourglassEmpty,
  MdSignalWifi4Bar,
  MdBubbleChart,
  MdInfoOutline,
  MdClose,
  MdWifi,
  MdTrendingDown,
  MdLocationOn,
  MdAdd,
  MdEdit,
  MdDelete,
  MdToggleOn,
  MdToggleOff,
  MdDownload,
  MdCalendarToday,
  MdCheckBox,
  MdMap,
  MdPictureAsPdf,
  MdEmojiEvents,
  MdFilterList,
  MdArrowUpward,
  MdArrowDownward,
  MdPrint,
  MdTableChart,
  MdCancel,
  MdPauseCircle,
  MdAccessTime,
  MdVerified,
} from "react-icons/md";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary: "#195C51",
  primaryLight: "#1E7060",
  accent: "#2DC87A",
  accentWarm: "#F0A500",
  danger: "#E84040",
  muted: "#6B7280", // bumped from #8FA99E for contrast
};
const COLORS = [
  C.primary,
  C.accent,
  C.accentWarm,
  "#6B8BD4",
  "#E84040",
  "#A78BFA",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const fmt = (val, cur = "RWF") => {
  if (val == null) return "—";
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ${cur}`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K ${cur}`;
  return `${val} ${cur}`;
};
const monthLabel = (y, m) =>
  `${MONTHS[(m || 1) - 1]} ${String(y || "").slice(2)}`;
const safe = (v) => (Array.isArray(v) ? v : []);

// ─── UI primitives ────────────────────────────────────────────────────────────
const Sk = ({ cls = "" }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${cls}`} />
);

const Info = ({ text }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const cb = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", cb);
    return () => document.removeEventListener("mousedown", cb);
  }, [open]);
  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-[#195C51] hover:bg-[#195C51]/10 transition-all"
      >
        <MdInfoOutline size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-80 bg-[#1A2E2A] text-white text-[11px] rounded-2xl px-4 py-4 shadow-2xl leading-relaxed border border-white/10">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2.5 right-3 text-gray-400 hover:text-white"
          >
            <MdClose size={12} />
          </button>
          {text}
        </div>
      )}
    </div>
  );
};

const Card = ({ title, subtitle, info, children, cls = "", action }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm ${cls}`}
  >
    <div className="flex items-start justify-between mb-4 gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#1A2E2A]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {action}
        {info && <Info text={info} />}
      </div>
    </div>
    {children}
  </div>
);

const KPI = ({
  label,
  value,
  sub,
  color = C.primary,
  info,
  loading,
  highlight,
}) => (
  <div
    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-sm ${
      highlight
        ? "border-[#2DC87A]/40 ring-1 ring-[#2DC87A]/20"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-start justify-between mb-2">
      {loading ? (
        <Sk cls="h-6 w-14" />
      ) : (
        <p
          className="text-xl sm:text-2xl font-black leading-none"
          style={color !== C.primary ? { color } : { color: "#1A2E2A" }}
        >
          {value ?? "—"}
        </p>
      )}
      {info && <Info text={info} />}
    </div>
    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1 leading-tight">
      {label}
    </p>
    {sub && (
      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight">
        {sub}
      </p>
    )}
  </div>
);

const Stat = ({
  icon: Icon,
  label,
  value,
  sub,
  color = C.primary,
  info,
  loading,
}) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      {info && <Info text={info} />}
    </div>
    {loading ? (
      <>
        <Sk cls="h-6 w-16 mb-1.5" />
        <Sk cls="h-3 w-24 mb-1" />
        <Sk cls="h-3 w-16" />
      </>
    ) : (
      <>
        <p className="text-xl sm:text-2xl font-black text-[#1A2E2A]">
          {value ?? "—"}
        </p>
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1 leading-tight">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight">
            {sub}
          </p>
        )}
      </>
    )}
  </div>
);

const Section = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 sm:gap-4 py-1">
    <div
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${C.primary}15` }}
    >
      <Icon size={18} style={{ color: C.primary }} />
    </div>
    <div>
      <h2 className="text-base sm:text-lg font-black text-[#1A2E2A]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[11px] sm:text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  </div>
);

const CTip = ({ active, payload, label, cur }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A2E2A] text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-white/10 max-w-[220px]">
      <p className="font-bold mb-1.5 text-gray-300 text-[10px]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-gray-300 text-[10px]">{p.name}:</span>
          <span
            className="font-black text-[10px] flex-shrink-0"
            style={{ color: p.color }}
          >
            {cur ? fmt(p.value, cur) : (p.value ?? 0).toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  );
};

const DurationPicker = ({ value, onChange, options }) => (
  <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all
          ${
            value === o.value
              ? "bg-[#195C51] text-white shadow-sm"
              : "text-gray-600 hover:text-[#195C51]"
          }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Tab = ({ label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
      ${
        active
          ? "bg-[#195C51] text-white shadow-md"
          : "text-gray-500 hover:text-[#195C51] hover:bg-[#195C51]/5"
      }`}
  >
    {label}
    {badge > 0 && (
      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

const Bar2 = ({ label, sublabel, value, color = C.primary, note }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1.5 gap-2">
      <span className="text-xs font-bold text-gray-700 truncate">{label}</span>
      <span className="text-xs font-black text-[#1A2E2A] flex-shrink-0">
        {sublabel}
      </span>
    </div>
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
    {note && <p className="text-[10px] text-gray-500 mt-1">{note}</p>}
  </div>
);

const AlertCard = ({ count, label, icon: Icon, desc, sev = "warn" }) => {
  const p = {
    warn: { text: "#B45309", icon: "#D97706" },
    danger: { text: "#DC2626", icon: "#EF4444" },
    ok: { text: "#16A34A", icon: "#22C55E" },
  }[sev];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${p.icon}18` }}
        >
          <Icon size={16} style={{ color: p.icon }} />
        </div>
        <p className="text-xl sm:text-2xl font-black" style={{ color: p.text }}>
          {count ?? "—"}
        </p>
      </div>
      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-700 mb-1 leading-tight">
        {label}
      </p>
      {desc && (
        <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
          {desc}
        </p>
      )}
    </div>
  );
};

const Empty = ({ msg = "No data yet" }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-50">
    <MdBubbleChart size={24} className="text-gray-300" />
    <p className="text-[11px] text-gray-500 text-center px-4">{msg}</p>
  </div>
);

const HC = ({ v, max }) => {
  const alpha = max > 0 && v > 0 ? 0.08 + (v / max) * 0.88 : 0;
  return (
    <div
      className="w-full aspect-square rounded-sm cursor-default"
      style={{
        background: alpha === 0 ? "#F3F4F6" : `rgba(25,92,81,${alpha})`,
      }}
      title={`${v} opens`}
    />
  );
};

const DeltaBadge = ({ val }) => {
  if (val == null || isNaN(val)) return null;
  const up = val >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full
      ${up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
    >
      {up ? <MdTrendingUp size={9} /> : <MdTrendingDown size={9} />}
      {Math.abs(val)}%
    </span>
  );
};

const Modal = ({ open, onClose, title, children, wide = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${
          wide ? "max-w-2xl" : "max-w-lg"
        } my-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black text-[#1A2E2A] uppercase tracking-wider">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-[#1A2E2A] hover:bg-gray-100 transition-all"
          >
            <MdClose size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  step,
  min,
}) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      step={step}
      min={min}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"
    />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS BADGE — subscription status pill
// ═══════════════════════════════════════════════════════════════════════════════
const StatusPill = ({ status }) => {
  const cfg = {
    active: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: MdVerified,
      label: "Active",
    },
    trial: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: MdAccessTime,
      label: "Trial",
    },
    grace_period: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      icon: MdPauseCircle,
      label: "Grace Period",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: MdCancel,
      label: "Cancelled",
    },
    expired: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: MdTimer,
      label: "Expired",
    },
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: MdHourglassEmpty,
      label: "Pending",
    },
    failed: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: MdErrorOutline,
      label: "Failed",
    },
  }[status] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
    icon: MdInfoOutline,
    label: status,
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${cfg.bg} ${cfg.text}`}
    >
      <Icon size={9} />
      {cfg.label}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function PresenceEyeAnalytics() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({});
  const [busy, setBusy] = useState({});
  const [ts, setTs] = useState(new Date());

  const [onlineDuration, setOnlineDuration] = useState("daily");
  const [lbPeriod, setLbPeriod] = useState("30d");
  const [lbSearch, setLbSearch] = useState("");
  const [lbSort, setLbSort] = useState({ key: "rank", dir: "asc" });
  const [reportDate,     setReportDate]     = useState(new Date().toISOString().slice(0, 10));

  const TABS = [
    "overview",
    "engagement",
    "revenue",
    "hardware",
    "map",
    "leaderboard",
    "plans",
    "report",
  ];
  const DURATION_OPTS = [
    { value: "daily", label: "Day" },
    { value: "weekly", label: "Week" },
    { value: "monthly", label: "Month" },
    { value: "yearly", label: "Year" },
  ];

  // ─── Data loader ───────────────────────────────────────────────────────────
  const load = useCallback(
    async (section, extra = {}) => {
      setBusy((p) => ({ ...p, [section]: true }));
      const token = returnToken();
      try {
        if (section === "overview") {
          const { data: d, error } = await fetchData(
            `${presence_server}/api/analytics/summary`,
            token,
          );
          if (!error && d) setData((p) => ({ ...p, overview: d }));
        } else if (section === "engagement") {
          const dur = extra.duration || onlineDuration;
          const [uR, hR, fR, frR] = await Promise.all([
            fetchData(
              `${presence_server}/api/analytics/engagement/active-users`,
              token,
            ),
            fetchData(
              `${presence_server}/api/analytics/engagement/heatmap`,
              token,
            ),
            fetchData(
              `${presence_server}/api/analytics/engagement/feature-adoption`,
              token,
            ),
            fetchData(
              `${presence_server}/api/analytics/engagement/frequency?duration=${dur}`,
              token,
            ),
          ]);
          setData((p) => ({
            ...p,
            engagement: {
              users: !uR.error && uR.data ? uR.data : {},
              heatmap: !hR.error && Array.isArray(hR.data) ? hR.data : [],
              features: !fR.error && fR.data ? fR.data : {},
              freq: !frR.error && frR.data ? frR.data : {},
            },
          }));
        } else if (section === "revenue") {
          const [rR, fR] = await Promise.all([
            fetchData(`${presence_server}/api/analytics/revenue`, token),
            fetchData(`${presence_server}/api/analytics/revenue/funnel`, token),
          ]);
          setData((p) => ({
            ...p,
            revenue: {
              rev: !rR.error && rR.data ? rR.data : {},
              funnel: !fR.error && fR.data ? fR.data : {},
            },
          }));
        } else if (section === "hardware") {
          const [hR, rR] = await Promise.all([
            fetchData(`${presence_server}/api/analytics/hardware`, token),
            fetchData(
              `${presence_server}/api/analytics/hardware/reliability`,
              token,
            ),
          ]);
          setData((p) => ({
            ...p,
            hardware: {
              hw: !hR.error && hR.data ? hR.data : {},
              rel: !rR.error && rR.data ? rR.data : {},
            },
          }));
        } else if (section === "map") {
          const { data: d, error } = await fetchData(
            `${presence_server}/api/analytics/hardware/locations`,
            token,
          );
          setData((p) => ({
            ...p,
            locations: !error && Array.isArray(d) ? d : [],
          }));
        } else if (section === "plans") {
          const { data: d, error } = await fetchData(
            `${presence_server}/api/analytics/plans`,
            token,
          );
          setData((p) => ({
            ...p,
            plans: !error && Array.isArray(d) ? d : [],
          }));
        } else if (section === "report") {
          const date = extra.date || new Date().toISOString().slice(0, 10);
          const { data: d, error } = await fetchData(
            `${presence_server}/api/analytics/daily-report?date=${date}`,
            token,
          );
          if (!error && d) setData((p) => ({ ...p, report: d }));
        } else if (section === "growth") {
          const { data: d, error } = await fetchData(
            `${presence_server}/api/analytics/growth`,
            token,
          );
          if (!error && d) setData((p) => ({ ...p, growth: d }));
        } else if (section === "leaderboard") {
          const per = extra.period || lbPeriod;
          const { data: d, error } = await fetchData(
            `${presence_server}/api/analytics/leaderboard?period=${per}&limit=100`,
            token,
          );
          if (!error && d) setData((p) => ({ ...p, leaderboard: d }));
        }
      } catch (e) {
        console.error(`[Analytics] ${section}:`, e);
      } finally {
        setBusy((p) => ({ ...p, [section]: false }));
        setTs(new Date());
      }
    },
    [onlineDuration],
  );

  useEffect(() => {
    load("overview");
    if (!["overview", "map", "plans", "report", "leaderboard"].includes(tab))
      load(tab);
    if (tab === "map") load("map");
    if (tab === "plans") load("plans");
    if (tab === "leaderboard") load("leaderboard");
  }, [tab, load]);

  const loading = (s) => !!busy[s];

  const handleDurationChange = (dur) => {
    setOnlineDuration(dur);
    load("engagement", { duration: dur });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const Overview = () => {
    const ov = data.overview || {};
    const mrrTrend = safe(ov.revenue?.mrrTrend).map((m) => ({
      month: monthLabel(m.year, m.month),
      Revenue: m.newRevenue || 0,
    }));
    const signups = safe(ov.growth?.monthlySignups)
      .slice(-6)
      .map((m) => ({
        month: monthLabel(m.year, m.month),
        Users: m.newUsers || 0,
      }));

    const cards = [
      {
        icon: MdPeople,
        color: C.primary,
        label: "Monthly Active Users",
        value: ov.activeUsers?.mau,
        sub: `DAU ${ov.activeUsers?.dau ?? "—"} · WAU ${
          ov.activeUsers?.wau ?? "—"
        }`,
        info: "How many people actually used the app this month — meaning they opened their gate at least once. DAU = today, WAU = this week.",
      },
      {
        icon: MdAttachMoney,
        color: C.accent,
        label: "Monthly Revenue",
        value: fmt(ov.revenue?.mrr || 0),
        sub: `ARPU: ${fmt(ov.revenue?.arpu || 0)}`,
        info: "The total subscription money coming in each month. ARPU is the average amount each paying customer brings in. Formula: MRR ÷ active subscribers.",
      },
      {
        icon: MdDevices,
        color: "#6B8BD4",
        label: "Devices Sold",
        value:
          safe(ov.hardware?.stateByModel)
            .filter((m) => m.state === "sold")
            .reduce((s, m) => s + m.count, 0) || "—",
        sub: `${ov.hardware?.agingInventory ?? "—"} aging in warehouse`,
      },
      {
        icon: MdCreditCard,
        color: C.accentWarm,
        label: "Active Subscriptions",
        value: ov.revenue?.totalActiveSubscriptions,
        sub: `Churn: ${ov.funnel?.churnRate ?? "—"}%`,
      },
    ];

    return (
      <div className="space-y-5 sm:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((c) => (
            <Stat key={c.label} {...c} loading={loading("overview")} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Revenue Trajectory" subtitle="Monthly collected">
            {loading("overview") ? (
              <Sk cls="h-44 w-full" />
            ) : mrrTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={mrrTrend}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={C.primary}
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="95%"
                        stopColor={C.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0F0F0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 8, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 8, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    width={35}
                  />
                  <Tooltip content={<CTip cur="RWF" />} />
                  <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke={C.primary}
                    fill="url(#gMrr)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty msg="Revenue will appear once subscriptions are activated" />
            )}
          </Card>
          <Card title="User Growth" subtitle="New signups — last 6 months">
            {loading("overview") ? (
              <Sk cls="h-44 w-full" />
            ) : signups.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={signups}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0F0F0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 8, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 8, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip content={<CTip />} />
                  <Line
                    type="monotone"
                    dataKey="Users"
                    stroke={C.accent}
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                      fill: C.accent,
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty msg="Signup trend will appear as users register" />
            )}
          </Card>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGAGEMENT (Usage tab)
  // ═══════════════════════════════════════════════════════════════════════════
  const Engagement = () => {
    const eng = data.engagement || {};
    // DAU/WAU/MAU come from the dedicated /active-users endpoint
    const users = eng.users || {};
    const heatmap = safe(eng.heatmap);
    const feats = eng.features || {};
    const freq = eng.freq || {};

    // Snapshot + trends come from /frequency endpoint
    const snap = freq.snapshot || {};
    // onlineTrend contains { date, onlineDevices, label, 'Online %' }
    const onlineTrend = safe(freq.onlineTrend);
    const dailyFreq = safe(freq.dailyFrequency);

    const grid = Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 24 }, (_, hr) => {
        const f = heatmap.find((h) => h.dayOfWeek === day + 1 && h.hour === hr);
        return f?.count || 0;
      }),
    );
    const maxH =
      heatmap.length > 0 ? Math.max(...heatmap.map((h) => h.count || 0), 1) : 1;

    const sharingPct = parseFloat(feats.sharing?.percent || 0);
    const multiPct = parseFloat(feats.multiDevice?.percent || 0);

    const avgFreq =
      dailyFreq.length > 0
        ? (
            dailyFreq.reduce(
              (s, r) => s + parseFloat(r.avgOpensPerDevice || 0),
              0,
            ) / dailyFreq.length
          ).toFixed(2)
        : null;
    const formatTrendLabel = (dateStr) => {
      if (!dateStr) return "";
      // Yearly: "2025"
      if (/^\d{4}$/.test(dateStr)) return dateStr;
      // Weekly: "2025-W04"
      if (/^\d{4}-W\d{2}$/.test(dateStr)) {
        const [, week] = dateStr.split("-W");
        return `Wk ${parseInt(week, 10)}`;
      }
      // Monthly: "2025-01"
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        const [year, month] = dateStr.split("-");
        return `${MONTHS[parseInt(month, 10) - 1]} '${year.slice(2)}`;
      }
      // Daily: "2025-01-15"
      const d = new Date(dateStr);
      return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
    };

    return (
      <div className="space-y-5 sm:space-y-8">
        <Section
          icon={MdBubbleChart}
          title="Engagement & Adoption"
          subtitle="Is the app becoming a daily habit?"
        />

        {/* ── DAU / WAU / MAU — sourced from /active-users ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Daily Active Devices",
              value: users.dau,
              sub: "Unique devices active today",
              info: "Count of distinct devices (serialNumbers) that triggered at least one gate-open event in the last 24 hours. Admin devices excluded.",
            },
            {
              label: "Weekly Active Devices",
              value: users.wau,
              sub: "Unique devices — last 7 days",
              info: "Count of distinct devices with at least one gate-open event in the past 7 days. Admin devices excluded.",
            },
            {
              label: "Monthly Active Devices",
              value: users.mau,
              sub: "Unique devices — last 30 days",
              info: "Count of distinct devices with at least one gate-open event in the past 30 days. Admin devices excluded.",
            },
            {
              label: "Avg Opens / User / Day",
              value: users.avgOpensPerUserPerDay ?? "—",
              sub: "30-day average",
              info: "On average, how many times per day does each active user open their gate? Formula: total gate opens ÷ active users ÷ days in period.",
            },
          ].map((c) => (
            <KPI key={c.label} {...c} loading={loading("engagement")} />
          ))}
        </div>

        {/* ── Live Online Devices + Online vs Sold Trend ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${C.accent}18` }}
              >
                <MdWifi size={20} style={{ color: C.accent }} />
              </div>
              <Info
                text={
                  "How many of your sold devices have been active in the last 3 days. 'Live right now' means they sent a signal in the last 15 minutes."
                }
              />
            </div>
            {loading("engagement") ? (
              <>
                <Sk cls="h-9 w-20 mb-2" />
                <Sk cls="h-3 w-28" />
              </>
            ) : (
              <>
                <div>
                  <p
                    className="text-4xl font-black"
                    style={{ color: C.accent }}
                  >
                    {snap.onlineNow ?? "—"}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                    Devices Online (3-day)
                  </p>
                  {snap.totalSold > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {snap.onlinePercent}% of {snap.totalSold} sold
                    </p>
                  )}
                  {snap.liveOnline > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-[10px] text-green-600 font-bold">
                        {snap.liveOnline} live right now
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${snap.onlinePercent || 0}%`,
                      background: C.accent,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-500">0</span>
                  <span className="text-[9px] text-gray-500">
                    {snap.totalSold ?? "—"} sold
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Online Devices vs Sold — uses 'Online %' key from backend */}
          <div className="sm:col-span-2">
            <Card
              title="Online Devices vs Sold — Trend"
              subtitle="% of sold fleet online over time"
              info={
                "Shows what percentage of your sold fleet is active over time.\n\nAbove 80% = healthy.\nBelow 50% = a problem worth investigating — devices may be offline, broken, or abandoned.\n\nFormula: active devices in period ÷ total sold × 100.\n\nSource: DeviceUsageEvent distinct serialNumbers per day ÷ total sold remotes."
              }
              action={
                <DurationPicker
                  value={onlineDuration}
                  onChange={handleDurationChange}
                  options={DURATION_OPTS}
                />
              }
            >
              {loading("engagement") ? (
                <Sk cls="h-52 w-full" />
              ) : onlineTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart
                    data={onlineTrend}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gOnl" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={C.accent}
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor={C.accent}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F0F0F0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatTrendLabel}
                      tick={{ fontSize: 8, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 8, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      width={36}
                    />
                    <Tooltip content={<CTip />} />
                    <ReferenceLine
                      y={80}
                      stroke={C.accent}
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                      label={{
                        value: "80% target",
                        position: "insideTopRight",
                        fontSize: 8,
                        fill: C.accent,
                      }}
                    />
                    <ReferenceLine
                      y={50}
                      stroke={C.danger}
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                      label={{
                        value: "50% warn",
                        position: "insideTopRight",
                        fontSize: 8,
                        fill: C.danger,
                      }}
                    />
                    {/* Key field from backend: 'Online %' */}
                    <Line
                      type="monotone"
                      dataKey="Online %"
                      stroke={C.accent}
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        fill: C.accent,
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty msg="Online trend populates as devices go online over multiple days. The backend computes (active devices ÷ total sold) × 100 per day." />
              )}
              <div className="flex items-center gap-4 mt-2 pl-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 border-t-2 border-dashed"
                    style={{ borderColor: C.accent }}
                  />
                  <span className="text-[9px] text-gray-500 font-bold">
                    80% — Good
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 border-t-2 border-dashed"
                    style={{ borderColor: C.danger }}
                  />
                  <span className="text-[9px] text-gray-500 font-bold">
                    50% — Warning
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Heatmap + Feature Adoption */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card
            title="Peak Usage Heatmap"
            subtitle="Gate opens by hour × day (30 days)"
            info="Shows what time of day and day of the week people use their gates the most. Darker = more activity."
          >
            {loading("engagement") ? (
              <Sk cls="h-48 w-full" />
            ) : (
              <div className="overflow-x-auto">
                <div style={{ minWidth: 280 }}>
                  <div className="flex items-center gap-px mb-1 pl-8">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 text-center font-bold"
                        style={{ fontSize: "6px", color: "#9CA3AF" }}
                      >
                        {i % 6 === 0 ? `${i}h` : ""}
                      </div>
                    ))}
                  </div>
                  {grid.map((row, di) => (
                    <div key={di} className="flex items-center gap-px mb-px">
                      <div
                        className="w-7 text-right pr-1 flex-shrink-0 font-black text-gray-500"
                        style={{ fontSize: "7px" }}
                      >
                        {DAYS[di].slice(0, 2)}
                      </div>
                      {row.map((v, hi) => (
                        <div key={hi} className="flex-1">
                          <HC v={v} max={maxH} />
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-1.5 mt-3">
                    <span
                      style={{ fontSize: "8px" }}
                      className="text-gray-500 font-bold"
                    >
                      Less
                    </span>
                    {[0.06, 0.25, 0.5, 0.75, 0.96].map((v, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm"
                        style={{ background: `rgba(25,92,81,${v})` }}
                      />
                    ))}
                    <span
                      style={{ fontSize: "8px" }}
                      className="text-gray-500 font-bold"
                    >
                      More
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card
              title="Feature Adoption"
              subtitle="% of device owners using advanced features"
              info={
                "SHARING RATE = owners who shared gate access with at least one person ÷ total device owners × 100.\n\nMULTI-DEVICE RATE = owners with 2 or more devices."
              }
            >
              {loading("engagement") ? (
                <Sk cls="h-48 w-full" />
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-[#2DC87A]/5 rounded-xl border border-[#2DC87A]/20">
                    <div className="flex justify-between items-baseline mb-2">
                      <div>
                        <span className="text-xs font-black text-[#195C51]">
                          Sharing Rate
                        </span>
                        <span className="ml-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                          KEY METRIC
                        </span>
                      </div>
                      <span className="text-sm font-black text-[#195C51]">
                        {sharingPct}%{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          ({feats.sharing?.count || 0} owners)
                        </span>
                      </span>
                    </div>
                    <div className="h-3 bg-[#2DC87A]/15 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(sharingPct, 100)}%`,
                          background: C.accent,
                        }}
                      />
                    </div>
                  </div>
                  <Bar2
                    label="Multi-Device Owners"
                    sublabel={`${multiPct}%  (${
                      feats.multiDevice?.count || 0
                    } users)`}
                    value={multiPct}
                    color={C.primary}
                    note="Owners with 2+ devices — best upsell targets."
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REVENUE — rebuilt subscription-centric analytics
  // ═══════════════════════════════════════════════════════════════════════════

  const Revenue = () => {
    const funnel = data.revenue?.funnel || {};

    // Only the 4 relevant statuses for the pie
    const STATUS_KEYS = ["active", "grace_period", "cancelled", "expired"];
    const STATUS_COLORS = {
      active: C.accent,
      grace_period: C.accentWarm,
      cancelled: C.danger,
      expired: "#9CA3AF",
    };
    const STATUS_LABELS = {
      active: "Active",
      grace_period: "Grace Period",
      cancelled: "Cancelled",
      expired: "Expired",
    };

    const allStatuses = safe(funnel.statusBreakdown);
    const pieData = STATUS_KEYS.map((k) => ({
      key: k,
      name: STATUS_LABELS[k],
      value: allStatuses.find((s) => s._id === k)?.count || 0,
      color: STATUS_COLORS[k],
    })).filter((s) => s.value > 0);

    const steps = funnel.funnel
      ? [
          {
            name: "Registered",
            value: funnel.funnel.registeredUsers || 0,
            color: "#6B8BD4",
          },
          {
            name: "Has Device",
            value: funnel.funnel.usersWithDevices || 0,
            color: C.primary,
          },
          {
            name: "Subscriber",
            value: funnel.funnel.usersWithSubscriptions || 0,
            color: C.accent,
          },
        ]
      : [];
    const funnelTop = steps[0]?.value || 1;

    // ── Subscriber list state ──────────────────────────────────────────────────
    const [subList, setSubList] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const [subPage, setSubPage] = useState(1);
    const [subPages, setSubPages] = useState(1);
    const [subStatus, setSubStatus] = useState("all");
    const [subListBusy, setSubListBusy] = useState(false);

    const loadSubscribers = useCallback(
      async (status = subStatus, page = 1) => {
        setSubListBusy(true);
        try {
          const token = returnToken();
          const qs = `status=${
            status === "all" ? "" : status
          }&page=${page}&limit=50`;
          const { data: d, error } = await fetchData(
            `${presence_server}/api/analytics/revenue/subscribers?${qs}`,
            token,
          );
          if (!error && d) {
            setSubList(d.rows || []);
            setSubTotal(d.total || 0);
            setSubPage(d.page || 1);
            setSubPages(d.pages || 1);
          }
        } catch (e) {
          console.error("[Revenue] subscriber list:", e);
        } finally {
          setSubListBusy(false);
        }
      },
      [subStatus],
    );

    useEffect(() => {
      loadSubscribers();
    }, []);

    const handleStatusFilter = (s) => {
      setSubStatus(s);
      loadSubscribers(s, 1);
    };

    // ── Helpers ────────────────────────────────────────────────────────────────
    const fmtDate = (d) =>
      d
        ? new Date(d).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "2-digit",
          })
        : "—";
    const fmtAmt = (amt, cur) =>
      amt != null ? `${amt.toLocaleString()} ${cur || ""}` : "—";

    const StatusPill = ({ status }) => {
      const cfg = {
        active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
        grace_period: {
          bg: "bg-amber-100",
          text: "text-amber-800",
          label: "Grace Period",
        },
        cancelled: {
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Cancelled",
        },
        expired: { bg: "bg-gray-100", text: "text-gray-600", label: "Expired" },
      }[status] || { bg: "bg-gray-100", text: "text-gray-600", label: status };
      return (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black ${cfg.bg} ${cfg.text}`}
        >
          {cfg.label}
        </span>
      );
    };

    return (
      <div className="space-y-5 sm:space-y-8">
        <Section
          icon={MdAttachMoney}
          title="Revenue & Subscription Health"
          subtitle="Subscriber states and conversion"
        />

        {/* ── Subscription Status Counts ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STATUS_KEYS.map((k) => {
            const count = allStatuses.find((s) => s._id === k)?.count || 0;
            return (
              <div
                key={k}
                className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm"
              >
                <p className="text-2xl font-black text-[#1A2E2A]">
                  {loading("revenue") ? "—" : count}
                </p>
                <p
                  className="text-[9px] font-black uppercase tracking-widest mt-1 leading-tight"
                  style={{ color: STATUS_COLORS[k] }}
                >
                  {STATUS_LABELS[k]}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Pie + Funnel ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card
            title="Subscription Status Mix"
            info="Breakdown of active, grace period, cancelled and expired subscriptions."
          >
            {loading("revenue") ? (
              <Sk cls="h-56 w-full" />
            ) : pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} subscribers`} />
                    <Legend
                      wrapperStyle={{
                        fontSize: "9px",
                        fontWeight: "800",
                        textTransform: "uppercase",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pieData.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: s.color }}
                        />
                        <span className="text-xs font-bold text-gray-700">
                          {s.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${
                                pieData[0]?.value > 0
                                  ? (
                                      (s.value / pieData[0].value) *
                                      100
                                    ).toFixed(0)
                                  : 0
                              }%`,
                              background: s.color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-black text-[#1A2E2A] w-6 text-right">
                          {s.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Empty msg="No subscription data yet" />
            )}
          </Card>

          <Card
            title="Conversion Funnel"
            info="Registered → Has Device → Subscriber. Shows where people drop off."
          >
            {loading("revenue") ? (
              <Sk cls="h-56 w-full" />
            ) : steps.length > 0 ? (
              <div className="space-y-4 pt-2">
                {steps.map((s) => {
                  const p =
                    funnelTop > 0
                      ? ((s.value / funnelTop) * 100).toFixed(0)
                      : 0;
                  return (
                    <div key={s.name}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-xs font-bold text-gray-700">
                          {s.name}
                        </span>
                        <span className="text-xs font-black text-[#1A2E2A]">
                          {(s.value || 0).toLocaleString()}{" "}
                          <span className="text-gray-400 font-normal">
                            ({p}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${p}%`, background: s.color }}
                        />
                      </div>
                    </div>
                  );
                })}
                {funnel.trial && (
                  <div className="mt-2 p-3 bg-[#195C51]/5 rounded-xl border border-[#195C51]/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#195C51]">
                          Trial → Paid
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {funnel.trial.trialsToPaid} of{" "}
                          {funnel.trial.totalTrials}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-[#195C51]">
                        {funnel.trial.conversionRate}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Empty msg="Funnel populates as users subscribe" />
            )}
          </Card>
        </div>

        {/* ── Subscriber Table ── */}
        <Card
          title={`Subscribers — ${subTotal.toLocaleString()} total`}
          subtitle="All users with active, grace period, cancelled or expired subscriptions"
          action={
            <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
              {["all", "active", "grace_period", "cancelled", "expired"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                  ${
                    subStatus === s
                      ? "bg-[#195C51] text-white shadow-sm"
                      : "text-gray-600 hover:text-[#195C51]"
                  }`}
                  >
                    {s === "all"
                      ? "All"
                      : s === "grace_period"
                      ? "Grace"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ),
              )}
            </div>
          }
        >
          {subListBusy ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Sk key={i} cls="h-12 w-full" />
              ))}
            </div>
          ) : subList.length === 0 ? (
            <Empty msg="No subscribers match the selected filter" />
          ) : (
            <>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {[
                        "Customer",
                        "Plan",
                        "Status",
                        "Amount Paid",
                        "Subscribed On",
                        "Expires / Ended",
                      ].map((col) => (
                        <th
                          key={col}
                          className="py-3 px-3 text-[9px] font-black uppercase tracking-widest text-gray-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subList.map((s, i) => (
                      <tr
                        key={String(s.subscriptionId)}
                        className="border-b border-gray-50 hover:bg-[#195C51]/[0.02] transition-colors"
                      >
                        {/* Customer */}
                        <td className="py-3 px-3">
                          <p className="text-xs font-black text-[#1A2E2A]">
                            {s.ownerName}
                          </p>
                          {s.ownerEmail && (
                            <p className="text-[9px] text-gray-500 font-mono">
                              {s.ownerEmail}
                            </p>
                          )}
                        </td>
                        {/* Plan */}
                        <td className="py-3 px-3">
                          <p className="text-xs font-bold text-gray-700">
                            {s.planName}
                          </p>
                          <p className="text-[9px] text-gray-500">
                            {s.durationMonths} month
                            {s.durationMonths !== 1 ? "s" : ""} ·{" "}
                            {s.paymentMethod?.toUpperCase()}
                          </p>
                        </td>
                        {/* Status */}
                        <td className="py-3 px-3">
                          <StatusPill status={s.status} />
                          {s.status === "grace_period" && s.gracePeriodEnd && (
                            <p className="text-[9px] text-amber-600 mt-0.5">
                              Until {fmtDate(s.gracePeriodEnd)}
                            </p>
                          )}
                          {s.status === "cancelled" && s.cancelledAt && (
                            <p className="text-[9px] text-red-400 mt-0.5">
                              On {fmtDate(s.cancelledAt)}
                            </p>
                          )}
                        </td>
                        {/* Amount */}
                        <td className="py-3 px-3">
                          <p className="text-xs font-black text-[#1A2E2A]">
                            {fmtAmt(s.amountPaid, s.currency)}
                          </p>
                          {s.pricePerMonth && (
                            <p className="text-[9px] text-gray-500">
                              {s.pricePerMonth.toLocaleString()} {s.currency}/mo
                            </p>
                          )}
                        </td>
                        {/* Subscribed on */}
                        <td className="py-3 px-3">
                          <p className="text-xs font-bold text-gray-700">
                            {fmtDate(s.startDate)}
                          </p>
                          <p className="text-[9px] text-gray-500">
                            Created {fmtDate(s.createdAt)}
                          </p>
                        </td>
                        {/* Expires / Ended */}
                        <td className="py-3 px-3">
                          <p className="text-xs font-bold text-gray-700">
                            {fmtDate(s.endDate)}
                          </p>
                          {s.autoRenew && (
                            <p className="text-[9px] text-green-500">
                              Auto-renew on
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {subPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-500">
                    Page {subPage} of {subPages} · {subTotal} total
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        loadSubscribers(subStatus, subPage - 1);
                      }}
                      disabled={subPage <= 1}
                      className="px-3 py-1.5 text-[10px] font-black text-[#195C51] border border-gray-200 rounded-lg hover:border-[#195C51]/30 disabled:opacity-40 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => {
                        loadSubscribers(subStatus, subPage + 1);
                      }}
                      disabled={subPage >= subPages}
                      className="px-3 py-1.5 text-[10px] font-black text-[#195C51] border border-gray-200 rounded-lg hover:border-[#195C51]/30 disabled:opacity-40 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    );
  };
  // ═══════════════════════════════════════════════════════════════════════════
  // HARDWARE
  // ═══════════════════════════════════════════════════════════════════════════
  const Hardware = () => {
    const hw = data.hardware?.hw || {};
    const rel = data.hardware?.rel || {};
    const sales = safe(hw.salesTrend).map((m) => ({
      month: monthLabel(m.year, m.month),
      "Units Sold": m.unitsSold || 0,
    }));
    const modelMap = {};
    safe(hw.stateByModel).forEach((item) => {
      const k = item.modelType;
      if (!modelMap[k])
        modelMap[k] = { model: k.toUpperCase(), instore: 0, sold: 0 };
      modelMap[k][item.state] = item.count;
    });
    const models = Object.values(modelMap);
    const relCards = [
      {
        label: "Total Sold",
        value: rel.totalSoldDevices,
        sub: "Deployed with customers",
        color: C.primary,
        info: "How many Presence Eye devices are currently deployed with customers.",
      },
      {
        label: "Silent Devices",
        value: rel.silentDevicesCount,
        sub: `${rel.silentDevicesPercent ?? "—"}% offline >3d`,
        color: C.danger,
        info: "Devices that haven't connected in more than 3 days.",
      },
      {
        label: "Avg Uptime",
        value: `${rel.avgDailyUptimeHours ?? "—"}h`,
        sub: "Per device — 30d avg",
        color: C.accent,
        info: "On average, how many hours per day is each device online.",
      },
      {
        label: "Aging Stock",
        value: hw.agingInventory,
        sub: "In warehouse >60 days",
        color: C.accentWarm,
        info: "Devices sitting unsold in the warehouse for more than 60 days.",
      },
    ];
    return (
      <div className="space-y-5 sm:space-y-8">
        <Section
          icon={MdDevices}
          title="Hardware & Inventory"
          subtitle="Sales, reliability and firmware"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {relCards.map((c) => (
            <KPI key={c.label} {...c} loading={loading("hardware")} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card
            title="Device Sales — 12 Months"
            subtitle="Units sold per month"
          >
            {loading("hardware") ? (
              <Sk cls="h-52 w-full" />
            ) : sales.length > 0 ? (
              <ResponsiveContainer width="100%" height={215}>
                <AreaChart
                  data={sales}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B8BD4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6B8BD4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0F0F0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 8, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 8, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={25}
                  />
                  <Tooltip content={<CTip />} />
                  <Area
                    type="monotone"
                    dataKey="Units Sold"
                    stroke="#6B8BD4"
                    fill="url(#gS)"
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                      fill: "#6B8BD4",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty msg="Sales data will appear as devices are sold" />
            )}
          </Card>
          <Card
            title="Inventory by Model"
            info="For each product model, how many are still in stock vs. sold to customers."
          >
            {loading("hardware") ? (
              <Sk cls="h-52 w-full" />
            ) : models.length > 0 ? (
              <ResponsiveContainer width="100%" height={215}>
                <BarChart
                  data={models}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0F0F0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="model"
                    tick={{ fontSize: 9, fill: "#6B7280", fontWeight: "800" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 8, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={25}
                  />
                  <Tooltip content={<CTip />} />
                  <Bar
                    dataKey="instore"
                    name="In Store"
                    fill="#E5E7EB"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="sold"
                    name="Sold"
                    fill={C.primary}
                    radius={[3, 3, 0, 0]}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "9px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty msg="Inventory loading…" />
            )}
          </Card>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAP VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const MapView = () => {
    const locations = safe(data.locations);
    const mapRef = useRef(null);
    const leafletRef = useRef(null);
    const markersRef = useRef([]);
    const [selected, setSelected] = useState(null);
    const [leafletReady, setLeafletReady] = useState(false);
    const [filterModel, setFilterModel] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const hasLocations = locations.length > 0;
    const models = [
      "all",
      ...new Set(locations.map((d) => d.modelType).filter(Boolean)),
    ];
    const isEnabled = (d) => Boolean(d.isEnabled);
    const filtered = locations.filter((d) => {
      if (filterModel !== "all" && d.modelType !== filterModel) return false;
      if (filterStatus === "enabled" && !isEnabled(d)) return false;
      if (filterStatus === "disabled" && isEnabled(d)) return false;
      return true;
    });
    const enabledCount = locations.filter((d) => isEnabled(d)).length;
    const disabledCount = locations.filter((d) => !isEnabled(d)).length;
    const maskName = (n) => {
      if (!n || n === "Unknown") return "Unknown";
      const p = n.trim().split(/\s+/);
      return p.length === 1 ? p[0] : `${p[0]} ${p[1][0].toUpperCase()}.`;
    };
    const maskEmail = (e) => {
      if (!e) return null;
      const at = e.indexOf("@");
      if (at === -1) return `${e.slice(0, 3)}***`;
      return `${e.slice(0, 3)}${"*".repeat(Math.max(3, at - 3))}${e.slice(at)}`;
    };
    useEffect(() => {
      if (document.getElementById("lf-pulse-style")) return;
      const s = document.createElement("style");
      s.id = "lf-pulse-style";
      s.textContent = `@keyframes lf-pulse{0%{transform:scale(1);opacity:.75}70%{transform:scale(2.4);opacity:0}100%{transform:scale(2.4);opacity:0}}.lf-pulse-ring{position:absolute;top:50%;left:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#22C55E;animation:lf-pulse 1.8s ease-out infinite;pointer-events:none;z-index:0}`;
      document.head.appendChild(s);
    }, []);
    useEffect(() => {
      if (window.L) {
        setLeafletReady(true);
        return;
      }
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setLeafletReady(true);
      document.head.appendChild(script);
    }, []);
    useEffect(() => {
      if (!leafletReady || !mapRef.current || !hasLocations) return;
      const L = window.L;
      if (!leafletRef.current) {
        leafletRef.current = L.map(mapRef.current, { zoomControl: true });
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution: "&copy; OpenStreetMap &copy; CARTO",
            subdomains: "abcd",
            maxZoom: 20,
          },
        ).addTo(leafletRef.current);
      }
      const map = leafletRef.current;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (filtered.length === 0) return;
      const bounds = [];
      filtered.forEach((d) => {
        const enabled = isEnabled(d);
        const dotColor = enabled ? "#22C55E" : "#9CA3AF";
        const strokeColor = enabled ? "#16A34A" : "#6B7280";
        const modelLetter = (d.modelType || "?")[0].toUpperCase();
        const displayName = maskName(d.owner);
        const displayEmail = maskEmail(d.ownerEmail);
        const pulseDiv = enabled ? `<div class="lf-pulse-ring"></div>` : "";
        const icon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:36px;height:46px;">${pulseDiv}<div style="position:absolute;top:0;left:0;width:36px;height:46px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.22));z-index:1;"><svg viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg" width="36" height="46"><path d="M18 0C8.059 0 0 8.059 0 18c0 11.941 18 28 18 28S36 29.941 36 18C36 8.059 27.941 0 18 0z" fill="${dotColor}" stroke="${strokeColor}" stroke-width="1.4"/><circle cx="18" cy="18" r="9" fill="white" opacity="0.93"/><text x="18" y="22.5" text-anchor="middle" font-size="10" font-weight="900" fill="${strokeColor}" font-family="system-ui,sans-serif">${modelLetter}</text></svg></div></div>`,
          iconSize: [36, 46],
          iconAnchor: [18, 46],
          popupAnchor: [0, -48],
        });
        const marker = L.marker([d.lat, d.lng], { icon });
        marker.bindPopup(
          `<div style="font-family:system-ui;min-width:190px;padding:4px 0"><strong style="font-size:13px">${
            d.label || d.serialNumber
          }</strong><p style="font-size:10px;color:#6B7280;margin:4px 0">${
            d.serialNumber
          }</p><div style="background:#F8F9FA;border-radius:8px;padding:8px;font-size:11px;line-height:1.9"><div><b>Model:</b> ${(
            d.modelType || "?"
          ).toUpperCase()}</div><div><b>Status:</b> <span style="color:${dotColor};font-weight:700">${
            enabled ? "● Enabled" : "● Disabled"
          }</span></div>${
            displayName ? `<div><b>Owner:</b> ${displayName}</div>` : ""
          }${displayEmail ? `<div><b>Email:</b> ${displayEmail}</div>` : ""}${
            d.address ? `<div><b>Address:</b> ${d.address}</div>` : ""
          }</div></div>`,
          { maxWidth: 260 },
        );
        marker.on("click", () => setSelected(d));
        marker.addTo(map);
        markersRef.current.push(marker);
        bounds.push([d.lat, d.lng]);
      });
      if (bounds.length > 0)
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    }, [leafletReady, filtered.length, filterModel, filterStatus, locations]);
    useEffect(() => {
      return () => {
        if (leafletRef.current) {
          leafletRef.current.remove();
          leafletRef.current = null;
        }
      };
    }, []);
    const flyTo = (d) => {
      setSelected(d);
      if (!leafletRef.current) return;
      leafletRef.current.flyTo([d.lat, d.lng], 16, { duration: 1.1 });
      const idx = filtered.findIndex((f) => f.serialNumber === d.serialNumber);
      const marker = markersRef.current[idx];
      if (marker) marker.openPopup();
    };

    return (
      <div className="space-y-5 sm:space-y-8">
        <Section
          icon={MdMap}
          title="Device Locations"
          subtitle="Where are your sold devices deployed?"
        />
        <div className="grid grid-cols-3 gap-3">
          <KPI
            label="Devices on Map"
            value={locations.length}
            sub="With GPS data"
            loading={loading("map")}
            color={C.primary}
          />
          <KPI
            label="Enabled"
            value={enabledCount}
            sub="Enabled by owner"
            loading={loading("map")}
            color="#22C55E"
          />
          <KPI
            label="Disabled"
            value={disabledCount}
            sub="Disabled by owner"
            loading={loading("map")}
            color="#9CA3AF"
          />
        </div>
        {loading("map") ? (
          <Sk cls="h-[500px] w-full" />
        ) : !hasLocations ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center gap-4">
            <MdLocationOn size={40} className="text-gray-200" />
            <p className="font-black text-[#1A2E2A]">
              No device locations available
            </p>
            <button
              onClick={() => load("map")}
              className="flex items-center gap-2 px-4 py-2 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors"
            >
              <MdRefresh size={14} /> Refresh
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                  Model
                </span>
                <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
                  {models.map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterModel(m)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        filterModel === m
                          ? "bg-[#195C51] text-white shadow-sm"
                          : "text-gray-600 hover:text-[#195C51]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                  Status
                </span>
                <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
                  {[
                    { value: "all", label: "All" },
                    { value: "enabled", label: "Enabled" },
                    { value: "disabled", label: "Disabled" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setFilterStatus(s.value)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        filterStatus === s.value
                          ? "bg-[#195C51] text-white shadow-sm"
                          : "text-gray-600 hover:text-[#195C51]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 ml-auto">
                {filtered.length} of {locations.length} shown
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {!leafletReady ? (
                  <div className="h-[440px] flex items-center justify-center bg-gray-50">
                    <div className="w-8 h-8 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div
                    ref={mapRef}
                    style={{ height: 440, width: "100%", zIndex: 0 }}
                  />
                )}
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1A2E2A]">
                    Devices
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {filtered.length} listed
                  </p>
                </div>
                <div
                  className="overflow-y-auto flex-1"
                  style={{ maxHeight: 440 }}
                >
                  {filtered.map((d) => {
                    const enabled = isEnabled(d);
                    return (
                      <button
                        key={d.serialNumber}
                        onClick={() => flyTo(d)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-[#195C51]/5 transition-colors ${
                          selected?.serialNumber === d.serialNumber
                            ? "bg-[#195C51]/8 border-l-[3px] border-l-[#195C51]"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-1.5">
                            {enabled ? (
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                              </span>
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-[#1A2E2A] truncate">
                              {d.label || d.serialNumber}
                            </p>
                            <p className="text-[9px] text-gray-500 mt-0.5 truncate">
                              {d.address ||
                                `${d.lat?.toFixed(4)}, ${d.lng?.toFixed(4)}`}
                            </p>
                          </div>
                          <span
                            className="text-[8px] font-black text-white px-1.5 py-0.5 rounded-md"
                            style={{
                              background: enabled ? "#195C51" : "#9CA3AF",
                            }}
                          >
                            {d.modelType || "?"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PLANS MANAGEMENT — improved card visibility
  // ═══════════════════════════════════════════════════════════════════════════
  const Plans = () => {
    const plans = safe(data.plans);
    const API_KEY = import.meta.env.VITE_API_KEY;

    const emptyForm = {
      name: "",
      description: "",
      maxDevices: "",
      maxShares: "",
      maxSessions: "",
      minDurationMonths: "1",
      maxDurationMonths: "12",
      isActive: true,
      features: "",
      pricing: [{ country: "RW", currency: "RWF", pricePerMonth: "" }],
    };

    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const [deleting, setDeleting] = useState(null);

    const openCreate = () => {
      setForm(emptyForm);
      setErr("");
      setModal("create");
    };
    const openEdit = (p) => {
      setForm({
        name: p.name || "",
        description: p.description || "",
        maxDevices: String(p.maxDevices || ""),
        maxShares: String(p.maxShares || ""),
        maxSessions: String(p.maxSessions || ""),
        minDurationMonths: String(p.minDurationMonths || 1),
        maxDurationMonths: String(p.maxDurationMonths || 12),
        isActive: !!p.isActive,
        features: (p.features || []).join("\n"),
        // only keep RW pricing, filter out GLOBAL/USD
        pricing: (p.pricing || [])
          .filter((pr) => pr.country !== "GLOBAL" && pr.currency !== "USD")
          .map((pr) => ({ ...pr, pricePerMonth: String(pr.pricePerMonth) })),
        _id: p._id,
      });
      setErr("");
      setModal("edit");
    };

    const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const setPricing = (i, k, v) =>
      setForm((p) => ({
        ...p,
        pricing: p.pricing.map((pr, idx) =>
          idx === i ? { ...pr, [k]: v } : pr,
        ),
      }));
    const addPricing = () =>
      setForm((p) => ({
        ...p,
        pricing: [
          ...p.pricing,
          { country: "", currency: "RWF", pricePerMonth: "" },
        ],
      }));
    const rmPricing = (i) =>
      setForm((p) => ({
        ...p,
        pricing: p.pricing.filter((_, idx) => idx !== i),
      }));

    const buildPayload = () => ({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      maxDevices: parseInt(form.maxDevices, 10),
      maxShares: parseInt(form.maxShares, 10),
      maxSessions: parseInt(form.maxSessions, 10),
      minDurationMonths: parseInt(form.minDurationMonths, 10) || 1,
      maxDurationMonths: parseInt(form.maxDurationMonths, 10) || 12,
      isActive: form.isActive,
      features: form.features
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      pricing: form.pricing.map((p) => ({
        country: p.country.trim().toUpperCase(),
        currency: p.currency.trim().toUpperCase(),
        pricePerMonth: parseFloat(p.pricePerMonth) || 0,
      })),
    });

    const apiHeaders = (withJson = false) => ({
      "x-api-key": API_KEY,
      ...(withJson ? { "Content-Type": "application/json" } : {}),
    });

    const handleSave = async () => {
      setSaving(true);
      setErr("");
      try {
        const url =
          modal === "edit"
            ? `${presence_server}/api/analytics/plans/${form._id}`
            : `${presence_server}/api/analytics/plans`;
        const res = await fetch(url, {
          method: modal === "edit" ? "PUT" : "POST",
          headers: apiHeaders(true),
          body: JSON.stringify(buildPayload()),
        });
        const d = await res.json();
        if (!res.ok) {
          setErr(d.message || "Save failed");
          return;
        }
        setModal(null);
        load("plans");
      } catch (e) {
        setErr(e.message || "Network error");
      } finally {
        setSaving(false);
      }
    };

    const handleToggle = async (planId) => {
      try {
        await fetch(`${presence_server}/api/analytics/plans/${planId}/toggle`, {
          method: "PATCH",
          headers: apiHeaders(),
        });
        load("plans");
      } catch (e) {
        alert(e.message || "Toggle failed");
      }
    };

    const handleDelete = async (planId) => {
      if (!window.confirm("Delete this plan? This cannot be undone.")) return;
      setDeleting(planId);
      try {
        const res = await fetch(
          `${presence_server}/api/analytics/plans/${planId}`,
          {
            method: "DELETE",
            headers: apiHeaders(),
          },
        );
        const d = await res.json();
        if (!res.ok) {
          alert(d.message || "Delete failed");
          return;
        }
        load("plans");
      } catch (e) {
        alert(e.message);
      } finally {
        setDeleting(null);
      }
    };

    const renderPlanForm = () => (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {err && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
              Plan Name<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
              placeholder="Family Plan"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setF("description", e.target.value)}
              placeholder="Perfect for home use"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"
            />
          </div>
          {[
            { key: "maxDevices", label: "Max Devices", min: 1 },
            { key: "maxShares", label: "Max Shares", min: 0 },
            { key: "maxSessions", label: "Max Sessions", min: 1 },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                {f.label}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="number"
                min={f.min}
                value={form[f.key]}
                onChange={(e) => setF(f.key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"
              />
            </div>
          ))}
          <div />
          {[
            { key: "minDurationMonths", label: "Min Duration (months)" },
            { key: "maxDurationMonths", label: "Max Duration (months)" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                {f.label}
              </label>
              <input
                type="number"
                min="1"
                value={form[f.key]}
                onChange={(e) => setF(f.key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"
              />
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Pricing (per region)<span className="text-red-500 ml-0.5">*</span>
            </label>
            <button
              type="button"
              onClick={addPricing}
              className="text-[9px] font-black text-[#195C51] hover:underline flex items-center gap-1"
            >
              <MdAdd size={12} /> Add region
            </button>
          </div>
          {form.pricing.map((p, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-end">
              {[
                {
                  label: i === 0 ? "Country" : "",
                  field: "country",
                  placeholder: "RW",
                  type: "text",
                },
                {
                  label: i === 0 ? "Currency" : "",
                  field: "currency",
                  placeholder: "RWF",
                  type: "text",
                },
                {
                  label: i === 0 ? "Price/Month" : "",
                  field: "pricePerMonth",
                  placeholder: "5000",
                  type: "number",
                },
              ].map((col) => (
                <div key={col.field}>
                  {col.label && (
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                      {col.label}
                    </label>
                  )}
                  <input
                    type={col.type}
                    value={p[col.field]}
                    placeholder={col.placeholder}
                    onChange={(e) => setPricing(i, col.field, e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => rmPricing(i)}
                className="h-10 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
              >
                <MdDelete size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Features */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
            Features{" "}
            <span className="text-gray-400 normal-case font-normal">
              (one per line)
            </span>
          </label>
          <textarea
            value={form.features}
            onChange={(e) => setF("features", e.target.value)}
            rows={4}
            placeholder={"Mobile app access\nFull Repair\nMaintenance"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all resize-none"
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setF("isActive", !form.isActive)}
            className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
              form.isActive ? "bg-[#195C51]" : "bg-gray-200"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                form.isActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm font-bold text-gray-600">
            {form.isActive
              ? "Active — visible to users"
              : "Inactive — hidden from users"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors disabled:opacity-50"
        >
          {saving
            ? "Saving…"
            : modal === "edit"
            ? "Update Plan"
            : "Create Plan"}
        </button>
      </div>
    );

    return (
      <div className="space-y-5 sm:space-y-8">
        <div className="flex items-center justify-between">
          <Section
            icon={MdCreditCard}
            title="Subscription Plans"
            subtitle="Manage plans available to your customers"
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors"
          >
            <MdAdd size={14} /> New Plan
          </button>
        </div>

        {loading("plans") ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Sk key={i} cls="h-52" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center gap-4">
            <MdCreditCard size={36} className="text-gray-200" />
            <div className="text-center">
              <p className="font-black text-[#1A2E2A]">No plans yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Create your first plan to allow customers to subscribe.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors"
            >
              <MdAdd size={14} /> Create First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((p) => {
              // Only show local pricing — no USD/GLOBAL
              const localPricing = (p.pricing || []).filter(
                (pr) => pr.country !== "GLOBAL" && pr.currency !== "USD",
              );
              const mainPrice =
                localPricing.find((pr) => pr.country === "RW") ||
                localPricing[0];
              return (
                <div
                  key={p._id}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md
                  ${
                    p.isActive
                      ? "border-2 border-[#195C51]/25"
                      : "border-2 border-dashed border-gray-200 opacity-75"
                  }`}
                >
                  <div
                    className={`h-1.5 w-full ${
                      p.isActive ? "bg-[#195C51]" : "bg-gray-200"
                    }`}
                  />

                  <div className="px-5 pt-4 pb-3">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h3 className="font-black text-[#1A2E2A] text-base leading-tight">
                        {p.name}
                      </h3>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 border
                      ${
                        p.isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                      >
                        {p.isActive ? "● Active" : "○ Inactive"}
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-xs text-gray-500 mt-0.5 mb-3 leading-snug">
                        {p.description}
                      </p>
                    )}

                    {mainPrice && (
                      <div className="flex items-baseline gap-1 mb-3">
                        <span
                          className="text-3xl font-black"
                          style={{ color: p.isActive ? C.primary : "#9CA3AF" }}
                        >
                          {mainPrice.pricePerMonth?.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-gray-500">
                          {mainPrice.currency}/mo
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Devices", val: p.maxDevices },
                        { label: "Shares", val: p.maxShares },
                        { label: "Sessions", val: p.maxSessions },
                      ].map((l) => (
                        <div
                          key={l.label}
                          className={`rounded-xl p-2 text-center ${
                            p.isActive ? "bg-[#195C51]/5" : "bg-gray-100"
                          }`}
                        >
                          <p className="text-sm font-black text-[#1A2E2A]">
                            {l.val}
                          </p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            {l.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-gray-500 mb-2">
                      {p.minDurationMonths}–{p.maxDurationMonths} months
                      duration
                    </p>

                    {p.features?.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {p.features.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <MdCheckBox
                              size={13}
                              style={{
                                color: p.isActive ? C.accent : "#9CA3AF",
                                flexShrink: 0,
                              }}
                            />
                            <span className="text-[11px] text-gray-600">
                              {f}
                            </span>
                          </div>
                        ))}
                        {p.features.length > 4 && (
                          <p className="text-[10px] text-gray-400">
                            +{p.features.length - 4} more features
                          </p>
                        )}
                      </div>
                    )}

                    {/* Local pricing regions only — no USD */}
                    {localPricing.length > 1 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                          Regions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {localPricing.map((pr, i) => (
                            <span
                              key={i}
                              className="text-[9px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-lg border border-gray-200"
                            >
                              {pr.country}: {pr.pricePerMonth?.toLocaleString()}{" "}
                              {pr.currency}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons — larger and clearer */}
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-[#195C51] bg-white border border-[#195C51]/20 rounded-xl hover:bg-[#195C51]/5 hover:border-[#195C51]/40 transition-all"
                    >
                      <MdEdit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleToggle(p._id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                    >
                      {p.isActive ? (
                        <>
                          <MdToggleOff size={14} /> Deactivate
                        </>
                      ) : (
                        <>
                          <MdToggleOn size={14} /> Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      disabled={deleting === p._id}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-black text-red-500 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-40"
                    >
                      <MdDelete size={14} />{" "}
                      {deleting === p._id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal
          open={modal === "create" || modal === "edit"}
          onClose={() => setModal(null)}
          title={modal === "edit" ? "Edit Plan" : "Create Plan"}
          wide
        >
          {renderPlanForm()}
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY REPORT — with download + historical date picker
  // ═══════════════════════════════════════════════════════════════════════════
const DailyReport = () => {
  const dateInputRef = useRef(null);

  const r       = data.report;
  const summary = r?.summary || {};
  const hourly  = safe(r?.hourlyBreakdown);
  const topDev  = safe(r?.topDevices);

  const pickDate = d => {
    setReportDate(d);
    load('report', { date: d });
  };

  const shortcuts = [
    { label: 'Today',       offset: 0  },
    { label: 'Yesterday',   offset: 1  },
    { label: '2 days ago',  offset: 2  },
    { label: '7 days ago',  offset: 7  },
    { label: '30 days ago', offset: 30 },
  ];

  const offsetDate = n => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  const SummaryCard = ({ label, value, delta, sub, color = C.primary, icon: Icon }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }}/>
        </div>
        {delta != null && <DeltaBadge val={delta}/>}
      </div>
      <p className="text-2xl sm:text-3xl font-black text-[#1A2E2A]">{value ?? '—'}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1 leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-8">
      <Section icon={MdPictureAsPdf} title="Daily Report" subtitle="Operational snapshot for any date"/>

      {/* ── Date picker ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${C.primary}15` }}>
              <MdCalendarToday size={20} style={{ color: C.primary }}/>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Select Date</p>
              <input
                ref={dateInputRef}
                type="date"
                value={reportDate}
                onChange={e => {
                  setReportDate(e.target.value);
                  load('report', { date: e.target.value });
                }}
                max={new Date().toISOString().slice(0, 10)}
                className="text-base font-black text-[#1A2E2A] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"
              />
            </div>
          </div>
          <button
            onClick={() => load('report', { date: dateInputRef.current?.value || reportDate })}
            disabled={loading('report')}
            className="flex items-center gap-2 px-6 py-3 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors disabled:opacity-50">
            {loading('report')
              ? <><MdRefresh size={14} className="animate-spin"/> Loading…</>
              : <><MdRefresh size={14}/> Generate</>
            }
          </button>
        </div>

        {/* Shortcuts */}
        <div className="flex flex-wrap gap-2">
          {shortcuts.map(s => {
            const d = offsetDate(s.offset);
            return (
              <button key={s.label} onClick={() => pickDate(d)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all
                  ${reportDate === d
                    ? 'bg-[#195C51] text-white border-[#195C51]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#195C51] hover:text-[#195C51]'}`}>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── States ── */}
      {loading('report') ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Sk key={i} cls="h-32"/>)}
        </div>
      ) : !r ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-14 flex flex-col items-center gap-3">
          <MdCalendarToday size={36} className="text-gray-200"/>
          <p className="text-sm font-black text-gray-400">Pick a date above and click Generate</p>
          <p className="text-xs text-gray-400">You can view any historical date from the database</p>
        </div>
      ) : (
        <>
          {/* Report date label */}
          <div className="bg-[#1A2E2A] text-white rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-black">{r.dateLabel}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Generated at {new Date(r.generatedAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Total Gate Opens</p>
              <p className="text-2xl font-black text-[#2DC87A]">{summary.totalGateOpens?.toLocaleString() ?? '—'}</p>
            </div>
          </div>

          {/* ── 4 core KPIs ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <SummaryCard
              icon={MdSignalWifi4Bar}
              label="Devices Online"
              value={summary.devicesOnlineToday}
              sub={summary.totalSoldDevices ? `${summary.onlineRate}% of ${summary.totalSoldDevices} sold` : undefined}
              color={C.accent}
            />
            <SummaryCard
              icon={MdCreditCard}
              label="New Subscriptions"
              value={summary.newSubscriptions}
              sub="Created on this day"
              color={C.primary}
            />
            <SummaryCard
              icon={MdDevices}
              label="Devices Interacted"
              value={summary.devicesInteracted}
              delta={summary.devicesInteractedDelta}
              sub="Unique devices with gate opens"
              color="#6B8BD4"
            />
            <SummaryCard
              icon={MdPeople}
              label="Active Users"
              value={summary.activeUsers}
              delta={summary.activeUsersDelta}
              sub="Users who opened a gate"
              color={C.accentWarm}
            />
          </div>

          {/* ── Hourly breakdown ── */}
          <Card title="Gate Opens by Hour" subtitle="24-hour activity breakdown">
            {hourly.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hourly} margin={{top:4, right:4, left:-10, bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                  <XAxis dataKey="label" tick={{fontSize:7, fill:'#6B7280'}} tickLine={false} axisLine={false} interval={2}/>
                  <YAxis tick={{fontSize:8, fill:'#6B7280'}} tickLine={false} axisLine={false} allowDecimals={false} width={25}/>
                  <Tooltip content={<CTip/>}/>
                  <Bar dataKey="events" name="Opens" fill={C.primary} radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty msg="No gate opens recorded this day"/>}
          </Card>

          {/* ── Top devices ── */}
          <Card title="Top 5 Devices" subtitle="Most gate opens on this day">
            {topDev.length > 0 ? (
              <div className="space-y-3 pt-1">
                {topDev.map((d, i) => (
                  <div key={d.serialNumber} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#1A2E2A] truncate">{d.label}</p>
                      <p className="text-[9px] text-gray-500 font-mono truncate">{d.serialNumber}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-[#1A2E2A]">{d.opens}</p>
                      <p className="text-[9px] text-gray-500">opens</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <Empty msg="No device interactions this day"/>}
          </Card>
        </>
      )}
    </div>
  );
};

  // ═══════════════════════════════════════════════════════════════════════════
  // GROWTH
  // ═══════════════════════════════════════════════════════════════════════════
  const Growth = () => {
    const g = data.growth || {};
    const signups = safe(g.monthlySignups).map((m) => ({
      month: monthLabel(m.year, m.month),
      "New Signups": m.newUsers || 0,
      Verified: m.verified || 0,
    }));
    const geo = safe(g.geoDistribution)
      .slice(0, 8)
      .map((x) => ({ name: x._id || "Unknown", Users: x.count || 0 }));
    const kpis = [
      {
        label: "Total Registered",
        value: g.totals?.totalUsers,
        sub: `All-time signups`,
        color: C.primary,
      },
      {
        label: "Verified Users",
        value: g.totals?.verifiedUsers,
        sub: `${g.verificationRate ?? "—"}% verification rate`,
        color: C.accent,
      },
      {
        label: "Active Accounts",
        value: g.totals?.activeUsers,
        sub: "Not deactivated",
        color: "#6B8BD4",
      },
      {
        label: "Avg Shares/Device",
        value: g.sharingDepth?.avgShares?.toFixed(1),
        sub: `Max: ${g.sharingDepth?.maxShares ?? "—"}`,
        color: C.accentWarm,
      },
    ];
    return (
      <div className="space-y-5 sm:space-y-8">
        <Section
          icon={MdTrendingUp}
          title="User Growth"
          subtitle="Who is joining and where?"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpis.map((k) => (
            <KPI key={k.label} {...k} loading={loading("growth")} />
          ))}
        </div>
        <Card title="Monthly Signups — 12 Months">
          {loading("growth") ? (
            <Sk cls="h-56 w-full" />
          ) : signups.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={signups}
                margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0F0F0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 8, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip content={<CTip />} />
                <Bar
                  dataKey="New Signups"
                  fill={`${C.primary}60`}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="Verified"
                  fill={C.primary}
                  radius={[3, 3, 0, 0]}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "9px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty msg="Signup trend will appear as users register" />
          )}
        </Card>
        <Card title="Geographic Distribution">
          {loading("growth") ? (
            <Sk cls="h-52 w-full" />
          ) : geo.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={geo}
                layout="vertical"
                margin={{ left: 12, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0F0F0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 8, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#374151", fontWeight: "800" }}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                />
                <Tooltip content={<CTip />} />
                <Bar dataKey="Users" radius={[0, 5, 5, 0]}>
                  {geo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty msg="No geographic data yet" />
          )}
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LEADERBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  const Leaderboard = () => {
    const lb = data.leaderboard || {};
    const userRows = safe(lb.rows);
    const [expandedUser, setExpandedUser] = useState(null);

    const handlePeriodChange = (p) => {
      setLbPeriod(p);
      setLbSearch("");
      load("leaderboard", { period: p });
    };
    const handleSort = (key) => {
      setLbSort((s) =>
        s.key === key
          ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
          : { key, dir: key === "rank" ? "asc" : "desc" },
      );
    };

    const maskNameLocal = (n) => {
      if (!n || n === "Unknown") return "Unknown";
      const p = n.trim().split(/\s+/);
      return p.length === 1 ? p[0] : `${p[0]} ${p[1][0].toUpperCase()}.`;
    };
    const maskEmailLocal = (e) => {
      if (!e) return null;
      const at = e.indexOf("@");
      if (at === -1) return `${e.slice(0, 3)}***`;
      return `${e.slice(0, 3)}${"*".repeat(Math.max(3, at - 3))}${e.slice(at)}`;
    };

    userRows.sort((a, b) => b.totalOpens - a.totalOpens);
    const filtered = userRows.filter((u) => {
      const q = lbSearch.toLowerCase();
      if (!q) return true;
      return (
        u.ownerName.toLowerCase().includes(q) ||
        (u.ownerEmail || "").toLowerCase().includes(q) ||
        u.remotes.some(
          (r) =>
            r.serialNumber.toLowerCase().includes(q) ||
            r.labelName.toLowerCase().includes(q),
        )
      );
    });
    const sorted = [...filtered].sort((a, b) => {
      let va, vb;
      if (lbSort.key === "rank") {
        va = userRows.indexOf(a);
        vb = userRows.indexOf(b);
      } else if (lbSort.key === "opens") {
        va = a.totalOpens || 0;
        vb = b.totalOpens || 0;
      } else if (lbSort.key === "avg") {
        va = a.avgOpensPerDay || 0;
        vb = b.avgOpensPerDay || 0;
      } else if (lbSort.key === "last") {
        va = new Date(a.lastOpenAt || 0).getTime();
        vb = new Date(b.lastOpenAt || 0).getTime();
      } else if (lbSort.key === "name") {
        va = a.ownerName.toLowerCase();
        vb = b.ownerName.toLowerCase();
      }
      if (va < vb) return lbSort.dir === "asc" ? -1 : 1;
      if (va > vb) return lbSort.dir === "asc" ? 1 : -1;
      return 0;
    });

    const SortIcon = ({ k }) => {
      if (lbSort.key !== k) return <span className="opacity-20 ml-1">↕</span>;
      return lbSort.dir === "asc" ? (
        <MdArrowUpward size={11} className="inline ml-1 opacity-70" />
      ) : (
        <MdArrowDownward size={11} className="inline ml-1 opacity-70" />
      );
    };
    const RankBadge = ({ rank }) => {
      if (rank === 0)
        return (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-yellow-400 text-yellow-900">
            🥇
          </div>
        );
      if (rank === 1)
        return (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-gray-300 text-gray-700">
            🥈
          </div>
        );
      if (rank === 2)
        return (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-amber-600/30 text-amber-800">
            🥉
          </div>
        );
      return (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black bg-gray-100 text-gray-600">
          {rank + 1}
        </div>
      );
    };
    const modelColor = (m) =>
      ({
        lite: { bg: "#6B8BD4", label: "Lite" },
        max: { bg: C.accent, label: "Max" },
        pro: { bg: C.primary, label: "Pro" },
      }[m] || { bg: C.muted, label: m?.toUpperCase() || "—" });
    const timeAgo = (date) => {
      if (!date) return "—";
      const diff = Date.now() - new Date(date).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "just now";
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      const d = Math.floor(h / 24);
      if (d < 30) return `${d}d ago`;
      return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
    };

    const top3 = userRows.slice(0, 3);
    const maxOpens =
      sorted.length > 0
        ? Math.max(
            ...sorted.map((u) =>
              lbPeriod === "avg" ? u.avgOpensPerDay || 0 : u.totalOpens || 0,
            ),
            1,
          )
        : 1;
    const metricNum = (u) =>
      lbPeriod === "avg" ? u.avgOpensPerDay || 0 : u.totalOpens || 0;

    return (
      <div className="space-y-5 sm:space-y-8">
        <Section
          icon={MdEmojiEvents}
          title="Customer Leaderboard"
          subtitle="Ranked by gate usage — one row per customer (all remotes merged)"
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <DurationPicker
              value={lbPeriod}
              onChange={handlePeriodChange}
              options={[
                { value: "30d", label: "Last 30 days" },
                { value: "avg", label: "Avg / day" },
              ]}
            />
            {loading("leaderboard") && (
              <span className="text-[10px] text-gray-500 font-bold animate-pulse">
                Loading…
              </span>
            )}
          </div>
          <div className="relative w-full sm:w-72">
            <MdFilterList
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={lbSearch}
              onChange={(e) => setLbSearch(e.target.value)}
              placeholder="Filter by name, email or serial…"
              className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"
            />
          </div>
        </div>

        {!loading("leaderboard") && top3.length > 0 && lbSearch === "" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {top3.map((u, i) => (
              <div
                key={`${u.ownerName}-${i}`}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-sm relative overflow-hidden ${
                  i === 0
                    ? "border-yellow-200 ring-1 ring-yellow-200/60"
                    : "border-gray-200"
                }`}
              >
                {i === 0 && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-bl-full" />
                )}
                <div className="flex items-start gap-3 mb-2">
                  <RankBadge rank={i} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#1A2E2A] truncate">
                      {maskNameLocal(u.ownerName)}
                    </p>
                    {u.ownerEmail && (
                      <p className="text-[9px] text-gray-500 font-mono truncate">
                        {maskEmailLocal(u.ownerEmail)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {u.remotes.slice(0, 3).map((r, rIdx) => {
                    const mc = modelColor(r.modelType);
                    return (
                      <span
                        key={rIdx}
                        className="px-1.5 py-0.5 rounded-full text-[8px] font-black text-white"
                        style={{ background: mc.bg }}
                      >
                        {mc.label}
                      </span>
                    );
                  })}
                  {u.remoteCount > 3 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-gray-100 text-gray-600">
                      +{u.remoteCount - 3} more
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black" style={{ color: C.primary }}>
                  {lbPeriod === "avg"
                    ? u.avgOpensPerDay
                    : (u.totalOpens || 0).toLocaleString()}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-0.5">
                  {lbPeriod === "avg" ? "avg opens / day" : "gate opens (30d)"}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {u.remoteCount} remote{u.remoteCount !== 1 ? "s" : ""} · Last:{" "}
                  {timeAgo(u.lastOpenAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        <Card
          title={`All Customers — ${sorted.length} user${
            sorted.length !== 1 ? "s" : ""
          }`}
          subtitle={
            lbPeriod === "30d"
              ? "Ranked by total opens in the last 30 days"
              : "Ranked by average opens per day (all-time)"
          }
        >
          {loading("leaderboard") ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Sk key={i} cls="h-14 w-full" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <Empty
              msg={
                lbSearch
                  ? "No results match your filter."
                  : "No usage data yet."
              }
            />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[620px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      { key: "rank", label: "#", cls: "w-12 pl-3" },
                      { key: "name", label: "Customer", cls: "pl-2" },
                      { key: null, label: "Remotes / Serial", cls: "" },
                      {
                        key: "opens",
                        label: lbPeriod === "avg" ? "Avg / Day" : "30d Opens",
                        cls: "text-right",
                      },
                      {
                        key: "last",
                        label: "Last Active",
                        cls: "text-right pr-3",
                      },
                    ].map((col) => (
                      <th
                        key={col.label}
                        onClick={
                          col.key ? () => handleSort(col.key) : undefined
                        }
                        className={`py-3 text-[9px] font-black uppercase tracking-widest text-gray-500 ${
                          col.cls
                        } ${
                          col.key
                            ? "cursor-pointer hover:text-[#195C51] select-none transition-colors"
                            : ""
                        }`}
                      >
                        {col.label}
                        {col.key && <SortIcon k={col.key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((u, i) => {
                    const origRank = userRows.indexOf(u);
                    const pct =
                      maxOpens > 0 ? (metricNum(u) / maxOpens) * 100 : 0;
                    const isTop = origRank < 3 && lbSearch === "";
                    const uid = `${u.ownerName}__${i}`;
                    const isExpanded = expandedUser === uid;
                    return (
                      <React.Fragment key={uid}>
                        <tr
                          onClick={() =>
                            setExpandedUser(isExpanded ? null : uid)
                          }
                          className={`border-b border-gray-50 hover:bg-[#195C51]/[0.03] transition-colors cursor-pointer ${
                            isTop && origRank === 0 ? "bg-yellow-50/50" : ""
                          } ${isExpanded ? "bg-[#195C51]/[0.04]" : ""}`}
                        >
                          <td className="py-3 pl-3 pr-2 w-12">
                            <RankBadge rank={lbSearch ? i : origRank} />
                          </td>
                          <td className="py-3 pl-2 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
                                style={{ background: C.primary }}
                              >
                                {(u.ownerName || "?")[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-[#1A2E2A] truncate">
                                  {maskNameLocal(u.ownerName)}
                                </p>
                                {u.ownerEmail && (
                                  <p className="text-[9px] text-gray-500 font-mono truncate">
                                    {maskEmailLocal(u.ownerEmail)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-col gap-1">
                              {u.remotes.slice(0, 2).map((r, rIdx) => (
                                <div key={rIdx} className="leading-tight">
                                  <p className="text-[11px] font-bold text-gray-800">
                                    {r.labelName}
                                  </p>
                                  <p className="text-[9px] font-mono text-gray-500">
                                    {r.serialNumber !== "—"
                                      ? r.serialNumber
                                      : ""}
                                  </p>
                                </div>
                              ))}
                              {u.remoteCount > 2 && (
                                <span className="text-[9px] font-black text-[#195C51]">
                                  +{u.remoteCount - 2} more ▾
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <p className="text-sm font-black text-[#1A2E2A]">
                              {lbPeriod === "avg"
                                ? u.avgOpensPerDay
                                : (u.totalOpens || 0).toLocaleString()}
                            </p>
                            <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden w-20 ml-auto">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  background:
                                    isTop && origRank === 0
                                      ? "#F59E0B"
                                      : C.primary,
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-right">
                            <p className="text-xs font-bold text-gray-700">
                              {timeAgo(u.lastOpenAt)}
                            </p>
                            {u.lastOpenAt && (
                              <p className="text-[9px] text-gray-500">
                                {new Date(u.lastOpenAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "2-digit",
                                  },
                                )}
                              </p>
                            )}
                          </td>
                        </tr>
                        {isExpanded &&
                          u.remotes.map((r, rIdx) => {
                            const mc = modelColor(r.modelType);
                            return (
                              <tr
                                key={`${uid}__sub__${rIdx}`}
                                className="bg-[#195C51]/[0.02] border-b border-[#195C51]/5"
                              >
                                <td className="py-2 pl-5 pr-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#195C51]/30 mx-auto" />
                                </td>
                                <td className="py-2 pl-6 pr-4" colSpan={1}>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="px-1.5 py-0.5 rounded-full text-[8px] font-black text-white flex-shrink-0"
                                      style={{ background: mc.bg }}
                                    >
                                      {mc.label}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-bold text-gray-800 truncate">
                                        {r.labelName}
                                      </p>
                                      {r.serialNumber !== "—" && (
                                        <p className="text-[9px] font-mono text-gray-500 truncate">
                                          {r.serialNumber}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 text-center">
                                  <span className="text-[9px] text-gray-300">
                                    —
                                  </span>
                                </td>
                                <td className="py-2 pr-4 text-right">
                                  <p className="text-[11px] font-black text-gray-600">
                                    {lbPeriod === "avg"
                                      ? r.avgOpensPerDay || 0
                                      : (r.totalOpens || 0).toLocaleString()}
                                  </p>
                                </td>
                                <td className="py-2 pr-3 text-right">
                                  <p className="text-[10px] text-gray-500">
                                    {timeAgo(r.lastOpenAt)}
                                  </p>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 sm:space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2E2A]">
            Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            Product impact · Revenue · Operations
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block">
            {ts.toLocaleTimeString()}
          </span>
          <button
            onClick={() => load(tab)}
            disabled={loading(tab)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#195C51] hover:border-[#195C51]/30 transition-all disabled:opacity-50"
          >
            <MdRefresh
              size={14}
              className={loading(tab) ? "animate-spin" : ""}
            />{" "}
            Refresh
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex bg-white p-1 sm:p-1.5 rounded-2xl border border-gray-200 shadow-sm w-fit gap-0.5 sm:gap-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "engagement", label: "Usage" },
            { id: "revenue", label: "Revenue" },
            { id: "hardware", label: "Hardware" },
            { id: "map", label: "Map" },
            { id: "leaderboard", label: "Leaderboard" },
            { id: "plans", label: "Plans" },
            { id: "report", label: "Report" },
          ].map((t) => (
            <Tab
              key={t.id}
              label={t.label}
              active={tab === t.id}
              onClick={() => setTab(t.id)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {tab === "overview" && <Overview />}
        {tab === "engagement" && <Engagement />}
        {tab === "revenue" && <Revenue />}
        {tab === "hardware" && <Hardware />}
        {tab === "map" && <MapView />}
        {tab === "plans" && <Plans />}
        {tab === "report" && <DailyReport />}
        {tab === "leaderboard" && <Leaderboard />}
      </div>
    </div>
  );
}
