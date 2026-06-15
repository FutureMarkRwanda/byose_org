// src/pages/dashboard/DeviceInsights.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Activity, Settings, Search, Wifi, WifiOff, Box, Package,
  ChevronLeft, ChevronRight, Eye, EyeOff, X, History, Crosshair,
   Filter, SortAsc, SortDesc, Maximize2, Minimize2,
  RefreshCw, Tag, Cpu, Users, AlertTriangle,
  BarChart2, ChevronDown, CheckCircle, Clock, Zap,
  Shield, User, Star, Globe
} from "lucide-react";
import { fetchData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";
import { useNotification } from "../../context/NotificationContext.jsx";
import RemoteDetailsModal from "../../components/RemoteDetailsModal.jsx";
import AddRemoteModal from "../../components/AddRemoteModal.jsx";

// ── Pin Icons ─────────────────────────────────────────────────────────────────
const makePinIcon = (color) => L.divIcon({
  className: "presence-pin",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <defs><filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.35"/>
    </filter></defs>
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.7-6.3-14-14-14z"
          fill="${color}" filter="url(#ds)"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`,
  iconSize: [28, 40], iconAnchor: [14, 40], popupAnchor: [0, -36],
});
const PIN_ONLINE  = makePinIcon("#10b981");
const PIN_OFFLINE = makePinIcon("#ef4444");

const MapController = ({ fitRef }) => {
  const map = useMap();
  useEffect(() => {
    if (!fitRef) return;
    const safeFit = (bounds) => {
      if (!bounds || !bounds.isValid()) return;
      // Guard: ensure the map pane is mounted before calling fitBounds
      try {
        const pane = map.getPane("mapPane");
        if (!pane || !pane._leaflet_pos === undefined) return;
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (_) {
        // map not ready yet — retry after next paint
        requestAnimationFrame(() => {
          try { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 }); } catch (_2) {}
        });
      }
    };
    fitRef.current = safeFit;
  }, [fitRef, map]);
  return null;
};

// ── UI Primitives ─────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default:     "bg-slate-100 text-slate-800 border-slate-200",
    destructive: "bg-red-100 text-red-800 border-red-200",
    success:     "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning:     "bg-amber-100 text-amber-800 border-amber-200",
    indigo:      "bg-indigo-100 text-indigo-800 border-indigo-200",
    purple:      "bg-purple-100 text-purple-800 border-purple-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Spinner = () => (
  <div className="w-5 h-5 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin" />
);

// ── Privacy Name Toggle ────────────────────────────────────────────────────────
export const PrivacyNameToggle = ({ fullName }) => {
  const [revealed, setRevealed] = useState(false);
  if (!fullName || fullName === "Unknown" || fullName === "Unassigned")
    return <span className="text-slate-400 italic text-xs">Unassigned</span>;

  const parts = fullName.trim().split(/\s+/);
  const masked = parts.length > 1
    ? `${parts[parts.length - 1]} ${parts[0].charAt(0)}.`
    : `${fullName.charAt(0)}.`;

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-semibold text-[#195C51] text-sm">{revealed ? fullName : masked}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setRevealed(!revealed); }}
        className="text-slate-400 hover:text-[#195C51] transition-colors p-0.5 rounded hover:bg-slate-100"
        title={revealed ? "Hide" : "Reveal"}
      >
        {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </div>
  );
};

// ── Select Component ───────────────────────────────────────────────────────────
const Select = ({ value, onChange, options, placeholder, className = "" }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 w-full cursor-pointer"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
  </div>
);

// ── Time window helpers ────────────────────────────────────────────────────────
const toLocalDateStr = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay   = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

const resolveTrendWindow = (state) => {
  const now = new Date();
  switch (state.mode) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now), label: "Today" };
    case "thisWeek": {
      const dow = (now.getDay() + 6) % 7;
      const start = startOfDay(new Date(now.getTime() - dow * 86400000));
      return { from: start, to: endOfDay(now), label: "This week" };
    }
    case "thisMonth": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: start, to: endOfDay(now), label: "This month" };
    }
    case "custom": {
      if (!state.from || !state.to) return null;
      return {
        from: startOfDay(new Date(state.from)),
        to:   endOfDay(new Date(state.to)),
        label: `${state.from} → ${state.to}`,
      };
    }
    default: return null;
  }
};

// ── Sort / Filter Config ───────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "createdAt",       label: "Date Added" },
  { value: "updatedAt",       label: "Last Updated" },
  { value: "labelName",       label: "Label Name" },
  { value: "price",           label: "Price" },
  { value: "eventCount",      label: "Total Events" },
  { value: "uptimeSeconds",   label: "Total Uptime" },
  { value: "lastEvent",       label: "Last Event" },
  { value: "offlineIncidents",label: "Offline Incidents" },
];

const MODEL_OPTIONS = [
  { value: "", label: "All Models" },
  { value: "pro",  label: "Pro" },
  { value: "max",  label: "Max" },
  { value: "lite", label: "Lite" },
];

const STATE_OPTIONS = [
  { value: "",        label: "All States" },
  { value: "sold",    label: "Deployed" },
  { value: "instore", label: "In Stock" },
];

const OWNER_OPTIONS = [
  { value: "",      label: "All" },
  { value: "true",  label: "With Owner" },
  { value: "false", label: "Unowned" },
];

const ENABLED_OPTIONS = [
  { value: "",      label: "Any Status" },
  { value: "true",  label: "Enabled" },
  { value: "false", label: "Disabled" },
];

const ONLINE_OPTIONS = [
  { value: "",      label: "Any Connection" },
  { value: "true",  label: "Online Only" },
  { value: "false", label: "Offline Only" },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, iconColor, accentBg, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || !onClick}
    className={`text-left bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between relative overflow-hidden group transition-all
      ${onClick && !disabled ? "hover:shadow-md hover:border-[#195C51]/40 focus:outline-none focus:ring-2 focus:ring-[#195C51]/20 cursor-pointer" : "cursor-default"}
      ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
  >
    <div className={`absolute right-0 top-0 w-14 h-14 ${accentBg} rounded-bl-full -z-10 group-hover:scale-125 transition-transform`} />
    <div className="flex items-center justify-between mb-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <p className="text-2xl font-bold font-display text-slate-900">{value ?? "—"}</p>
    {sub && <p className="text-[10px] text-slate-400 mt-1 font-medium">{sub}</p>}
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DeviceInsights() {
  const token = returnToken();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // ── Loading ────────────────────────────────────────────────────────────────
  const [loading, setLoading]           = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // ── Data ───────────────────────────────────────────────────────────────────
  const [globalStats, setGlobalStats]   = useState(null);
  const [remotes, setRemotes]           = useState([]);
  const [pagination, setPagination]     = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [trendData, setTrendData]       = useState([]);

  // ── Trend window ──────────────────────────────────────────────────────────
  const [trendWin, setTrendWin] = useState({ mode: "thisMonth", from: "", to: "" });
  const trendRange = useMemo(() => resolveTrendWindow(trendWin), [trendWin]);

  // -- Role scope -----------------------------------------------------------
  // selectedRoles: Set<"user"|"special"|"admin">, empty = all
  // scopeTarget: "both" | "stats" | "listing"
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [scopeTarget, setScopeTarget]     = useState("both");

  const toggleRole = (role) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role); else next.add(role);
      return next;
    });
  };

  const rolesArray   = useMemo(() => [...selectedRoles], [selectedRoles]);
  const rolesParam   = rolesArray.join(",");
  const hasRoleScope = rolesArray.length > 0;


  // ── Server-side filters & sort ────────────────────────────────────────────
  const [filters, setFilters] = useState({
    search:               "",
    state:                "",
    modelType:            "",
    isEnabled:            "",
    hasOwner:             "",
    isOnline:             "",
    offlineIncidentsMin:  "",
    offlineIncidentsMax:  "",
    statsRoles:           "",
    ownerRoles:           "",
    sortBy:               "createdAt",
    order:                "desc",
    page:                 1,
    limit:                15,
  });

  // ── UI state ───────────────────────────────────────────────────────────────
  const [showFilters, setShowFilters]       = useState(false);
  const [mapFullscreen, setMapFullscreen]   = useState(false);
  const [selectedRemote, setSelectedRemote] = useState(null);
  const [statusDialog, setStatusDialog]     = useState(null);
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [showAddRemote, setShowAddRemote]   = useState(false);

  // ── Map-specific filters (separate from table filters) ────────────────────
  const [mapOnlineFilter, setMapOnlineFilter] = useState(""); // "" | "true" | "false"
  const [mapLimit, setMapLimit]               = useState(500);

  // ── Locally cached online/offline lists (from full load) ──────────────────
  const [allRemotes, setAllRemotes] = useState([]);

  const fitRef = useRef(null);
  const searchDebounce = useRef(null);

  // ── Build query string from filters ───────────────────────────────────────
  const buildQuery = useCallback((f) => {
    const p = new URLSearchParams();
    if (f.search)              p.set("search",              f.search);
    if (f.state)               p.set("state",               f.state);
    if (f.modelType)           p.set("modelType",           f.modelType);
    if (f.isEnabled !== "")    p.set("isEnabled",           f.isEnabled);
    if (f.hasOwner !== "")     p.set("hasOwner",            f.hasOwner);
    if (f.isOnline !== "")     p.set("isOnline",            f.isOnline);
    if (f.offlineIncidentsMin) p.set("offlineIncidentsMin", f.offlineIncidentsMin);
    if (f.offlineIncidentsMax) p.set("offlineIncidentsMax", f.offlineIncidentsMax);
    if (f.statsRoles) p.set("statsRoles", f.statsRoles);
    if (f.ownerRoles) { p.set("ownerRoles", f.ownerRoles); p.set("includeUnowned", "false"); }
    p.set("sortBy", f.sortBy);
    p.set("order",  f.order);
    p.set("page",   f.page);
    p.set("limit",  f.limit);
    return p.toString();
  }, []);

  // ── Load global stats + map data ─────────────────────────────────────────
  // Accepts explicit role params so it is never called with stale closure values
  const loadGlobalData = useCallback(async ({
    statsRoles: sR = "", ownerRoles: oR = "",
    mapOnlineFilter = "", mapLimit = 500,
  } = {}) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: mapLimit });
      if (sR) p.set("statsRoles", sR);
      if (oR) { p.set("ownerRoles", oR); p.set("includeUnowned", "false"); }
      if (mapOnlineFilter !== "") p.set("isOnline", mapOnlineFilter);
      const res = await fetchData(
        `${presence_server}/api/admin/analytics-remotes?${p.toString()}`,
        token,
        showNotification
      );
      if (res.data?.success) {
        setAllRemotes(res.data.remotes || []);
        setGlobalStats(res.data.globalStats);
      }
    } catch {
      showNotification("Failed to load fleet overview", "error");
    }
    setLoading(false);
  }, [token]);

  // ── Load paginated/filtered table data ────────────────────────────────────
  const loadTableData = useCallback(async (f) => {
    setTableLoading(true);
    try {
      const qs = buildQuery(f);
      const res = await fetchData(
        `${presence_server}/api/admin/analytics-remotes?${qs}`,
        token,
        showNotification
      );
      if (res.data?.success) {
        setRemotes(res.data.remotes || []);
        setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
        // refresh global stats from same call
        if (res.data.globalStats) setGlobalStats(res.data.globalStats);
      }
    } catch {
      showNotification("Failed to load device list", "error");
    }
    setTableLoading(false);
  }, [token, buildQuery]);

  // ── Load trend chart ──────────────────────────────────────────────────────
  const loadTrends = useCallback(async () => {
    if (!trendRange) return;
    setTrendLoading(true);
    try {
      const { from, to } = trendRange;
      const url = `${presence_server}/api/admin/analytics-remotes/status-trends?from=${from.toISOString()}&to=${to.toISOString()}`;
      const res = await fetchData(url, token, showNotification);
      if (res.data?.data) setTrendData(res.data.data);
    } catch { /* silent */ }
    setTrendLoading(false);
  }, [trendRange, token]);

  // Sync role scope into filters + reload everything when roles/target change
  useEffect(() => {
    const statsR = hasRoleScope && (scopeTarget === "both" || scopeTarget === "stats")   ? rolesParam : "";
    const ownerR = hasRoleScope && (scopeTarget === "both" || scopeTarget === "listing") ? rolesParam : "";
    setFilters((prev) => ({ ...prev, statsRoles: statsR, ownerRoles: ownerR, page: 1 }));
    loadGlobalData({ statsRoles: statsR, ownerRoles: ownerR, mapOnlineFilter: mapOnlineFilter, mapLimit });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesParam, scopeTarget]);

  useEffect(() => { loadGlobalData(); }, [loadGlobalData]);
  useEffect(() => {
    // Reload map data when its own filters change
    const statsR = hasRoleScope && (scopeTarget === "both" || scopeTarget === "stats")   ? rolesParam : "";
    const ownerR = hasRoleScope && (scopeTarget === "both" || scopeTarget === "listing") ? rolesParam : "";
    loadGlobalData({ statsRoles: statsR, ownerRoles: ownerR, mapOnlineFilter, mapLimit });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapOnlineFilter, mapLimit]);
  useEffect(() => { loadTableData(filters); }, [filters, loadTableData]);
  useEffect(() => { if (trendRange) loadTrends(); }, [trendRange?.from, trendRange?.to]);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearchChange = (val) => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setFilter("search", val);
    }, 400);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "", state: "", modelType: "", isEnabled: "", hasOwner: "",
      isOnline: "", offlineIncidentsMin: "", offlineIncidentsMax: "",
      statsRoles: "", ownerRoles: "",
      sortBy: "createdAt", order: "desc", page: 1, limit: 15,
    });
  };

  const activeFilterCount = [
    filters.state, filters.modelType, filters.isEnabled,
    filters.hasOwner, filters.isOnline,
    filters.offlineIncidentsMin, filters.offlineIncidentsMax,
  ].filter(Boolean).length;

  const toggleSort = (col) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: col,
      order: prev.sortBy === col && prev.order === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  // ── Map data (use allRemotes for map, which has the full set) ─────────────
  const mapLocations = useMemo(
    () => allRemotes.filter((r) => r.location?.lat && r.location?.lng),
    [allRemotes]
  );

  const onlineRemotes  = useMemo(() => allRemotes.filter((r) => r.connectivity?.isOnline),  [allRemotes]);
  const offlineRemotes = useMemo(() => allRemotes.filter((r) => !r.connectivity?.isOnline), [allRemotes]);

  const liveOnlineCount  = globalStats?.connectivity?.currentlyOnline  ?? onlineRemotes.length;
  const liveOfflineCount = globalStats?.connectivity?.currentlyOffline ?? offlineRemotes.length;

  // ── Map auto-fit ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapLocations.length === 0) return;
    // Delay to ensure MapController has registered fitRef.current and map pane is ready
    const t = setTimeout(() => {
      if (!fitRef.current) return;
      const bounds = L.latLngBounds(mapLocations.map((d) => [d.location.lat, d.location.lng]));
      fitRef.current(bounds);
    }, 300);
    return () => clearTimeout(t);
  }, [allRemotes]);

  const recenterMap = () => {
    if (!fitRef.current || mapLocations.length === 0) return;
    const bounds = L.latLngBounds(mapLocations.map((d) => [d.location.lat, d.location.lng]));
    requestAnimationFrame(() => fitRef.current(bounds));
  };

  // ── Find in table ─────────────────────────────────────────────────────────
  const handleFindInInventory = (serialNumber) => {
    setStatusDialog(null);
    clearAllFilters();
    setTimeout(() => {
      setHighlightedRow(serialNumber);
      setTimeout(() => {
        const el = document.getElementById(`row-${serialNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => setHighlightedRow(null), 3000);
        }
      }, 300);
    }, 100);
  };

  const goToUsageHistory = (serialNumber) =>
    navigate(`/dashboard/presence-eye-buttons/remote/${serialNumber}`);

  // ── Sort icon helper ───────────────────────────────────────────────────────
  const SortIcon = ({ col }) => {
    if (filters.sortBy !== col) return <SortAsc className="w-3 h-3 text-slate-300" />;
    return filters.order === "asc"
      ? <SortAsc className="w-3 h-3 text-[#195C51]" />
      : <SortDesc className="w-3 h-3 text-[#195C51]" />;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Device Insights</h1>
            <p className="text-slate-500 text-sm mt-1">
              Operational intelligence from your deployed hardware fleet.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddRemote(true)}
              className="inline-flex items-center gap-2 bg-[#195C51] text-white hover:bg-[#0E3A32] px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Package className="w-3.5 h-3.5" />
              Add Remote
            </button>
            <button
              onClick={() => { loadGlobalData(); loadTableData(filters); }}
              disabled={loading || tableLoading}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:border-[#195C51] hover:text-[#195C51] px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(loading || tableLoading) ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Role Scope Selector ─────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Role pills */}
          <div className="flex flex-col gap-1.5 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Scope by Role
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "user",    label: "Users",   icon: User,   color: "indigo"  },
                { id: "special", label: "Special",  icon: Star,   color: "amber"   },
                { id: "admin",   label: "Admins",  icon: Shield, color: "emerald" },
              ].map(({ id, label, icon: Icon, color }) => {
                const active = selectedRoles.has(id);
                const colorMap = {
                  indigo:  { on: "bg-indigo-600 border-indigo-600 text-white",  off: "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600" },
                  amber:   { on: "bg-amber-500 border-amber-500 text-white",    off: "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600"   },
                  emerald: { on: "bg-[#195C51] border-[#195C51] text-white",    off: "bg-white border-slate-200 text-slate-600 hover:border-[#195C51]/50 hover:text-[#195C51]" },
                };
                return (
                  <button
                    key={id}
                    onClick={() => toggleRole(id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shadow-sm ${active ? colorMap[color].on : colorMap[color].off}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {active && <X className="w-3 h-3 ml-0.5 opacity-70" />}
                  </button>
                );
              })}
              {hasRoleScope && (
                <button
                  onClick={() => setSelectedRoles(new Set())}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors px-2 py-1.5"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
              {!hasRoleScope && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400 px-1">
                  <Globe className="w-3 h-3" /> All roles (default)
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-slate-200" />

          {/* Apply-to target selector */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apply To</p>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 gap-0.5">
              {[
                { id: "both",    label: "Dashboard + Listing" },
                { id: "stats",   label: "Stats Only"          },
                { id: "listing", label: "Listing Only"        },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setScopeTarget(t.id)}
                  disabled={!hasRoleScope}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap
                    ${scopeTarget === t.id && hasRoleScope ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}
                    ${!hasRoleScope ? "cursor-not-allowed opacity-40" : "hover:text-slate-700 cursor-pointer"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active scope badge */}
          {hasRoleScope && (
            <div className="shrink-0 hidden lg:flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Scope</p>
              <div className="inline-flex items-center gap-1.5 bg-[#195C51]/10 text-[#195C51] border border-[#195C51]/20 rounded-lg px-3 py-1.5 text-[11px] font-bold">
                <Shield className="w-3 h-3" />
                {rolesArray.join(", ")} &middot; {scopeTarget === "both" ? "all sections" : scopeTarget === "stats" ? "stats only" : "listing only"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Global Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Currently Online"
          value={loading ? "…" : liveOnlineCount}
          icon={Wifi} iconColor="text-emerald-500" accentBg="bg-emerald-50"
          onClick={() => setStatusDialog("online")}
          disabled={liveOnlineCount === 0}
        />
        <StatCard
          label="Currently Offline"
          value={loading ? "…" : liveOfflineCount}
          icon={WifiOff} iconColor="text-red-500" accentBg="bg-red-50"
          onClick={() => setStatusDialog("offline")}
          disabled={liveOfflineCount === 0}
        />
        <StatCard
          label="Deployed"
          value={loading ? "…" : (globalStats?.fleet?.sold ?? "—")}
          icon={Package} iconColor="text-indigo-500" accentBg="bg-indigo-50"
        />
        <StatCard
          label="In Stock"
          value={loading ? "…" : (globalStats?.fleet?.inStore ?? "—")}
          icon={Box} iconColor="text-amber-500" accentBg="bg-amber-50"
        />
        <StatCard
          label="Fleet Uptime"
          value={loading ? "…" : (globalStats?.connectivity?.rangeUptimePct ?? "—")}
          sub="in selected window"
          icon={CheckCircle} iconColor="text-teal-500" accentBg="bg-teal-50"
        />
        <StatCard
          label="Offline Incidents"
          value={loading ? "…" : (globalStats?.connectivity?.offlineIncidents ?? "—")}
          sub={globalStats?.connectivity?.avgOfflineDuration ? `Avg ${globalStats.connectivity.avgOfflineDuration}` : undefined}
          icon={AlertTriangle} iconColor="text-orange-500" accentBg="bg-orange-50"
        />
      </div>

      {/* ── Secondary Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Events</p>
            <p className="font-bold text-slate-900">{globalStats?.activity?.totalEvents?.toLocaleString() ?? "—"}</p>
            <p className="text-[10px] text-slate-500">{globalStats?.activity?.avgEventsPerDevicePerDay ?? "—"} avg/device/day</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Range Events</p>
            <p className="font-bold text-slate-900">{globalStats?.activity?.rangeEvents?.toLocaleString() ?? "—"}</p>
            <p className="text-[10px] text-slate-500">in selected window</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Config Changes</p>
            <p className="font-bold text-slate-900">{globalStats?.configuration?.totalConfigChanges?.toLocaleString() ?? "—"}</p>
            {globalStats?.configuration?.lastChange && (
              <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                Last: {globalStats.configuration.lastChange.triggeredBy}
              </p>
            )}
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">With Owner</p>
            <p className="font-bold text-slate-900">
              {globalStats?.fleet?.withOwner ?? "—"}
              <span className="text-slate-400 font-normal text-sm ml-1">
                / {globalStats?.fleet?.total ?? "—"}
              </span>
            </p>
            <p className="text-[10px] text-slate-500">{globalStats?.fleet?.unowned ?? "—"} unowned</p>
          </div>
        </Card>
      </div>

      {/* ── Model Breakdown ────────────────────────────────────────────────── */}
      {globalStats?.fleet?.modelBreakdown && (
        <div className="flex gap-3 flex-wrap">
          {globalStats.fleet.modelBreakdown.map((m) => (
            <div key={m.model} className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">{m.model}</span>
              <span className="text-sm font-bold text-slate-900">{m.count}</span>
              <Badge variant={m.model === "pro" ? "indigo" : m.model === "max" ? "purple" : "default"}>
                {m.model}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* ── Trend Chart ────────────────────────────────────────────────────── */}
      <Card className="p-5 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#195C51]" />
            <div>
              <h2 className="font-display font-semibold text-lg leading-tight">Network Health Trend</h2>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Deployed devices only</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              {[
                { id: "today",     label: "Today"      },
                { id: "thisWeek",  label: "This Week"  },
                { id: "thisMonth", label: "This Month" },
                { id: "custom",    label: "Custom"     },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrendWin((w) => ({ ...w, mode: t.id }))}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all
                    ${trendWin.mode === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {trendWin.mode === "custom" && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={trendWin.from}
                  max={trendWin.to || toLocalDateStr(new Date())}
                  onChange={(e) => setTrendWin((w) => ({ ...w, from: e.target.value }))}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 outline-none focus:border-[#195C51]"
                />
                <span className="text-slate-400">→</span>
                <input
                  type="date"
                  value={trendWin.to}
                  min={trendWin.from || undefined}
                  max={toLocalDateStr(new Date())}
                  onChange={(e) => setTrendWin((w) => ({ ...w, to: e.target.value }))}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 outline-none focus:border-[#195C51]"
                />
              </div>
            )}
          </div>
        </div>
        <div className="h-[240px] bg-slate-50/50 rounded-lg border border-slate-100 p-4">
          {trendLoading ? (
            <div className="flex h-full items-center justify-center"><Spinner /></div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748B" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748B" }} />
                <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="online"  name="Online"  stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="offline" name="Offline" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
              No trend data available for this window.
            </div>
          )}
        </div>
      </Card>

      {/* ── Map ────────────────────────────────────────────────────────────── */}
      {/* Fullscreen overlay wrapper — portals the card out of the document flow */}
      <div className={mapFullscreen ? "fixed inset-0 z-40 flex flex-col" : ""}>
      <Card className={`overflow-hidden flex flex-col ${mapFullscreen ? "flex-1 rounded-none shadow-none border-0" : ""}`}>
        {/* Map header */}
        <div className="p-4 border-b border-slate-200 bg-white relative z-10 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#195C51]" />
                <h2 className="font-display font-semibold text-lg">Global Deployment Map</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {mapLocations.length} deployed devices with GPS — click a pin to locate in inventory.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Online</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Offline</span>
              </div>
              <button
                onClick={recenterMap}
                disabled={mapLocations.length === 0}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Crosshair className="w-3.5 h-3.5" /> Fit to fleet
              </button>
              <button
                onClick={() => {
                  setMapFullscreen((v) => !v);
                  // Give Leaflet a tick to see the new container size
                  setTimeout(() => recenterMap(), 120);
                }}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              >
                {mapFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {mapFullscreen ? "Exit fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>

          {/* Map filter bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Map filters:</span>

            {/* Online / Offline / All toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {[
                { id: "",      label: "All"     },
                { id: "true",  label: "Online"  },
                { id: "false", label: "Offline" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMapOnlineFilter(opt.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all
                    ${mapOnlineFilter === opt.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Map pin limit */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-medium">Show up to</span>
              <Select
                value={String(mapLimit)}
                onChange={(v) => setMapLimit(Number(v))}
                options={[
                  { value: "50",   label: "50 pins"  },
                  { value: "100",  label: "100 pins" },
                  { value: "250",  label: "250 pins" },
                  { value: "500",  label: "500 pins" },
                ]}
                className="w-28"
              />
            </div>

            {/* Role scope reminder badge */}
            {hasRoleScope && (scopeTarget === "both" || scopeTarget === "listing") && (
              <div className="inline-flex items-center gap-1 bg-[#195C51]/10 text-[#195C51] border border-[#195C51]/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                <Shield className="w-2.5 h-2.5" /> Scoped: {rolesArray.join(", ")}
              </div>
            )}
          </div>
        </div>

        <div className={`w-full bg-slate-100 relative z-0 ${mapFullscreen ? "flex-1" : "h-[480px]"}`}>
          {loading ? (
            <div className="flex h-full items-center justify-center"><Spinner /></div>
          ) : mapLocations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 text-sm">
              <MapPin className="w-8 h-8 mb-2 opacity-30" />
              No deployed devices have GPS coordinates yet.
            </div>
          ) : (
            <MapContainer
              center={[-1.9441, 30.0619]}
              zoom={12}
              style={{ height: "100%", width: "100%", zIndex: 1 }}
              scrollWheelZoom
            >
              <MapController fitRef={fitRef} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              {mapLocations.map((device) => (
                <Marker
                  key={device.id}
                  position={[device.location.lat, device.location.lng]}
                  icon={device.connectivity?.isOnline ? PIN_ONLINE : PIN_OFFLINE}
                  eventHandlers={{ click: () => handleFindInInventory(device.serialNumber) }}
                >
                  <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                    <div className="p-1.5 space-y-2 font-sans min-w-[200px]">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{device.serialNumber}</span>
                        <Badge variant={device.connectivity?.isOnline ? "success" : "destructive"}>
                          {device.connectivity?.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Label / Model</p>
                        <p className="text-sm font-medium text-slate-800">
                          {device.labelName || "Unnamed"}{" "}
                          <span className="text-slate-400 text-xs">({device.modelType})</span>
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner</p>
                        <PrivacyNameToggle fullName={device.owner?.name} />
                      </div>
                      {device.connectivity && (
                        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-[10px] space-y-1">
                          <p className="font-black uppercase tracking-widest text-slate-400 mb-1">Connectivity</p>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Uptime</span>
                            <span className="font-semibold text-slate-700">{device.connectivity.totalUptime || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Incidents</span>
                            <span className="font-semibold text-slate-700">{device.connectivity.offlineIncidents ?? "—"}</span>
                          </div>
                          {device.connectivity.lastOnlineAt && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Last seen</span>
                              <span className="font-semibold text-slate-700">
                                {new Date(device.connectivity.lastOnlineAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {device.location?.address && (
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-xs font-semibold text-slate-700 leading-tight">{device.location.address}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-1">
                            <MapPin size={10} className="text-[#195C51]" />
                            {device.location.lat.toFixed(5)}, {device.location.lng.toFixed(5)}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => handleFindInInventory(device.serialNumber)}
                          className="flex-1 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Find in table
                        </button>
                        <button
                          onClick={() => goToUsageHistory(device.serialNumber)}
                          className="flex-1 bg-[#195C51] text-white hover:bg-[#0E3A32] px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1"
                        >
                          <History className="w-3 h-3" /> Usage
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </Card>
      </div>{/* end fullscreen wrapper */}
      {/* Fullscreen backdrop — click to exit */}
      {mapFullscreen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setMapFullscreen(false)}
        />
      )}

      {/* ── Device Inventory Table ─────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Hardware Inventory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {pagination.total} device{pagination.total === 1 ? "" : "s"} · page {pagination.page} of {pagination.totalPages}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search serial, label…"
                  defaultValue={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 w-48 transition-all"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <Select
                  value={filters.sortBy}
                  onChange={(v) => setFilter("sortBy", v)}
                  options={SORT_OPTIONS}
                  className="w-36"
                />
                <button
                  onClick={() => setFilter("order", filters.order === "desc" ? "asc" : "desc")}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:border-[#195C51] hover:text-[#195C51] transition-all"
                  title={filters.order === "desc" ? "Descending" : "Ascending"}
                >
                  {filters.order === "desc"
                    ? <SortDesc className="w-3.5 h-3.5" />
                    : <SortAsc className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all
                  ${showFilters || activeFilterCount > 0
                    ? "bg-[#195C51] text-white border-[#195C51]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#195C51] hover:text-[#195C51]"}`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-white text-[#195C51] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">State</label>
                  <Select value={filters.state} onChange={(v) => setFilter("state", v)} options={STATE_OPTIONS} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Model</label>
                  <Select value={filters.modelType} onChange={(v) => setFilter("modelType", v)} options={MODEL_OPTIONS} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Status</label>
                  <Select value={filters.isEnabled} onChange={(v) => setFilter("isEnabled", v)} options={ENABLED_OPTIONS} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Network</label>
                  <Select value={filters.isOnline} onChange={(v) => setFilter("isOnline", v)} options={ONLINE_OPTIONS} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Ownership</label>
                  <Select value={filters.hasOwner} onChange={(v) => setFilter("hasOwner", v)} options={OWNER_OPTIONS} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Rows / Page</label>
                  <Select
                    value={String(filters.limit)}
                    onChange={(v) => setFilter("limit", Number(v))}
                    options={[
                      { value: "10",  label: "10 per page" },
                      { value: "15",  label: "15 per page" },
                      { value: "25",  label: "25 per page" },
                      { value: "50",  label: "50 per page" },
                    ]}
                  />
                </div>

                {/* Offline incidents range */}
                <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Offline Incidents Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      min={0}
                      value={filters.offlineIncidentsMin}
                      onChange={(e) => setFilter("offlineIncidentsMin", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#195C51]"
                    />
                    <span className="text-slate-400 text-xs shrink-0">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      min={0}
                      value={filters.offlineIncidentsMax}
                      onChange={(e) => setFilter("offlineIncidentsMax", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#195C51]"
                    />
                  </div>
                </div>

                {/* Clear */}
                {activeFilterCount > 0 && (
                  <div className="flex items-end">
                    <button
                      onClick={clearAllFilters}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600 transition-all bg-white"
                    >
                      <X className="w-3.5 h-3.5" /> Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Active filter pills */}
              {activeFilterCount > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {filters.state && (
                    <ActiveFilterPill label={`State: ${filters.state}`} onRemove={() => setFilter("state", "")} />
                  )}
                  {filters.modelType && (
                    <ActiveFilterPill label={`Model: ${filters.modelType}`} onRemove={() => setFilter("modelType", "")} />
                  )}
                  {filters.isEnabled !== "" && (
                    <ActiveFilterPill label={`${filters.isEnabled === "true" ? "Enabled" : "Disabled"}`} onRemove={() => setFilter("isEnabled", "")} />
                  )}
                  {filters.isOnline !== "" && (
                    <ActiveFilterPill label={`${filters.isOnline === "true" ? "Online" : "Offline"}`} onRemove={() => setFilter("isOnline", "")} />
                  )}
                  {filters.hasOwner !== "" && (
                    <ActiveFilterPill label={`${filters.hasOwner === "true" ? "With owner" : "Unowned"}`} onRemove={() => setFilter("hasOwner", "")} />
                  )}
                  {filters.offlineIncidentsMin && (
                    <ActiveFilterPill label={`Incidents ≥ ${filters.offlineIncidentsMin}`} onRemove={() => setFilter("offlineIncidentsMin", "")} />
                  )}
                  {filters.offlineIncidentsMax && (
                    <ActiveFilterPill label={`Incidents ≤ ${filters.offlineIncidentsMax}`} onRemove={() => setFilter("offlineIncidentsMax", "")} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <SortableHeader col="labelName" label="Device" filters={filters} onSort={toggleSort} />
                <SortableHeader col="createdAt" label="State" filters={filters} onSort={toggleSort} />
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Network</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Owner</th>
                <SortableHeader col="offlineIncidents" label="Incidents" filters={filters} onSort={toggleSort} />
                <SortableHeader col="uptimeSeconds" label="Uptime" filters={filters} onSort={toggleSort} />
                <SortableHeader col="eventCount" label="Events" filters={filters} onSort={toggleSort} />
                <SortableHeader col="lastEvent" label="Last Event" filters={filters} onSort={toggleSort} />
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tableLoading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Spinner /> <span className="text-sm">Loading devices…</span>
                    </div>
                  </td>
                </tr>
              ) : remotes.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-10 text-center text-slate-400 text-sm">
                    No devices match your filters.
                  </td>
                </tr>
              ) : remotes.map((device) => (
                <tr
                  id={`row-${device.serialNumber}`}
                  key={device.id}
                  className={`transition-colors ${
                    highlightedRow === device.serialNumber
                      ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {/* Device */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-slate-900 text-xs">{device.serialNumber}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {device.labelName && (
                          <span className="text-xs text-slate-500 flex items-center gap-0.5">
                            <Tag className="w-2.5 h-2.5" /> {device.labelName}
                          </span>
                        )}
                        <Badge variant={device.modelType === "pro" ? "indigo" : device.modelType === "max" ? "purple" : "default"}>
                          {device.modelType}
                        </Badge>
                      </div>
                    </div>
                  </td>

                  {/* State */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1">
                      <Badge variant={device.state === "sold" ? "indigo" : "default"}>
                        {device.state === "sold" ? "Deployed" : "In Stock"}
                      </Badge>
                      {!device.isEnabled && (
                        <Badge variant="warning">Disabled</Badge>
                      )}
                    </div>
                  </td>

                  {/* Network */}
                  <td className="px-5 py-3.5">
                    {device.state === "instore" ? (
                      <span className="text-xs text-slate-400 italic">Not Active</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${device.connectivity?.isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                        <span className={`text-xs font-semibold ${device.connectivity?.isOnline ? "text-emerald-700" : "text-red-700"}`}>
                          {device.connectivity?.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Owner */}
                  <td className="px-5 py-3.5">
                    <PrivacyNameToggle fullName={device.owner?.name} />
                  </td>

                  {/* Incidents */}
                  <td className="px-5 py-3.5">
                    {device.state === "instore" ? (
                      <span className="text-xs text-slate-300">—</span>
                    ) : (
                      <span className={`text-xs font-bold ${
                        (device.connectivity?.offlineIncidents ?? 0) >= 10
                          ? "text-red-600"
                          : (device.connectivity?.offlineIncidents ?? 0) >= 5
                          ? "text-amber-600"
                          : "text-slate-700"
                      }`}>
                        {device.connectivity?.offlineIncidents ?? 0}
                      </span>
                    )}
                  </td>

                  {/* Uptime */}
                  <td className="px-5 py-3.5">
                    {device.state === "instore" ? (
                      <span className="text-xs text-slate-300">—</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">
                          {device.connectivity?.totalUptime || "—"}
                        </span>
                        {device.connectivity?.rangeUptimePct && (
                          <span className="text-[10px] text-slate-400">
                            {device.connectivity.rangeUptimePct} range
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Events */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700">
                        {device.usage?.totalEvents ?? "—"}
                      </span>
                      {device.usage?.rangeEvents !== undefined && (
                        <span className="text-[10px] text-slate-400">
                          {device.usage.rangeEvents} in range
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Last Event */}
                  <td className="px-5 py-3.5">
                    {device.usage?.lastEvent?.at ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600">
                          {new Date(device.usage.lastEvent.at).toLocaleDateString()}
                        </span>
                        {device.usage.lastEvent.buttonLabel && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                            {device.usage.lastEvent.buttonLabel}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {device.state !== "instore" && (
                        <button
                          onClick={() => goToUsageHistory(device.serialNumber)}
                          className="bg-white border border-slate-200 text-slate-600 hover:border-[#195C51] hover:text-[#195C51] p-1.5 rounded-lg text-xs transition-all shadow-sm"
                          title="View usage history"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedRemote(device)}
                        className="bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Settings className="w-3 h-3" /> Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Showing {remotes.length} of {pagination.total} devices
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilter("page", filters.page - 1)}
              className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-600 font-medium px-2">
              {filters.page} / {pagination.totalPages}
            </span>
            <button
              disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilter("page", filters.page + 1)}
              className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* ── Status Dialog (Online / Offline) ───────────────────────────────── */}
      {statusDialog && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setStatusDialog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-5 border-b border-slate-200 flex items-center justify-between ${
              statusDialog === "online" ? "bg-emerald-50/50" : "bg-red-50/50"
            }`}>
              <div className="flex items-center gap-3">
                {statusDialog === "online"
                  ? <Wifi className="w-6 h-6 text-emerald-600" />
                  : <WifiOff className="w-6 h-6 text-red-600" />}
                <div>
                  <h2 className="font-display font-bold text-lg">
                    {statusDialog === "online" ? "Online Devices" : "Offline Devices"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {(statusDialog === "online" ? onlineRemotes : offlineRemotes).length} deployed devices
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusDialog(null)}
                className="p-2 rounded-lg hover:bg-white/70 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(statusDialog === "online" ? onlineRemotes : offlineRemotes).length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No devices in this state.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {(statusDialog === "online" ? onlineRemotes : offlineRemotes).map((device) => (
                    <li key={device.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-mono font-bold text-sm text-slate-900">{device.serialNumber}</span>
                            <Badge variant={statusDialog === "online" ? "success" : "destructive"}>
                              {statusDialog === "online" ? "Online" : "Offline"}
                            </Badge>
                            <Badge variant={device.modelType === "pro" ? "indigo" : device.modelType === "max" ? "purple" : "default"}>
                              {device.modelType}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">{device.labelName || "Unnamed"}</p>
                          <div className="mt-1.5 flex items-center gap-4">
                            <PrivacyNameToggle fullName={device.owner?.name} />
                            {device.connectivity?.offlineIncidents !== undefined && (
                              <span className="text-[10px] text-slate-400">
                                {device.connectivity.offlineIncidents} incidents
                              </span>
                            )}
                            {device.connectivity?.lastOnlineAt && statusDialog === "offline" && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                Last seen {new Date(device.connectivity.lastOnlineAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleFindInInventory(device.serialNumber)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <Search className="w-3.5 h-3.5" /> Find
                          </button>
                          <button
                            onClick={() => goToUsageHistory(device.serialNumber)}
                            className="inline-flex items-center gap-1.5 bg-[#195C51] text-white hover:bg-[#0E3A32] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <History className="w-3.5 h-3.5" /> Usage
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Modal ───────────────────────────────────────────────────── */}
      {selectedRemote && (
        <RemoteDetailsModal
          remote={selectedRemote}
          onClose={() => setSelectedRemote(null)}
          onUpdate={loadGlobalData}
          handleAddHadware={() => {}}
          handleTestingHardware={() => {}}
          handleRemoteStatus={() => {}}
          copyToClipboard={(text) => {
            navigator.clipboard.writeText(text);
            showNotification("Copied to clipboard", "success");
          }}
        />
      )}

      {/* ── Add Remote Modal ─────────────────────────────────────────────────── */}
      <AddRemoteModal
        isOpen={showAddRemote}
        onClose={() => setShowAddRemote(false)}
        onCreated={() => {
          loadGlobalData();
          loadTableData(filters);
        }}
      />
    </div>
  );
}

// ── Sortable Table Header ─────────────────────────────────────────────────────
function SortableHeader({ col, label, filters, onSort }) {
  const active = filters.sortBy === col;
  return (
    <th
      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[#195C51] transition-colors select-none"
      onClick={() => onSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        {active
          ? filters.order === "asc"
            ? <SortAsc className="w-3 h-3 text-[#195C51]" />
            : <SortDesc className="w-3 h-3 text-[#195C51]" />
          : <SortAsc className="w-3 h-3 text-slate-300" />}
      </div>
    </th>
  );
}

// ── Active Filter Pill ────────────────────────────────────────────────────────
function ActiveFilterPill({ label, onRemove }) {
  return (
    <div className="inline-flex items-center gap-1 bg-[#195C51]/10 text-[#195C51] border border-[#195C51]/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
      {label}
      <button onClick={onRemove} className="hover:text-red-600 transition-colors ml-0.5">
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}