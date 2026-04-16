// src/pages/dashboard/DeviceInsights.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    MapPin, Activity, Settings, Search, Wifi, WifiOff, Box, Package, ChevronLeft, ChevronRight, Eye, EyeOff,
    X, History, Crosshair, ExternalLink
} from "lucide-react";
import { fetchData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";
import { useNotification } from "../../context/NotificationContext.jsx";
import RemoteDetailsModal from "../../components/RemoteDetailsModal.jsx";

// ── Google-Maps-style drop pin icons ──────────────────────────────────────────
const makePinIcon = (color) => L.divIcon({
  className: "presence-pin",
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <defs>
        <filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.7-6.3-14-14-14z"
            fill="${color}" filter="url(#ds)"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
});
const PIN_ONLINE  = makePinIcon("#10b981");
const PIN_OFFLINE = makePinIcon("#ef4444");

// Helper for imperative map actions (fit bounds / recenter)
const MapController = ({ fitRef }) => {
  const map = useMap();
  useEffect(() => {
    if (fitRef) fitRef.current = (bounds) => {
      if (bounds && bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    };
  }, [fitRef, map]);
  return null;
};

// --- Shadcn-Simulated UI Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    destructive: "bg-red-100 text-red-800 border-red-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${variants[variant]}`}>{children}</span>;
};

// --- Privacy Name Toggle Component ---
export const PrivacyNameToggle = ({ fullName }) => {
  const [revealed, setRevealed] = useState(false);
  
  if (!fullName || fullName === 'Unknown' || fullName === 'Unassigned') {
      return <span className="text-slate-400 italic">Unassigned</span>;
  }

  const parts = fullName.trim().split(/\s+/);
  const masked = parts.length > 1 
      ? `${parts[parts.length - 1]} ${parts[0].charAt(0)}.` 
      : `${fullName.charAt(0)}.`;

  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-[#195C51]">{revealed ? fullName : masked}</span>
      <button 
        onClick={(e) => { e.stopPropagation(); setRevealed(!revealed); }} 
        className="text-slate-400 hover:text-[#195C51] transition-colors p-1 rounded-md hover:bg-slate-100"
        title={revealed ? "Hide Full Name" : "Show Full Name"}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
};

// ── Time-window helpers for the trend chart ──────────────────────────────────
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
      const dow = (now.getDay() + 6) % 7; // Monday = 0
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
    default:
      return null;
  }
};

export default function DeviceInsights() {
  const token = returnToken();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);

  // Data States
  const [remotes, setRemotes] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [trendData, setTrendData] = useState([]);

  // UI States
  const [trendWin, setTrendWin] = useState({ mode: "thisMonth", from: "", to: "" });
  const trendRange = useMemo(() => resolveTrendWindow(trendWin), [trendWin]);

  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [selectedRemote, setSelectedRemote] = useState(null);
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [statusDialog, setStatusDialog] = useState(null); // null | 'online' | 'offline'

  // Map controls
  const fitRef = useRef(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (trendRange) loadTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendRange?.from, trendRange?.to]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetchData(`${presence_server}/api/admin/analytics-remotes?limit=500`, token);
      if (res.data?.success) {
        setRemotes(res.data.remotes);
        setGlobalStats(res.data.globalStats);
      }
    } catch (err) {
      showNotification("Failed to load device inventory", "error");
    }
    setLoading(false);
  };

  const loadTrends = async () => {
    if (!trendRange) return;
    setTrendLoading(true);
    try {
      const { from, to } = trendRange;
      const url = `${presence_server}/api/admin/analytics-remotes/status-trends?from=${from.toISOString()}&to=${to.toISOString()}`;
      const res = await fetchData(url, token);
      if (res.data?.data) setTrendData(res.data.data);
    } catch (err) {
      console.error("Failed to load trends", err);
    }
    setTrendLoading(false);
  };

  // --- Live Counts: prefer server truth when available ---
  const liveOnlineCount  = globalStats?.fleet?.currentlyOnline  ?? remotes.filter(r => r.state === 'sold' && r.connectivity?.isOnline).length;
  const liveOfflineCount = globalStats?.fleet?.currentlyOffline ?? remotes.filter(r => r.state === 'sold' && !r.connectivity?.isOnline).length;
  const deployedRemotes  = useMemo(() => remotes.filter(r => r.state === 'sold'), [remotes]);
  const onlineRemotes    = useMemo(() => deployedRemotes.filter(r => r.connectivity?.isOnline), [deployedRemotes]);
  const offlineRemotes   = useMemo(() => deployedRemotes.filter(r => !r.connectivity?.isOnline), [deployedRemotes]);

  // Filter Logic for Table
  const filteredRemotes = useMemo(() => {
    return remotes.filter(r => {
      const ownerName = r.owner?.name || "";
      const matchesSearch = r.serialNumber.toLowerCase().includes(search.toLowerCase()) || 
                            (r.labelName || "").toLowerCase().includes(search.toLowerCase()) ||
                            ownerName.toLowerCase().includes(search.toLowerCase());
      
      let matchesTab = true;
      if (tableFilter === 'instore') matchesTab = r.state === 'instore';
      if (tableFilter === 'sold') matchesTab = r.state === 'sold';
      if (tableFilter === 'online') matchesTab = r.connectivity?.isOnline === true && r.state === 'sold';
      if (tableFilter === 'offline') matchesTab = r.connectivity?.isOnline === false && r.state === 'sold';

      return matchesSearch && matchesTab;
    });
  }, [remotes, search, tableFilter]);

  const totalPages = Math.ceil(filteredRemotes.length / rowsPerPage);
  const paginatedRemotes = filteredRemotes.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const mapLocations = remotes.filter(r => r.state === 'sold' && r.location?.lat && r.location?.lng);

  // Scroll to table logic from Map / Dialog
  const handleFindInInventory = (serialNumber) => {
      // Close the dialog if open so the user can see the scroll + highlight
      setStatusDialog(null);
      // Make sure the row is visible under the current tab filter
      const row = remotes.find(r => r.serialNumber === serialNumber);
      if (!row) return;
      setTableFilter("all");
      setSearch("");

      const index = remotes.findIndex(r => r.serialNumber === serialNumber);
      if (index !== -1) {
          const targetPage = Math.ceil((index + 1) / rowsPerPage);
          setCurrentPage(targetPage);
          setHighlightedRow(serialNumber);

          setTimeout(() => {
              const el = document.getElementById(`row-${serialNumber}`);
              if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => setHighlightedRow(null), 3000);
              }
          }, 200);
      }
  };

  const goToUsageHistory = (serialNumber) => {
    navigate(`/dashboard/presence-eye-buttons/remote/${serialNumber}`);
  };

  // Auto-fit map to markers when inventory finishes loading or filters change
  useEffect(() => {
    if (!fitRef.current || mapLocations.length === 0) return;
    const bounds = L.latLngBounds(mapLocations.map(d => [d.location.lat, d.location.lng]));
    fitRef.current(bounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remotes]);

  const recenterMap = () => {
    if (!fitRef.current || mapLocations.length === 0) return;
    const bounds = L.latLngBounds(mapLocations.map(d => [d.location.lat, d.location.lng]));
    fitRef.current(bounds);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Device Insights</h1>
        <p className="text-slate-500 text-sm mt-1">Operational intelligence from your deployed hardware fleet.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Dual-Line Chart: Online vs Offline */}
        <Card className="xl:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#195C51]" />
              <div>
                  <h2 className="font-display font-semibold text-lg leading-tight">Deployed Devices Network Health</h2>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Excludes In-Stock Inventory</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
                {[
                  { id: 'today',     label: 'Today'      },
                  { id: 'thisWeek',  label: 'This Week'  },
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'custom',    label: 'Custom'     },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTrendWin(w => ({ ...w, mode: t.id }))}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${trendWin.mode === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {trendWin.mode === 'custom' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="date"
                    value={trendWin.from}
                    max={trendWin.to || toLocalDateStr(new Date())}
                    onChange={(e) => setTrendWin(w => ({ ...w, from: e.target.value }))}
                    className="bg-white border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 outline-none focus:border-[#195C51]"
                  />
                  <span className="text-slate-400">→</span>
                  <input
                    type="date"
                    value={trendWin.to}
                    min={trendWin.from || undefined}
                    max={toLocalDateStr(new Date())}
                    onChange={(e) => setTrendWin(w => ({ ...w, to: e.target.value }))}
                    className="bg-white border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 outline-none focus:border-[#195C51]"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="h-[250px] w-full bg-slate-50/50 rounded-lg border border-slate-100 p-4">
            {trendLoading ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="online" name="Online Devices" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="offline" name="Offline Devices" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm">No trend data available.</div>
            )}
          </div>
        </Card>

        {/* Fleet KPIs */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setStatusDialog('online')}
            disabled={liveOnlineCount === 0}
            className="text-left bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex-1 flex flex-col justify-center relative overflow-hidden group transition-all hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Currently Online</p>
            <div className="flex items-center gap-3">
                <Wifi className="w-8 h-8 text-emerald-500" />
                <p className="text-4xl font-bold font-display text-slate-900">{liveOnlineCount}</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest">Click to see devices</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusDialog('offline')}
            disabled={liveOfflineCount === 0}
            className="text-left bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex-1 flex flex-col justify-center relative overflow-hidden group transition-all hover:border-red-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="absolute right-0 top-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Currently Offline</p>
            <div className="flex items-center gap-3">
                <WifiOff className="w-8 h-8 text-red-500" />
                <p className="text-4xl font-bold font-display text-slate-900">{liveOfflineCount}</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest">Click to see devices</p>
          </button>

          <div className="flex gap-4">
              <Card className="p-4 flex-1 flex flex-col justify-center bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deployed</p>
                    <Package className="w-4 h-4 text-indigo-500"/>
                </div>
                <p className="text-2xl font-bold font-display text-slate-900">{globalStats?.fleet?.sold || 0}</p>
              </Card>
              <Card className="p-4 flex-1 flex flex-col justify-center bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">In Stock</p>
                    <Box className="w-4 h-4 text-amber-500"/>
                </div>
                <p className="text-2xl font-bold font-display text-slate-900">{globalStats?.fleet?.inStore || 0}</p>
              </Card>
          </div>
        </div>
      </div>

      {/* Row 2: Device Location Map */}
      <Card className="overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 bg-white z-10 relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
               <MapPin className="w-5 h-5 text-[#195C51]" />
               <h2 className="font-display font-semibold text-lg">Global Deployment Map</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Showing {mapLocations.length} deployed devices with valid GPS coordinates. Click a pin to locate in inventory.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Online</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Offline</span>
            </div>
            <button
              onClick={recenterMap}
              disabled={mapLocations.length === 0}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Recenter on fleet"
            >
              <Crosshair className="w-3.5 h-3.5" /> Fit to fleet
            </button>
          </div>
        </div>

        <div className="h-[460px] w-full bg-slate-100 z-0 relative">
            {loading ? (
                 <div className="flex h-full items-center justify-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin"></div>
                 </div>
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
                    scrollWheelZoom={true}
                    zoomControl={true}
                >
                    <MapController fitRef={fitRef} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {mapLocations.map((device) => {
                        if (!device.location?.lat || !device.location?.lng) return null;
                        const isOnline = device.connectivity?.isOnline;
                        return (
                            <Marker
                                key={device.id}
                                position={[device.location.lat, device.location.lng]}
                                icon={isOnline ? PIN_ONLINE : PIN_OFFLINE}
                                eventHandlers={{ click: () => handleFindInInventory(device.serialNumber) }}
                            >
                                <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                                    <div className="p-1.5 space-y-2 font-sans min-w-[200px]">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="font-mono text-xs font-bold text-slate-900">{device.serialNumber}</span>
                                            <Badge variant={isOnline ? "success" : "destructive"}>{isOnline ? "Online" : "Offline"}</Badge>
                                        </div>
                                        <div className="space-y-1 pt-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Label / Model</p>
                                            <p className="text-sm font-medium text-slate-800">{device.labelName || 'Unnamed'} <span className="text-slate-400 text-xs">({device.modelType})</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner</p>
                                            <PrivacyNameToggle fullName={device.owner?.name} />
                                        </div>
                                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                                            <p className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1">Location</p>
                                            {device.location?.address ? (
                                                <p className="text-xs font-semibold text-slate-700 leading-tight mb-1.5">{device.location.address}</p>
                                            ) : (
                                                <p className="text-[10px] text-slate-500 italic mb-1.5">Address not configured</p>
                                            )}
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono bg-white px-2 py-1 rounded-md border border-slate-200 w-fit">
                                                <MapPin size={10} className="text-[#195C51]" />
                                                {device.location.lat.toFixed(5)}, {device.location.lng.toFixed(5)}
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 pt-1">
                                            <button
                                                onClick={() => handleFindInInventory(device.serialNumber)}
                                                className="flex-1 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
                                            >
                                                Find in inventory
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
                        );
                    })}
                </MapContainer>
            )}
        </div>
      </Card>

      {/* Row 3: Device Inventory Table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="font-display font-semibold text-lg">Hardware Inventory</h2>
            <p className="text-xs text-slate-500 mt-1">Manage and inspect all system hardware.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'instore', label: 'In Stock' },
                { id: 'sold', label: 'Deployed' },
                { id: 'online', label: 'Live' },
                { id: 'offline', label: 'Down' }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => { setTableFilter(t.id); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 sm:flex-none ${tableFilter === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                type="text" 
                placeholder="Search serial or owner..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 w-full transition-all"
                />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Device Identifier</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Inventory Status</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Network</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Usage History</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading inventory...</td></tr>
              ) : paginatedRemotes.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No devices match your filters.</td></tr>
              ) : paginatedRemotes.map(device => (
                  <tr 
                    id={`row-${device.serialNumber}`}
                    key={device.id} 
                    className={`transition-colors ${highlightedRow === device.serialNumber ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-mono font-bold text-slate-900">{device.serialNumber}</span>
                            <span className="text-xs text-slate-500">{device.labelName || 'No Label'} <span className="uppercase font-bold text-[10px] ml-1">({device.modelType})</span></span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <Badge variant={device.state === 'sold' ? 'indigo' : 'default'}>
                            {device.state === 'sold' ? 'Deployed' : 'In Stock'}
                        </Badge>
                    </td>
                    <td className="px-6 py-4">
                        {device.state === 'instore' ? (
                            <span className="text-xs text-slate-400 italic">Not Active</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${device.connectivity?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className={`text-xs font-semibold ${device.connectivity?.isOnline ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {device.connectivity?.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                        <PrivacyNameToggle fullName={device.owner?.name} />
                    </td>
                    <td className="px-6 py-4">
                        {device.state === 'instore' ? (
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
                                title="Usage history is unavailable for devices still in stock"
                            >
                                <History className="w-3.5 h-3.5" /> N/A
                            </span>
                        ) : (
                            <button
                                onClick={() => goToUsageHistory(device.serialNumber)}
                                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                                <History className="w-3.5 h-3.5" /> View
                                <ExternalLink className="w-3 h-3 opacity-60" />
                            </button>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setSelectedRemote(device)}
                                className="bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <Settings className="w-3.5 h-3.5"/> Manage
                            </button>
                        </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
      </Card>

      {/* Status Dialog — clicking "Currently Online/Offline" card opens this */}
      {statusDialog && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setStatusDialog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-5 border-b border-slate-200 flex items-center justify-between ${statusDialog === 'online' ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
              <div className="flex items-center gap-3">
                {statusDialog === 'online' ? <Wifi className="w-6 h-6 text-emerald-600" /> : <WifiOff className="w-6 h-6 text-red-600" />}
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">
                    {statusDialog === 'online' ? 'Currently Online Devices' : 'Currently Offline Devices'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {(statusDialog === 'online' ? onlineRemotes : offlineRemotes).length} deployed device{(statusDialog === 'online' ? onlineRemotes : offlineRemotes).length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusDialog(null)}
                className="p-2 rounded-lg hover:bg-white/70 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {(statusDialog === 'online' ? onlineRemotes : offlineRemotes).length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No devices in this state.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {(statusDialog === 'online' ? onlineRemotes : offlineRemotes).map((device) => (
                    <li key={device.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Identity */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono font-bold text-sm text-slate-900">{device.serialNumber}</span>
                            <Badge variant={statusDialog === 'online' ? 'success' : 'destructive'}>
                              {statusDialog === 'online' ? 'Online' : 'Offline'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {device.labelName || 'Unnamed'} <span className="uppercase font-bold text-[10px]">({device.modelType})</span>
                          </p>
                          <div className="mt-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Owner</p>
                            <PrivacyNameToggle fullName={device.owner?.name} />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleFindInInventory(device.serialNumber)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <Search className="w-3.5 h-3.5" /> Find in inventory
                          </button>
                          <button
                            onClick={() => goToUsageHistory(device.serialNumber)}
                            className="inline-flex items-center gap-1.5 bg-[#195C51] text-white hover:bg-[#0E3A32] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <History className="w-3.5 h-3.5" /> Usage history
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

      {/* Reused Modal for Management */}
      {selectedRemote && (
        <RemoteDetailsModal
            remote={selectedRemote}
            onClose={() => setSelectedRemote(null)}
            onUpdate={loadInventory}
            handleAddHadware={() => {}} 
            handleTestingHardware={() => {}}
            handleRemoteStatus={() => {}}
            copyToClipboard={(text) => { navigator.clipboard.writeText(text); showNotification("Copied to clipboard", "success"); }} 
        />
      )}

    </div>
  );
}