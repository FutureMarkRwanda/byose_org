// src/pages/dashboard/DeviceInsights.jsx
import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { 
    MapPin, Activity, Settings, Trash2, Search, Wifi, WifiOff, Box, Package, ChevronLeft, ChevronRight, Eye, EyeOff 
} from "lucide-react";
import { fetchData, deleteData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";
import { useNotification } from "../../context/NotificationContext.jsx";
import RemoteDetailsModal from "../../components/RemoteDetailsModal.jsx";

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

export default function DeviceInsights() {
  const token = returnToken();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  
  // Data States
  const [remotes, setRemotes] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  
  // UI States
  const [trendTime, setTrendTime] = useState(7);
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("all"); 
  const [selectedRemote, setSelectedRemote] = useState(null);
  const [highlightedRow, setHighlightedRow] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    loadTrends();
  }, [trendTime]);

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
    setTrendLoading(true);
    try {
      const res = await fetchData(`${presence_server}/api/admin/analytics-remotes/status-trends?days=${trendTime}`, token);
      if (res.data?.data) {
        setTrendData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load trends", err);
    }
    setTrendLoading(false);
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm("Are you sure you want to permanently remove this device from the inventory? This action cannot be undone.")) return;
    try {
        const res = await deleteData(`${presence_server}/api/remotes/admin/${id}`, token);
        if (!res.error) {
            showNotification("Device removed successfully", "success");
            loadInventory();
        } else {
            showNotification(res.error, "error");
        }
    } catch (err) {
        showNotification("Failed to delete device", "error");
    }
  };

  // --- Accurate Live Counts ---
  const liveOnlineCount = remotes.filter(r => r.state === 'sold' && r.connectivity?.isOnline).length;
  const liveOfflineCount = remotes.filter(r => r.state === 'sold' && !r.connectivity?.isOnline).length;

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

  // Scroll to table logic from Map
  const handleMapPinClick = (serialNumber) => {
      const index = filteredRemotes.findIndex(r => r.serialNumber === serialNumber);
      if (index !== -1) {
          const targetPage = Math.ceil((index + 1) / rowsPerPage);
          setCurrentPage(targetPage);
          setHighlightedRow(serialNumber);
          
          setTimeout(() => {
              const row = document.getElementById(`row-${serialNumber}`);
              if (row) {
                  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => setHighlightedRow(null), 3000);
              }
          }, 200);
      }
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
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
              {[
                { id: 7, label: '7 Days' },
                { id: 30, label: '30 Days' },
                { id: 90, label: '3 Months' },
                { id: 'all', label: 'All Time' }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTrendTime(t.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${trendTime === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t.label}
                </button>
              ))}
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
          <Card className="p-5 flex-1 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Currently Online</p>
            <div className="flex items-center gap-3">
                <Wifi className="w-8 h-8 text-emerald-500" />
                <p className="text-4xl font-bold font-display text-slate-900">{liveOnlineCount}</p>
            </div>
          </Card>

          <Card className="p-5 flex-1 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Currently Offline</p>
            <div className="flex items-center gap-3">
                <WifiOff className="w-8 h-8 text-red-500" />
                <p className="text-4xl font-bold font-display text-slate-900">{liveOfflineCount}</p>
            </div>
          </Card>

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
        <div className="p-5 border-b border-slate-200 bg-white z-10 relative">
          <div className="flex items-center gap-2">
             <MapPin className="w-5 h-5 text-[#195C51]" />
             <h2 className="font-display font-semibold text-lg">Global Deployment Map</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Showing {mapLocations.length} deployed devices with valid GPS coordinates. Click a pin to locate in inventory.</p>
        </div>
        
        <div className="h-[400px] w-full bg-slate-100 z-0">
            {loading ? (
                 <div className="flex h-full items-center justify-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin"></div>
                 </div>
            ) : (
                <MapContainer
                    center={[-1.9441, 30.0619]}
                    zoom={12}
                    style={{ height: "100%", width: "100%", zIndex: 1 }}
                    scrollWheelZoom={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    {mapLocations.map((device) => {
                        // FIXED: No longer expecting coordinates.coordinates array
                        if (!device.location?.lat || !device.location?.lng) return null;
                        
                        const isOnline = device.connectivity?.isOnline;
                        return (
                            <CircleMarker
                                key={device.id}
                                center={[device.location.lat, device.location.lng]}
                                radius={8}
                                pathOptions={{
                                    fillColor: isOnline ? "#10b981" : "#ef4444",
                                    color: "white",
                                    weight: 2,
                                    fillOpacity: 0.9,
                                }}
                                eventHandlers={{
                                    click: () => handleMapPinClick(device.serialNumber),
                                }}
                            >
                                <Popup className="rounded-xl overflow-hidden shadow-xl border-none cursor-pointer">
                                    <div 
                                        className="p-1.5 space-y-2 font-sans min-w-[180px]" 
                                        onClick={() => handleMapPinClick(device.serialNumber)}
                                        title="Click to view in table"
                                    >
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="font-mono text-xs font-bold text-slate-900 hover:text-[#195C51] transition-colors">{device.serialNumber}</span>
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
                                        
                                        {/* --- FIXED LOCATION CARD --- */}
                                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                                            <p className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1">Location Details</p>
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

                                        <p className="text-[9px] text-center text-slate-400 mt-2 font-bold uppercase tracking-widest">Click to scroll to row</p>
                                    </div>
                                </Popup>
                            </CircleMarker>
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
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading inventory...</td></tr>
              ) : paginatedRemotes.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No devices match your filters.</td></tr>
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
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => setSelectedRemote(device)}
                                className="bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <Settings className="w-3.5 h-3.5"/> Manage
                            </button>
                            <button 
                                onClick={() => handleDeleteDevice(device.id)}
                                className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                title="Delete Device"
                            >
                                <Trash2 className="w-4 h-4"/>
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