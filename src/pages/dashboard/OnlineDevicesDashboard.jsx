import { useState, useEffect } from "react";
import { fetchData, returnToken, getOwnerLabel } from "../../utils/helper.js";
import {
  MdWifi,
  MdWifiOff,
  MdRefresh,
  MdErrorOutline,
  MdTrendingUp,
  MdOutlineInventory2,
  MdOutlineTouchApp,
  MdOutlineQueryBuilder,
  MdOutlineSensors,
  MdOutlineHourglassEmpty,
  MdMap,
  MdList,
  MdPinDrop,
} from "react-icons/md";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { presence_server } from "../../config/server_api.js";

const OnlineDevicesDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [investorStats, setInvestorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = returnToken();
      const devicesUrl = `${presence_server}/statistics/recently-online?hours=${hours}`;
      const investorUrl = `${presence_server}/statistics/investor`;

      const [devicesRes, investorRes] = await Promise.all([
        fetchData(devicesUrl, token),
        fetchData(investorUrl, token),
      ]);

      if (devicesRes.error) throw new Error(devicesRes.error);
      if (investorRes.error) throw new Error(investorRes.error);

      setDevices(devicesRes.data.devices || []);
      setInvestorStats(investorRes.data);
    } catch (err) {
      setError(err.message || "Cloud synchronization failed");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000);
    return () => clearInterval(interval);
  }, [hours]);

  const isCurrentlyOnline = (device) => {
    if (!device.lastHeartbeatAt) return false;
    const lastHeartbeat = new Date(device.lastHeartbeatAt);
    return lastHeartbeat >= new Date(Date.now() - 5 * 60 * 1000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-entrance pb-10">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#333333]">
            Network Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Real-time status and geographic distribution of field nodes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Switcher */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 sm:px-6 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === "table"
                  ? "bg-[#195C51] text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <MdList size={16} /> List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 sm:px-6 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === "map"
                  ? "bg-[#195C51] text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <MdMap size={16} /> Map
            </button>
          </div>

          <button
            onClick={loadAnalytics}
            className="p-2.5 sm:p-3 bg-white border border-gray-100 rounded-2xl text-[#195C51] shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 group"
          >
            <MdRefresh
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-2 p-3 sm:p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
          <MdErrorOutline size={18} />
          <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* High-Level KPIs */}
      {investorStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-2">
          <StatCard
            title="Active Fleet"
            value={investorStats.totalSold}
            subtitle="Total provisioned units"
            icon={<MdOutlineInventory2 size={20} />}
          />
          <StatCard
            title="Sync Rate"
            value={`${investorStats.onlineDailyPercent}%`}
            subtitle="Nodes active in last 24h"
            icon={<MdOutlineSensors size={20} />}
            color="text-blue-600"
          />
          <StatCard
            title="Usage Freq."
            value={investorStats.avgInteractionsPerDay}
            subtitle="Avg. commands per day"
            icon={<MdOutlineTouchApp size={20} />}
          />
          <StatCard
            title="Shelfware"
            value={`${investorStats.shelfwarePercent}%`}
            subtitle="Inactive / Unused stock"
            icon={<MdOutlineHourglassEmpty size={20} />}
            color="text-orange-600"
          />
        </div>
      )}

      {/* Main Display: Map or Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 sm:px-4">
          <h2 className="text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <div
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#195C51] ${
                !loading && "animate-pulse"
              }`}
            ></div>
            <span className="hidden sm:inline">Discovery Stream (Last {hours}h)</span>
            <span className="sm:hidden">Last {hours}h</span>
          </h2>
          <select
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="bg-white border-none rounded-xl px-2 sm:px-4 py-2 text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#195C51] shadow-sm outline-none cursor-pointer"
          >
            {[1, 3, 6, 12, 24].map((h) => (
              <option key={h} value={h}>
                {h}h
              </option>
            ))}
          </select>
        </div>

        {viewMode === "map" ? (
          /* GEOGRAPHIC DOT DISTRIBUTION */
          <div className="google-card overflow-hidden h-[350px] sm:h-[500px] lg:h-[600px] mx-2 bg-[#F5F5F5] relative border-none shadow-inner">
            {!loading ? (
              <MapContainer
                center={[-1.9441, 30.0619]}
                zoom={12}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                {devices.map((device) => {
                  const coords = device.location?.coordinates?.coordinates;
                  if (!coords || coords.length < 2) return null;
                  const online = isCurrentlyOnline(device);
                  return (
                    <CircleMarker
                      key={device._id}
                      center={[coords[1], coords[0]]}
                      radius={10}
                      pathOptions={{
                        fillColor: online ? "#10b981" : "#64748b",
                        color: "white",
                        weight: 3,
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-2 min-w-[160px] space-y-2">
                          <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                            <div>
                              <p className="font-black text-[9px] uppercase tracking-widest text-[#195C51]">Serial</p>
                              <p className="font-bold text-gray-800 text-xs">{device.serialNumber}</p>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${online ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                              {online ? "Live" : "Idle"}
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-[9px] uppercase tracking-widest text-gray-400">Owner</p>
                            <p className="font-bold text-gray-700 text-xs">{getOwnerLabel(device.owner)}</p>
                          </div>
                          <div>
                            <p className="font-black text-[9px] uppercase tracking-widest text-gray-400">Location</p>
                            <p className="text-xs text-gray-500">{device.location.address || "Unlabeled"}</p>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#195C51]"></div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#64748b]"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Offline</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DEVICE LIST — Desktop: table, Mobile: cards */
          <div className="mx-2">
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block google-card overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F5F5F5]/60 border-b border-gray-100">
                    <tr>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Node Status</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Hardware Info</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Deployment Location</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Last Interaction</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Cloud Heartbeat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {devices.map((device) => {
                      const online = isCurrentlyOnline(device);
                      return (
                        <tr key={device._id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-5">
                            <div className={`flex items-center gap-3 ${online ? "text-green-600" : "text-gray-300"}`}>
                              <div className={`p-2 rounded-lg ${online ? "bg-green-50" : "bg-gray-50"}`}>
                                {online ? <MdWifi size={18} /> : <MdWifiOff size={18} />}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {online ? "Synced" : "Offline"}
                              </span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-[#333333] text-sm">{device.modelType}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SN: {device.serialNumber}</div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-start gap-3">
                              <MdPinDrop className="text-[#195C51] mt-0.5" size={18} />
                              <div>
                                <div className="text-xs font-bold text-gray-700 max-w-[200px] truncate">
                                  {device.location?.address || "Mobile Node / Unassigned"}
                                </div>
                                <div className="text-[9px] text-gray-400 font-mono">
                                  {device.location?.coordinates?.coordinates
                                    ? `${device.location.coordinates.coordinates[1].toFixed(5)}, ${device.location.coordinates.coordinates[0].toFixed(5)}`
                                    : "Awaiting Fix..."}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <div className="text-xs font-bold text-gray-600">{formatDateLong(device.lastUsedAt)}</div>
                            <div className="text-[9px] text-gray-400 uppercase font-black">Command Logged</div>
                          </td>
                          <td className="p-5 text-right">
                            <span className={`text-xs font-black ${online ? "text-[#195C51]" : "text-gray-400"}`}>
                              {online ? "Active Now" : formatDateShort(device.lastHeartbeatAt)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {devices.length === 0 && !loading && <EmptyState />}
            </div>

            {/* Mobile Cards (hidden on desktop) */}
            <div className="md:hidden space-y-3">
              {devices.length === 0 && !loading && <EmptyState />}
              {devices.map((device) => {
                const online = isCurrentlyOnline(device);
                return (
                  <div key={device._id} className="google-card bg-white p-4 space-y-3">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${online ? "bg-green-50" : "bg-gray-50"}`}>
                          {online
                            ? <MdWifi size={18} className="text-green-600" />
                            : <MdWifiOff size={18} className="text-gray-400" />}
                        </div>
                        <div>
                          <p className="font-bold text-[#333333] text-sm">{device.modelType}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            SN: {device.serialNumber}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        online ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {online ? "Synced" : "Offline"}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2 bg-[#F5F5F5] rounded-xl p-3">
                      <MdPinDrop className="text-[#195C51] mt-0.5 flex-shrink-0" size={16} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate">
                          {device.location?.address || "Mobile Node / Unassigned"}
                        </p>
                        {device.location?.coordinates?.coordinates && (
                          <p className="text-[9px] text-gray-400 font-mono">
                            {device.location.coordinates.coordinates[1].toFixed(4)}, {device.location.coordinates.coordinates[0].toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer timestamps */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-1 border-t border-gray-50">
                      <span>Last used: {formatDateLong(device.lastUsedAt)}</span>
                      <span className={online ? "text-[#195C51]" : ""}>
                        {online ? "Active Now" : formatDateShort(device.lastHeartbeatAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#195C51]"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* Sub-components */
const EmptyState = () => (
  <div className="p-12 sm:p-24 text-center">
    <MdOutlineHourglassEmpty size={40} className="mx-auto text-gray-200 mb-4" />
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
      No devices detected in this window.
    </p>
  </div>
);

const StatCard = ({ title, value, subtitle, icon, color = "text-[#195C51]" }) => (
  <div className="google-card p-4 sm:p-8 group hover:border-[#195C51]/20 transition-all bg-white shadow-sm hover:shadow-xl">
    <div className="flex items-start justify-between">
      <div className="space-y-0.5 sm:space-y-1 min-w-0 mr-2">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 truncate">
          {title}
        </p>
        <h3 className={`text-2xl sm:text-4xl font-bold ${color} tracking-tighter`}>
          {value}
        </h3>
      </div>
      <div className="p-2.5 sm:p-4 rounded-[1rem] sm:rounded-[1.5rem] bg-[#F5F5F5] text-gray-400 group-hover:text-[#195C51] group-hover:bg-[#195C51]/10 transition-all duration-500 flex-shrink-0">
        {icon}
      </div>
    </div>
    <div className="mt-4 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-50">
      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest italic opacity-60 group-hover:opacity-100 transition-opacity truncate">
        "{subtitle}"
      </p>
    </div>
  </div>
);

/* Date Formatting Helpers */
const formatDateShort = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diff = (now - d) / 1000 / 60;
  if (diff < 1) return "Seconds ago";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString();
};

const formatDateLong = (date) => {
  if (!date) return "Never";
  return new Date(date).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default OnlineDevicesDashboard;